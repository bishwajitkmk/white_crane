import uuid
from datetime import date, datetime
from enum import StrEnum

from sqlalchemy import JSON, Enum, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.attestation import ATTESTATION_VERSION
from app.db.base import Base, IdMixin, utcnow


class ApplicationStatus(StrEnum):
    pending = "pending"
    approved = "approved"
    declined = "declined"
    info_requested = "info_requested"


class Application(IdMixin, Base):
    __tablename__ = "applications"

    # public if approved
    agency_name: Mapped[str] = mapped_column(String(300))
    location: Mapped[str] = mapped_column(String(200))
    website: Mapped[str] = mapped_column(String(500), default="")
    public_contact: Mapped[str] = mapped_column(String(300))

    # private. The contact person is the DBT Team Leader.
    contact_name: Mapped[str] = mapped_column(String(200))
    contact_email: Mapped[str] = mapped_column(String(320))
    contact_phone: Mapped[str] = mapped_column(String(50), default="")
    program_address: Mapped[str] = mapped_column(Text, default="")
    services: Mapped[list[str]] = mapped_column(JSON, default=list)
    # [{"name", "affiliation", "email", "joined_on"}]
    team_members: Mapped[list[dict]] = mapped_column(JSON, default=list)
    first_consultation_on: Mapped[date | None]
    residential: Mapped[bool] = mapped_column(default=False)

    # Attestation of DBT Practice: {item id: True for Yes / False for No}, see app.attestation
    answers: Mapped[dict[str, bool]] = mapped_column(JSON, default=dict)
    comments_residential: Mapped[str] = mapped_column(Text, default="")
    comments_practices: Mapped[str] = mapped_column(Text, default="")
    additional_info: Mapped[str] = mapped_column(Text, default="")

    attestation_signed_name: Mapped[str] = mapped_column(String(200))
    attestation_signed_title: Mapped[str] = mapped_column(String(200), default="")
    attestation_signed_at: Mapped[datetime] = mapped_column(default=utcnow)
    attestation_version: Mapped[str] = mapped_column(String(20), default=ATTESTATION_VERSION)

    # Annual renewal: teams re-attest each year. renews_listing_id is the listing it renews, matched on submit
    # and correctable by the Directorate. No FK: listings already reference applications, and are never deleted.
    renewal: Mapped[bool] = mapped_column(default=False)
    renews_listing_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, index=True)

    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, native_enum=False, length=20), default=ApplicationStatus.pending, index=True
    )
    submitted_at: Mapped[datetime] = mapped_column(default=utcnow)
    reviewed_at: Mapped[datetime | None]
    reviewed_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))

    # [{"at": iso, "message": str}] - append-only audit trail shown on the review screen
    activity: Mapped[list[dict]] = mapped_column(JSON, default=list)

    def log(self, message: str) -> None:
        # Reassign so SQLAlchemy notices the JSON change.
        self.activity = [*(self.activity or []), {"at": utcnow().isoformat(), "message": message}]
