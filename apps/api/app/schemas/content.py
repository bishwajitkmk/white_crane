import uuid

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class SiteContentOut(BaseModel):
    hero_headline: str = "Advancing DBT fidelity through training and community"
    hero_subheading: str = ""
    hero_cta_label: str = "Browse Trainings"
    hero_image_url: str | None = None
    mission: str = ""
    vision: str = ""
    values: str = ""


CONTENT_KEYS = tuple(SiteContentOut.model_fields)


class SiteContentUpdate(BaseModel):
    hero_headline: str | None = None
    hero_subheading: str | None = None
    hero_cta_label: str | None = None
    hero_image_url: str | None = None
    mission: str | None = None
    vision: str | None = None
    values: str | None = None


class BoardMemberOut(ORMModel):
    id: uuid.UUID
    name: str
    role: str
    bio: str
    photo_url: str | None
    position: int


class BoardMemberIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    role: str = ""
    bio: str = ""
    photo_url: str | None = None


class ReorderIn(BaseModel):
    ids: list[uuid.UUID]
