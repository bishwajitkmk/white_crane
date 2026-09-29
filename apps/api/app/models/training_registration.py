import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IdMixin, utcnow


class TrainingRegistration(IdMixin, Base):
    """A sign-up through the built-in registration form (trainings without an external registration_url)."""

    __tablename__ = "training_registrations"
    __table_args__ = (UniqueConstraint("training_id", "email"),)

    training_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trainings.id", ondelete="CASCADE"), index=True)
    full_name: Mapped[str] = mapped_column(String(200))
    # Stored lowercased so one person cannot take two seats with different casing.
    email: Mapped[str] = mapped_column(String(320))
    phone: Mapped[str] = mapped_column(String(50), default="")
    organization: Mapped[str] = mapped_column(String(300), default="")
    role: Mapped[str] = mapped_column(String(200), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    registered_at: Mapped[datetime] = mapped_column(default=utcnow)
