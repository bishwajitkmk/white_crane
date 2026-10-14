import uuid

from pydantic import BaseModel, Field

from app import client_content as copy
from app.models import MemberKind
from app.schemas.common import ORMModel


class SiteContentOut(BaseModel):
    """Every editable text block. Defaults are the Board's own copy, shown until Administrators change it."""

    hero_headline: str = "Advancing DBT fidelity through training and community"
    hero_subheading: str = (
        "White Crane Training Collective offers high-quality Dialectical Behavior Therapy training "
        "and maintains a directory of teams practicing DBT with fidelity."
    )
    hero_cta_label: str = "Browse Trainings"
    hero_image_url: str | None = None
    about_intro: str = copy.ABOUT_INTRO
    mission: str = copy.MISSION
    what_we_do: str = copy.WHAT_WE_DO
    who_we_serve: str = copy.WHO_WE_SERVE
    how_we_work: str = copy.HOW_WE_WORK
    values: str = copy.VALUES
    about_closing: str = copy.ABOUT_CLOSING
    trainer_credentials: str = copy.TRAINER_CREDENTIALS


CONTENT_KEYS = tuple(SiteContentOut.model_fields)


class SiteContentUpdate(BaseModel):
    hero_headline: str | None = None
    hero_subheading: str | None = None
    hero_cta_label: str | None = None
    hero_image_url: str | None = None
    about_intro: str | None = None
    mission: str | None = None
    what_we_do: str | None = None
    who_we_serve: str | None = None
    how_we_work: str | None = None
    values: str | None = None
    about_closing: str | None = None
    trainer_credentials: str | None = None


class BoardMemberOut(ORMModel):
    id: uuid.UUID
    kind: MemberKind
    name: str
    role: str
    bio: str
    photo_url: str | None
    position: int


class BoardMemberIn(BaseModel):
    kind: MemberKind = MemberKind.board
    name: str = Field(min_length=1, max_length=200)
    role: str = ""
    bio: str = ""
    photo_url: str | None = None


class ReorderIn(BaseModel):
    ids: list[uuid.UUID]
