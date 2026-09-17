from datetime import timedelta

from fastapi import APIRouter
from sqlalchemy import func, select

from app.core.deps import BOARD, DbSession, require_role
from app.db.base import utcnow
from app.models import Application, ApplicationStatus, Listing, Subscriber, Training, TrainingStatus
from app.schemas.summary import DashboardSummary

router = APIRouter(dependencies=[require_role(*BOARD)])


@router.get("/summary", response_model=DashboardSummary)
def summary(db: DbSession):
    now = utcnow()
    count = lambda stmt: db.scalar(select(func.count()).select_from(stmt.subquery())) or 0  # noqa: E731

    pending = select(Application.id).where(Application.status == ApplicationStatus.pending)
    return DashboardSummary(
        pending_applications=count(pending),
        pending_over_7_days=count(pending.where(Application.submitted_at < now - timedelta(days=7))),
        renewals_due_60_days=count(
            select(Listing.id).where(Listing.renewal_due_at.between(now, now + timedelta(days=60)))
        ),
        upcoming_trainings_30_days=count(
            select(Training.id).where(
                Training.status == TrainingStatus.open, Training.starts_at.between(now, now + timedelta(days=30))
            )
        ),
        subscribers=count(select(Subscriber.id)),
        subscribers_this_month=count(
            select(Subscriber.id).where(Subscriber.subscribed_at >= now.replace(day=1, hour=0, minute=0, second=0))
        ),
        recent_applications=db.scalars(select(Application).order_by(Application.submitted_at.desc()).limit(5)).all(),
    )
