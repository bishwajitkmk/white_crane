from enum import StrEnum

from sqlalchemy import BigInteger, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IdMixin, TimestampMixin


class ResourceCategory(StrEnum):
    forms = "forms"
    reading = "reading"
    links = "links"
    for_teams = "for_teams"


class ResourceKind(StrEnum):
    file = "file"
    link = "link"


class Resource(IdMixin, TimestampMixin, Base):
    __tablename__ = "resources"

    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[ResourceCategory] = mapped_column(Enum(ResourceCategory, native_enum=False, length=20))
    kind: Mapped[ResourceKind] = mapped_column(Enum(ResourceKind, native_enum=False, length=10))
    url: Mapped[str] = mapped_column(String(1000))
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger)
