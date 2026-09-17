from datetime import datetime
from enum import StrEnum

from sqlalchemy import Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IdMixin, TimestampMixin


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
    registration_url: Mapped[str | None] = mapped_column(String(1000))
    cover_image_url: Mapped[str | None] = mapped_column(String(1000))
