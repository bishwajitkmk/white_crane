import uuid
from datetime import timedelta
from typing import Literal

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import DIRECTORY, DbSession, require_role
from app.db.base import utcnow
from app.models import Listing
from app.schemas.listing import ListingOut, ListingUpdate
from app.services import applications

router = APIRouter(prefix="/listings", dependencies=[require_role(*DIRECTORY)])


def _get(db: DbSession, listing_id: uuid.UUID) -> Listing:
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    return listing


@router.get("", response_model=list[ListingOut])
def list_listings(db: DbSession, renewal: Literal["next_30", "next_90", "overdue"] | None = None):
    now = utcnow()
    stmt = select(Listing).order_by(Listing.renewal_due_at)
    if renewal == "overdue":
        stmt = stmt.where(Listing.renewal_due_at < now)
    elif renewal:
        days = 30 if renewal == "next_30" else 90
        stmt = stmt.where(Listing.renewal_due_at.between(now, now + timedelta(days=days)))
    return db.scalars(stmt).all()


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
