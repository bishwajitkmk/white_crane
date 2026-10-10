import uuid
from datetime import date, datetime
from typing import Annotated

from pydantic import BaseModel, EmailStr, Field, StringConstraints, model_validator

from app.attestation import PRACTICE_ITEMS, RESIDENTIAL_ITEMS, required_items
from app.models import ApplicationStatus
from app.schemas.common import ORMModel

Service = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
Comment = Annotated[str, Field(default="", max_length=5000)]


class TeamMember(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    affiliation: str = Field(min_length=1, max_length=300)
    email: EmailStr
    joined_on: date


class ApplicationIn(BaseModel):
    agency_name: str = Field(min_length=1, max_length=300)
    location: str = Field(min_length=1, max_length=200)
    website: str = Field(default="", max_length=500)
    public_contact: str = Field(min_length=1, max_length=300)
    contact_name: str = Field(min_length=1, max_length=200)
    contact_email: EmailStr
    contact_phone: str = Field(default="", max_length=50)
    program_address: str = Field(default="", max_length=500)
    services: list[Service] = Field(min_length=1, max_length=20)
    team_members: list[TeamMember] = Field(min_length=1, max_length=100)
    first_consultation_on: date
    residential: bool
    renewal: bool = False
    answers: dict[str, bool]
    comments_residential: Comment
    comments_practices: Comment
    additional_info: Comment
    attestation_signed_name: str = Field(min_length=1, max_length=200)
    attestation_signed_title: str = Field(min_length=1, max_length=200)
    # Honeypot: hidden in the form, so only bots fill it. Never stored.
    nickname: str = Field(default="", exclude=True)

    @model_validator(mode="after")
    def _check_attestation(self) -> "ApplicationIn":
        required = required_items(self.residential)
        missing = [item for item in required if item not in self.answers]
        if missing:
            raise ValueError(f"Answer every attestation item. Missing: {', '.join(missing)}")
        # Drop anything not asked, e.g. residential answers left over after switching to "No".
        self.answers = {item: self.answers[item] for item in required}

        for items, comment, section in (
            (RESIDENTIAL_ITEMS, self.comments_residential, "Residential and Inpatient Programs"),
            (PRACTICE_ITEMS, self.comments_practices, "Program Practices"),
        ):
            if any(self.answers.get(item) is False for item in items) and not comment.strip():
                raise ValueError(f'Explain each "No" answer in the {section} comments')
        if not self.residential:
            self.comments_residential = ""
        return self


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
    program_address: str
    services: list[str]
    team_members: list[dict]
    first_consultation_on: date | None
    residential: bool
    renewal: bool
    renews_listing_id: uuid.UUID | None
    answers: dict[str, bool]
    comments_residential: str
    comments_practices: str
    additional_info: str
    attestation_signed_name: str
    attestation_signed_title: str
    attestation_signed_at: datetime
    attestation_version: str
    status: ApplicationStatus
    submitted_at: datetime
    reviewed_at: datetime | None
    activity: list[ActivityEntry]


class RenewalLinkIn(BaseModel):
    """The listing a renewal application renews; null treats it as a new listing."""

    listing_id: uuid.UUID | None


class DecisionIn(BaseModel):
    note: str = Field(default="", max_length=5000)
