import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.deps import TRAININGS, DbSession, require_role
from app.models import Training
from app.schemas.training import TrainingIn, TrainingOut

router = APIRouter(prefix="/trainings", dependencies=[require_role(*TRAININGS)])


def _get(db: DbSession, training_id: uuid.UUID) -> Training:
    training = db.get(Training, training_id)
    if not training:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Training not found")
    return training


def _commit(db: DbSession) -> None:
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Another training already uses this slug") from e


@router.get("", response_model=list[TrainingOut])
def list_trainings(db: DbSession):
    return db.scalars(select(Training).order_by(Training.starts_at.desc().nulls_first())).all()


@router.get("/{training_id}", response_model=TrainingOut)
def read(training_id: uuid.UUID, db: DbSession):
    return _get(db, training_id)


@router.post("", response_model=TrainingOut, status_code=status.HTTP_201_CREATED)
def create(data: TrainingIn, db: DbSession):
    training = Training(**data.model_dump())
    db.add(training)
    _commit(db)
    return training


@router.patch("/{training_id}", response_model=TrainingOut)
def update(training_id: uuid.UUID, data: TrainingIn, db: DbSession):
    training = _get(db, training_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(training, key, value)
    _commit(db)
    return training


@router.delete("/{training_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(training_id: uuid.UUID, db: DbSession):
    db.delete(_get(db, training_id))
    db.commit()
