import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models import ApplicationStatus
from app.schemas.common import ORMModel


class ApplicationIn(BaseModel):
    agency_name: str = Field(min_length=1, max_length=300)
    location: str = Field(min_length=1, max_length=200)
    website: str = Field(default="", max_length=500)
    public_contact: str = Field(min_length=1, max_length=300)
    contact_name: str = Field(min_length=1, max_length=200)
    contact_email: EmailStr
    contact_phone: str = Field(default="", max_length=50)
    attestation_signed_name: str = Field(min_length=1, max_length=200)


class ApplicationReceipt(ORMModel):
    id: uuid.UUID
    contact_email: EmailStr
    submitted_at: datetime


class ActivityEntry(BaseModel):
    at: datetime
    message: str


class ApplicationOut(ORMModel):
    id: uuid.UUID
    agency_name: str
    location: str
    website: str
    public_contact: str
    contact_name: str
    contact_email: str
    contact_phone: str
    attestation_signed_name: str
    attestation_signed_at: datetime
    attestation_version: str
    status: ApplicationStatus
    submitted_at: datetime
    reviewed_at: datetime | None
    activity: list[ActivityEntry]


class DecisionIn(BaseModel):
    note: str = Field(default="", max_length=5000)
