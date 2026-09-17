import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, IdMixin, utcnow
from app.models.user import User


class Invite(IdMixin, Base):
    __tablename__ = "invites"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    invited_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(default=utcnow)
    expires_at: Mapped[datetime]
    accepted_at: Mapped[datetime | None]

    user: Mapped[User] = relationship(foreign_keys=[user_id], lazy="joined")
    invited_by: Mapped[User | None] = relationship(foreign_keys=[invited_by_id], lazy="joined")
