import uuid

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from sqlalchemy import select

from app.core.deps import BOARD, CurrentUser, DbSession, require_role
from app.models import Role, User, UserStatus
from app.schemas.user import InviteIn, UserOut, UserUpdate
from app.services.users import send_invite

router = APIRouter(prefix="/users", dependencies=[require_role(*BOARD)])


def _get(db: DbSession, user_id: uuid.UUID) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return user


@router.get("", response_model=list[UserOut])
def list_users(db: DbSession):
    return db.scalars(select(User).order_by(User.name)).all()


@router.post("/invite", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def invite(data: InviteIn, db: DbSession, me: CurrentUser, tasks: BackgroundTasks):
    email = data.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "A user with this email already exists")
    user = User(email=email, name=data.name, role=data.role, status=UserStatus.invited)
    db.add(user)
    db.flush()
    send_invite(db, user, me, tasks)
    return user


@router.post("/{user_id}/resend-invite", status_code=status.HTTP_204_NO_CONTENT)
def resend_invite(user_id: uuid.UUID, db: DbSession, me: CurrentUser, tasks: BackgroundTasks):
    user = _get(db, user_id)
    if user.status != UserStatus.invited:
        raise HTTPException(status.HTTP_409_CONFLICT, "User has already accepted their invite")
    send_invite(db, user, me, tasks)


@router.patch("/{user_id}", response_model=UserOut)
def update(user_id: uuid.UUID, data: UserUpdate, db: DbSession, me: CurrentUser):
    user = _get(db, user_id)
    if user.id == me.id and data.role and data.role != Role.board:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ask another Board member to change your role")
    for key, value in data.model_dump(exclude_unset=True, exclude_none=True).items():
        setattr(user, key, value)
    db.commit()
    return user
