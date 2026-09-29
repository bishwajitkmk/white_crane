import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from sqlalchemy import or_, select

from app.core.deps import DbSession
from app.core.rate_limit import rate_limit
from app.db.base import utcnow
from app.models import Training, TrainingStatus
from app.schemas.training import RegistrationIn, RegistrationReceipt, TrainingOut
from app.services import registrations

router = APIRouter(prefix="/trainings")
log = logging.getLogger(__name__)


def _by_slug(db: DbSession, slug: str) -> Training:
    found = db.scalar(select(Training).where(Training.slug == slug))
    if not found:
        raise HTTPException(404, "Training not found")
    return found


@router.get("", response_model=list[TrainingOut])
def open_trainings(db: DbSession):
    """Open for registration and not yet finished, soonest first."""
    now = utcnow()
    stmt = (
        select(Training)
        .where(Training.status == TrainingStatus.open)
        .where(or_(Training.ends_at.is_(None), Training.ends_at >= now))
        .order_by(Training.starts_at)
    )
    return db.scalars(stmt).all()


@router.get("/upcoming", response_model=list[TrainingOut])
def upcoming_trainings(db: DbSession):
    stmt = select(Training).where(Training.status == TrainingStatus.upcoming).order_by(Training.created_at)
    return db.scalars(stmt).all()


@router.get("/{slug}", response_model=TrainingOut)
def training(slug: str, db: DbSession):
    return _by_slug(db, slug)


@router.post(
    "/{slug}/registrations",
    response_model=RegistrationReceipt,
    status_code=status.HTTP_201_CREATED,
    dependencies=[rate_limit("registrations", 10, 3600)],
)
def register(slug: str, data: RegistrationIn, db: DbSession, tasks: BackgroundTasks):
    found = _by_slug(db, slug)
    if data.nickname:
        # Honeypot filled: look successful so the bot moves on, but store and send nothing.
        log.info("Dropped training registration with honeypot filled (%s)", data.email)
    else:
        registrations.register(db, found, data, tasks)
    return RegistrationReceipt(email=data.email, training_title=found.title)
