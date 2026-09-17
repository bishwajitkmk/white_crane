from datetime import datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IdMixin, utcnow


class Subscriber(IdMixin, Base):
    __tablename__ = "subscribers"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    source: Mapped[str] = mapped_column(String(100), default="")
    subscribed_at: Mapped[datetime] = mapped_column(default=utcnow)
    confirmed: Mapped[bool] = mapped_column(default=False)
    confirm_token_hash: Mapped[str | None] = mapped_column(String(64), index=True)
