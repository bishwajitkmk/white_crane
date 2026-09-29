from datetime import datetime
from enum import StrEnum

from sqlalchemy import Enum, String, Text, func, select
from sqlalchemy.orm import Mapped, column_property, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin, utcnow
from app.models.training_registration import TrainingRegistration


class TrainingStatus(StrEnum):
    open = "open"
    upcoming = "upcoming"


class TrainingFormat(StrEnum):
    online = "online"
    in_person = "in_person"


class Training(IdMixin, TimestampMixin, Base):
    __tablename__ = "trainings"

    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(300))
    status: Mapped[TrainingStatus] = mapped_column(Enum(TrainingStatus, native_enum=False, length=20))
    format: Mapped[TrainingFormat] = mapped_column(Enum(TrainingFormat, native_enum=False, length=20))
    starts_at: Mapped[datetime | None]
    ends_at: Mapped[datetime | None]
    expected_label: Mapped[str] = mapped_column(String(100), default="")
    trainers: Mapped[str] = mapped_column(String(500), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    objectives: Mapped[str] = mapped_column(Text, default="")
    agenda: Mapped[str] = mapped_column(Text, default="")
    # External registration page. When empty, the site's built-in registration form is used.
    registration_url: Mapped[str | None] = mapped_column(String(1000))
    # Seats for built-in registration; None means unlimited.
    capacity: Mapped[int | None]
    cover_image_url: Mapped[str | None] = mapped_column(String(1000))

    registrations: Mapped[list[TrainingRegistration]] = relationship(
        cascade="all, delete-orphan", order_by=TrainingRegistration.registered_at
    )
    # registration_count: column_property attached below, once Training.id exists.

    @property
    def is_full(self) -> bool:
        return self.capacity is not None and self.registration_count >= self.capacity

    @property
    def has_ended(self) -> bool:
        end = self.ends_at or self.starts_at
        return end is not None and end < utcnow()

    @property
    def accepting_registrations(self) -> bool:
        """True when the built-in form should take sign-ups."""
        return (
            self.status == TrainingStatus.open and not self.registration_url and not self.has_ended and not self.is_full
        )


Training.registration_count = column_property(  # type: ignore[assignment]
    select(func.count(TrainingRegistration.id))
    .where(TrainingRegistration.training_id == Training.id)
    .correlate_except(TrainingRegistration)
    .scalar_subquery()
)
