from fastapi import APIRouter, BackgroundTasks, status
from sqlalchemy import select

from app.core.deps import DbSession
from app.db.base import utcnow
from app.models import Listing
from app.schemas.application import ApplicationIn, ApplicationReceipt
from app.schemas.listing import PublicListingOut
from app.services import applications

router = APIRouter()


@router.get("/directory", response_model=list[PublicListingOut])
def directory(db: DbSession, q: str = "", location: str = ""):
    """Approved teams that are not hidden and not past their renewal date."""
    stmt = (
        select(Listing)
        .where(Listing.hidden.is_(False), Listing.renewal_due_at >= utcnow())
        .order_by(Listing.agency_name)
    )
    if q:
        stmt = stmt.where(Listing.agency_name.ilike(f"%{q}%"))
    if location:
        stmt = stmt.where(Listing.location.ilike(f"%{location}%"))
    return db.scalars(stmt).all()


@router.post("/applications", response_model=ApplicationReceipt, status_code=status.HTTP_201_CREATED)
def apply(data: ApplicationIn, db: DbSession, tasks: BackgroundTasks):
    return applications.submit(db, data, tasks)
