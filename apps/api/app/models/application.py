import uuid
from datetime import datetime
from enum import StrEnum

from sqlalchemy import JSON, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IdMixin, utcnow

ATTESTATION_VERSION = "1.0"


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

    # private
    contact_name: Mapped[str] = mapped_column(String(200))
    contact_email: Mapped[str] = mapped_column(String(320))
    contact_phone: Mapped[str] = mapped_column(String(50), default="")

    attestation_signed_name: Mapped[str] = mapped_column(String(200))
    attestation_signed_at: Mapped[datetime] = mapped_column(default=utcnow)
    attestation_version: Mapped[str] = mapped_column(String(20), default=ATTESTATION_VERSION)

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
