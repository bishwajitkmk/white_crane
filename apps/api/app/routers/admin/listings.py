import uuid
from datetime import timedelta
from typing import Literal

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import distinct, func, or_, select
from sqlalchemy.orm import joinedload

from app.core.deps import DIRECTORY, DbSession, require_role
from app.db.base import utcnow
from app.models import Application, Listing
from app.schemas.common import Page
from app.schemas.listing import ListingOut, ListingStats, ListingUpdate
from app.services import applications
from app.services.pagination import Paging, contains, like_literal, paginate

router = APIRouter(prefix="/listings", dependencies=[require_role(*DIRECTORY)])

# ListingOut shows two fields of the application behind each listing; join only those.
WITH_ATTESTATION = joinedload(Listing.application).load_only(
    Application.contact_email, Application.attestation_signed_at
)


def _get(db: DbSession, listing_id: uuid.UUID) -> Listing:
    listing = db.get(Listing, listing_id, options=[WITH_ATTESTATION])
    if not listing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    return listing


def _state(location: str) -> str:
    return location.rsplit(",", 1)[-1].strip()


@router.get("", response_model=Page[ListingOut])
def list_listings(
    db: DbSession,
    page: Paging,
    q: str = "",
    state: str = "",
    renewal: Literal["next_30", "next_90", "overdue"] | None = None,
):
    now = utcnow()
    stmt = select(Listing).options(WITH_ATTESTATION).order_by(Listing.renewal_due_at, Listing.id)
    if renewal == "overdue":
        stmt = stmt.where(Listing.renewal_due_at < now)
    elif renewal:
        days = 30 if renewal == "next_30" else 90
        stmt = stmt.where(Listing.renewal_due_at.between(now, now + timedelta(days=days)))
    if q.strip():
        stmt = stmt.where(contains(Listing.agency_name, q))
    if state.strip():
        s = like_literal(state)
        stmt = stmt.where(
            or_(
                func.lower(Listing.location) == s.lower(),
                Listing.location.ilike(f"%,{s}", escape="\\"),
                Listing.location.ilike(f"%, {s}", escape="\\"),
            )
        )
    return paginate(db, stmt, page)


@router.get("/stats", response_model=ListingStats)
def stats(db: DbSession):
    public = db.scalar(select(func.count()).where(Listing.hidden.is_(False), Listing.renewal_due_at >= utcnow()))
    locations = db.scalars(select(distinct(Listing.location))).all()
    return ListingStats(public=public or 0, states=sorted({_state(loc) for loc in locations} - {""}))


@router.get("/{listing_id}", response_model=ListingOut)
def read(listing_id: uuid.UUID, db: DbSession):
    return _get(db, listing_id)


@router.patch("/{listing_id}", response_model=ListingOut)
def update(listing_id: uuid.UUID, data: ListingUpdate, db: DbSession):
    listing = _get(db, listing_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        if key == "renewal_due_at" and value is not None:
            value = value.replace(tzinfo=None)
        setattr(listing, key, value)
    db.commit()
    return listing


@router.post("/{listing_id}/renew", response_model=ListingOut)
def renew(listing_id: uuid.UUID, db: DbSession):
    return applications.renew(db, _get(db, listing_id))
