import uuid

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from sqlalchemy import select

from app.core.deps import DIRECTORY, CurrentUser, DbSession, require_role
from app.models import Application, ApplicationStatus
from app.schemas.application import ApplicationOut, DecisionIn, RenewalLinkIn
from app.services import applications
from app.services.applications import Decision

router = APIRouter(prefix="/applications", dependencies=[require_role(*DIRECTORY)])


def _get(db: DbSession, application_id: uuid.UUID) -> Application:
    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    return application


@router.get("", response_model=list[ApplicationOut])
def list_applications(db: DbSession, status: ApplicationStatus | None = None):
    stmt = select(Application).order_by(Application.submitted_at)
    if status:
        stmt = stmt.where(Application.status == status)
    return db.scalars(stmt).all()


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
