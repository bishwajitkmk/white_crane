from fastapi import APIRouter
from sqlalchemy import select

from app.core.deps import DbSession
from app.models import BoardMember
from app.schemas.content import BoardMemberOut, SiteContentOut
from app.services.content import get_content

router = APIRouter()


@router.get("/content", response_model=SiteContentOut)
def content(db: DbSession):
    return get_content(db)


@router.get("/board-members", response_model=list[BoardMemberOut])
def board_members(db: DbSession):
    return db.scalars(select(BoardMember).order_by(BoardMember.position, BoardMember.name)).all()
