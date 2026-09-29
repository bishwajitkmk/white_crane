import logging
import uuid

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.deps import TRAININGS, CurrentUser, DbSession, require_role
from app.db.base import utcnow
from app.models import Training
from app.schemas.training import AdminTrainingOut, RegistrationOut, TrainingIn
from app.services.export import registrations_csv

router = APIRouter(prefix="/trainings", dependencies=[require_role(*TRAININGS)])
log = logging.getLogger(__name__)


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


def _saved(db: DbSession, training: Training) -> Training:
    _commit(db)
    db.refresh(training)  # reload registration_count
    return training


@router.get("", response_model=list[AdminTrainingOut])
def list_trainings(db: DbSession):
    return db.scalars(select(Training).order_by(Training.starts_at.desc().nulls_first())).all()


@router.get("/{training_id}", response_model=AdminTrainingOut)
def read(training_id: uuid.UUID, db: DbSession):
    return _get(db, training_id)


@router.post("", response_model=AdminTrainingOut, status_code=status.HTTP_201_CREATED)
def create(data: TrainingIn, db: DbSession):
    training = Training(**data.model_dump())
    db.add(training)
    return _saved(db, training)


@router.patch("/{training_id}", response_model=AdminTrainingOut)
def update(training_id: uuid.UUID, data: TrainingIn, db: DbSession):
    training = _get(db, training_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(training, key, value)
    return _saved(db, training)


@router.delete("/{training_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(training_id: uuid.UUID, db: DbSession):
    db.delete(_get(db, training_id))
    db.commit()


@router.get("/{training_id}/registrations", response_model=list[RegistrationOut])
def list_registrations(training_id: uuid.UUID, db: DbSession):
    return _get(db, training_id).registrations


@router.get("/{training_id}/registrations/export.csv")
def export_registrations(training_id: uuid.UUID, db: DbSession, me: CurrentUser):
    training = _get(db, training_id)
    rows = training.registrations
    # Audit trail for personal data leaving the system (Architecture section 9).
    log.info("Registrations for %s exported by %s <%s>: %d rows", training.slug, me.name, me.email, len(rows))
    filename = f"registrations-{training.slug}-{utcnow():%Y-%m-%d}.csv"
    return Response(
        registrations_csv(rows),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.delete("/{training_id}/registrations/{registration_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_registration(training_id: uuid.UUID, registration_id: uuid.UUID, db: DbSession):
    training = _get(db, training_id)
    registration = next((r for r in training.registrations if r.id == registration_id), None)
    if not registration:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Registration not found")
    training.registrations.remove(registration)  # delete-orphan
    db.commit()
