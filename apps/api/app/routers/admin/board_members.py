import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

from app.core.deps import BOARD, DbSession, require_role
from app.models import BoardMember
from app.schemas.content import BoardMemberIn, BoardMemberOut, ReorderIn

router = APIRouter(prefix="/board-members", dependencies=[require_role(*BOARD)])


def _get(db: DbSession, member_id: uuid.UUID) -> BoardMember:
    member = db.get(BoardMember, member_id)
    if not member:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Board member not found")
    return member


@router.get("", response_model=list[BoardMemberOut])
def list_members(db: DbSession):
    return db.scalars(select(BoardMember).order_by(BoardMember.position)).all()


@router.post("", response_model=BoardMemberOut, status_code=status.HTTP_201_CREATED)
def create(data: BoardMemberIn, db: DbSession):
    position = (db.scalar(select(func.max(BoardMember.position))) or 0) + 1
    member = BoardMember(**data.model_dump(), position=position)
    db.add(member)
    db.commit()
    return member


@router.patch("/{member_id}", response_model=BoardMemberOut)
def update(member_id: uuid.UUID, data: BoardMemberIn, db: DbSession):
    member = _get(db, member_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(member, key, value)
    db.commit()
    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(member_id: uuid.UUID, db: DbSession):
    db.delete(_get(db, member_id))
    db.commit()


@router.post("/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder(data: ReorderIn, db: DbSession):
    for position, member_id in enumerate(data.ids):
        _get(db, member_id).position = position
    db.commit()
