"""Built-in training registration: public sign-up with a confirmation email."""

from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Training, TrainingFormat, TrainingRegistration, TrainingStatus
from app.schemas.training import RegistrationIn
from app.services import email


def _when(training: Training) -> str:
    if not training.starts_at:
        return training.expected_label or "Date to be announced"
    when = f"{training.starts_at:%A %d %B %Y, %H:%M}"
    if training.ends_at:
        when += f" to {training.ends_at:%H:%M}"
    return when


def _closed_reason(training: Training) -> str | None:
    if training.registration_url:
        return "This training takes registrations on an external page."
    if training.status != TrainingStatus.open or training.has_ended:
        return "Registration for this training is closed."
    if training.is_full:
        return "This training is fully booked."
    return None


def register(db: Session, training: Training, data: RegistrationIn, tasks: BackgroundTasks) -> None:
    address = data.email.lower()
    existing = db.scalar(
        select(TrainingRegistration).where(
            TrainingRegistration.training_id == training.id, TrainingRegistration.email == address
        )
    )
    # Registering twice is not an error (people lose confirmation emails); it keeps one seat and re-sends
    # the confirmation. Answering the same way also avoids revealing who else has registered.
    if not existing:
        db.refresh(training, ["registration_count"])  # count seats now, not when the training was loaded
        if reason := _closed_reason(training):
            raise HTTPException(status.HTTP_409_CONFLICT, reason)
        db.add(TrainingRegistration(training_id=training.id, **data.model_dump(exclude={"email"}), email=address))
        try:
            db.commit()
        except IntegrityError:  # same email submitted twice at once
            db.rollback()
        db.expire(training, ["registration_count", "registrations"])

    tasks.add_task(
        email.send,
        "training_registration",
        address,
        name=data.full_name,
        training_title=training.title,
        when=_when(training),
        format="Online" if training.format == TrainingFormat.online else "In person",
        link=f"{settings.frontend_url}/trainings/{training.slug}",
    )
