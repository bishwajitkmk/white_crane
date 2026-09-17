from datetime import datetime
from enum import StrEnum

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IdMixin, TimestampMixin


class Role(StrEnum):
    board = "board"
    trainer = "trainer"
    directorate = "directorate"


class UserStatus(StrEnum):
    active = "active"
    invited = "invited"


class User(IdMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    role: Mapped[Role] = mapped_column(Enum(Role, native_enum=False, length=20))
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus, native_enum=False, length=20), default=UserStatus.invited
    )
    password_hash: Mapped[str | None] = mapped_column(String(200))
    last_sign_in_at: Mapped[datetime | None]
