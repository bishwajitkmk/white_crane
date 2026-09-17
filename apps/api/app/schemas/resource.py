import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models import ResourceCategory, ResourceKind
from app.schemas.common import ORMModel


class ResourceIn(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    description: str = ""
    category: ResourceCategory
    kind: ResourceKind
    url: str = Field(min_length=1, max_length=1000)
    file_size_bytes: int | None = None


class ResourceOut(ORMModel):
    id: uuid.UUID
    title: str
    description: str
    category: ResourceCategory
    kind: ResourceKind
    url: str
    file_size_bytes: int | None
    updated_at: datetime


class PresignIn(BaseModel):
    filename: str = Field(min_length=1, max_length=300)
    content_type: str = "application/octet-stream"


class PresignOut(BaseModel):
    upload_url: str
    public_url: str


class SubscribeIn(BaseModel):
    email: EmailStr
    source: str = Field(default="", max_length=100)


class SubscriberOut(ORMModel):
    id: uuid.UUID
    email: str
    subscribed_at: datetime
    source: str
    confirmed: bool
