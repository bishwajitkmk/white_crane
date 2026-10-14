from enum import StrEnum

from sqlalchemy import Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IdMixin, TimestampMixin


class MemberKind(StrEnum):
    """Which public page the person appears on: About (board) or Trainers."""

    board = "board"
    trainer = "trainer"


class BoardMember(IdMixin, TimestampMixin, Base):
    __tablename__ = "board_members"

    kind: Mapped[MemberKind] = mapped_column(
        Enum(MemberKind, native_enum=False, length=20), default=MemberKind.board, server_default="board", index=True
    )
    name: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(200), default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    photo_url: Mapped[str | None] = mapped_column(String(1000))
    position: Mapped[int] = mapped_column(default=0)
