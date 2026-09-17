from fastapi import APIRouter, HTTPException
from sqlalchemy import or_, select

from app.core.deps import DbSession
from app.db.base import utcnow
from app.models import Training, TrainingStatus
from app.schemas.training import TrainingOut

router = APIRouter(prefix="/trainings")


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
    found = db.scalar(select(Training).where(Training.slug == slug))
    if not found:
        raise HTTPException(404, "Training not found")
    return found
