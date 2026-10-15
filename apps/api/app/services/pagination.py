from typing import Annotated, Any

from fastapi import Depends, Query
from sqlalchemy import ColumnElement, Select, func, select
from sqlalchemy.orm import Session


class PageParams:
    """`?limit=&offset=` for dashboard and directory lists."""

    def __init__(self, limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0)):
        self.limit = limit
        self.offset = offset


Paging = Annotated[PageParams, Depends()]


def paginate(db: Session, stmt: Select, page: PageParams) -> dict[str, Any]:
    """Runs `stmt` for one page plus a count of all its rows (ordering dropped for the count)."""
    total = db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery())) or 0
    items = db.scalars(stmt.limit(page.limit).offset(page.offset)).unique().all()
    return {"items": items, "total": total}


def like_literal(text: str) -> str:
    """Escapes LIKE wildcards so the user's % and _ match literally. Pair with escape="\\"."""
    return text.strip().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def contains(column: ColumnElement[str], text: str) -> ColumnElement[bool]:
    """Case-insensitive substring match."""
    return column.ilike(f"%{like_literal(text)}%", escape="\\")
