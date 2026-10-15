import uuid

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from sqlalchemy import func, select

from app.core.deps import DIRECTORY, CurrentUser, DbSession, require_role
from app.models import Application, ApplicationStatus
from app.schemas.application import ApplicationListOut, ApplicationOut, DecisionIn, RenewalLinkIn
from app.schemas.common import Page
from app.services import applications
from app.services.applications import Decision
from app.services.pagination import Paging, contains, paginate

router = APIRouter(prefix="/applications", dependencies=[require_role(*DIRECTORY)])


def _get(db: DbSession, application_id: uuid.UUID) -> Application:
    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    return application


@router.get("", response_model=Page[ApplicationListOut])
def list_applications(db: DbSession, page: Paging, status: ApplicationStatus | None = None, q: str = ""):
    """Oldest first, so the longest-waiting applications lead the queue."""
    stmt = select(Application).order_by(Application.submitted_at, Application.id)
    if status:
        stmt = stmt.where(Application.status == status)
    if q.strip():
        stmt = stmt.where(contains(Application.agency_name, q))
    return paginate(db, stmt, page)


@router.get("/counts", response_model=dict[ApplicationStatus, int])
def counts(db: DbSession, q: str = ""):
    """Applications per status, for the queue tabs."""
    stmt = select(Application.status, func.count()).group_by(Application.status)
    if q.strip():
        stmt = stmt.where(contains(Application.agency_name, q))
    found = dict(db.execute(stmt).tuples().all())
    return {s: found.get(s, 0) for s in ApplicationStatus}


@router.get("/{application_id}", response_model=ApplicationOut)
def read(application_id: uuid.UUID, db: DbSession):
    return _get(db, application_id)


@router.put("/{application_id}/renewal", response_model=ApplicationOut)
def link_listing(application_id: uuid.UUID, data: RenewalLinkIn, db: DbSession, user: CurrentUser):
    """Choose which listing a renewal renews (null: approve as a new listing)."""
    return applications.link_listing(db, _get(db, application_id), data.listing_id, user)


@router.post("/{application_id}/{decision}", response_model=ApplicationOut)
def decide(
    application_id: uuid.UUID,
    decision: Decision,
    data: DecisionIn,
    db: DbSession,
    user: CurrentUser,
    tasks: BackgroundTasks,
):
    """approve (creates the listing) | decline | request-info. The applicant is emailed in each case."""
    return applications.decide(db, _get(db, application_id), decision, data.note, user, tasks)
