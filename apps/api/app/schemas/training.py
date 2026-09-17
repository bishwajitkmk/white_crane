import uuid
from datetime import UTC, datetime

from pydantic import BaseModel, Field, field_validator

from app.models import TrainingFormat, TrainingStatus
from app.schemas.common import ORMModel


class TrainingIn(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    slug: str = Field(pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$", max_length=200)
    status: TrainingStatus
    format: TrainingFormat
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    expected_label: str = ""
    trainers: str = ""
    description: str = ""
    objectives: str = ""
    agenda: str = ""
    registration_url: str | None = Field(default=None, pattern=r"^https?://", max_length=1000)
    cover_image_url: str | None = None

    @field_validator("starts_at", "ends_at")
    @classmethod
    def naive(cls, v: datetime | None) -> datetime | None:
        # Event times are wall-clock times as entered by the trainer; aware values are normalised to UTC.
        return v.astimezone(UTC).replace(tzinfo=None) if v and v.tzinfo else v


class TrainingOut(ORMModel):
    id: uuid.UUID
    slug: str
    title: str
    status: TrainingStatus
    format: TrainingFormat
    starts_at: datetime | None
    ends_at: datetime | None
    expected_label: str
    trainers: str
    description: str
    objectives: str
    agenda: str
    registration_url: str | None
    cover_image_url: str | None
