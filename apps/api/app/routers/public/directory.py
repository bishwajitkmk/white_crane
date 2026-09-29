import logging
import uuid

from fastapi import APIRouter, BackgroundTasks, status
from sqlalchemy import select

from app.core.deps import DbSession
from app.core.rate_limit import rate_limit
from app.db.base import utcnow
from app.models import Listing
from app.schemas.application import ApplicationIn, ApplicationReceipt
from app.schemas.listing import PublicListingOut
from app.services import applications

router = APIRouter()
log = logging.getLogger(__name__)


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


@router.post(
    "/applications",
    response_model=ApplicationReceipt,
    status_code=status.HTTP_201_CREATED,
    dependencies=[rate_limit("applications", 5, 3600)],
)
def apply(data: ApplicationIn, db: DbSession, tasks: BackgroundTasks):
    if data.nickname:
        # Honeypot filled: look successful so the bot moves on, but store and send nothing.
        log.info("Dropped application with honeypot filled (%s)", data.contact_email)
        return ApplicationReceipt(id=uuid.uuid4(), contact_email=data.contact_email, submitted_at=utcnow())
    return applications.submit(db, data, tasks)
