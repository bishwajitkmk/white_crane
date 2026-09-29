import uuid
from datetime import UTC, datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

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
    capacity: int | None = Field(default=None, ge=1, le=100_000)
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
    capacity: int | None
    cover_image_url: str | None
    is_full: bool
    accepting_registrations: bool


class AdminTrainingOut(TrainingOut):
    """Sign-up numbers stay in the dashboard."""

    registration_count: int


class RegistrationIn(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: str = Field(default="", max_length=50)
    organization: str = Field(default="", max_length=300)
    role: str = Field(default="", max_length=200)
    notes: str = Field(default="", max_length=2000)
    # Honeypot, see ApplicationIn.nickname.
    nickname: str = Field(default="", exclude=True)


class RegistrationReceipt(BaseModel):
    email: EmailStr
    training_title: str


class RegistrationOut(ORMModel):
    id: uuid.UUID
    training_id: uuid.UUID
    full_name: str
    email: str
    phone: str
    organization: str
    role: str
    notes: str
    registered_at: datetime
