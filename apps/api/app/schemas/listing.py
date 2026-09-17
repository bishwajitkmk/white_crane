import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class PublicListingOut(ORMModel):
    id: uuid.UUID
    agency_name: str
    location: str
    website: str
    public_contact: str
    published_at: datetime


class ListingOut(PublicListingOut):
    application_id: uuid.UUID
    contact_email: str
    renewal_due_at: datetime
    hidden: bool


class ListingUpdate(BaseModel):
    agency_name: str | None = Field(default=None, min_length=1, max_length=300)
    location: str | None = Field(default=None, min_length=1, max_length=200)
    website: str | None = None
    public_contact: str | None = None
    renewal_due_at: datetime | None = None
    hidden: bool | None = None
