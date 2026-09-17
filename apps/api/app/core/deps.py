from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.security import ACCESS_COOKIE, decode_token
from app.db.session import SessionLocal
from app.models import Role, User, UserStatus


def get_db() -> Iterator[Session]:
    with SessionLocal() as db:
        yield db


DbSession = Annotated[Session, Depends(get_db)]


def current_user(request: Request, db: DbSession) -> User:
    token = request.cookies.get(ACCESS_COOKIE)
    user_id = decode_token(token, "access") if token else None
    user = db.get(User, user_id) if user_id else None
    if not user or user.status != UserStatus.active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not signed in")
    return user


CurrentUser = Annotated[User, Depends(current_user)]


def require_role(*roles: Role):
    """Router / route dependency: `dependencies=[require_role(Role.board)]`."""

    def check(user: CurrentUser) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Your role cannot access this area")
        return user

    return Depends(check)


BOARD = (Role.board,)
TRAININGS = (Role.board, Role.trainer)
DIRECTORY = (Role.board, Role.directorate)
