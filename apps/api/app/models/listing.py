import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, TimestampMixin, utcnow
from app.models.application import Application


class Listing(IdMixin, TimestampMixin, Base):
    """Created 1:1 when an application is approved. Hidden automatically once renewal_due_at passes; never deleted."""

    __tablename__ = "listings"

    application_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("applications.id"), unique=True)
    agency_name: Mapped[str] = mapped_column(String(300))
    location: Mapped[str] = mapped_column(String(200), index=True)
    website: Mapped[str] = mapped_column(String(500), default="")
    public_contact: Mapped[str] = mapped_column(String(300), default="")
    published_at: Mapped[datetime] = mapped_column(default=utcnow)
    renewal_due_at: Mapped[datetime] = mapped_column(index=True)
    hidden: Mapped[bool] = mapped_column(default=False)

    application: Mapped[Application] = relationship(lazy="joined")

    @property
    def contact_email(self) -> str:
        return self.application.contact_email
