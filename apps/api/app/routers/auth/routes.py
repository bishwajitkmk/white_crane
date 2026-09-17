from datetime import timedelta

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, Response, status
from sqlalchemy import select

from app.core.config import settings
from app.core.deps import CurrentUser, DbSession
from app.core.security import (
    REFRESH_COOKIE,
    clear_auth_cookies,
    decode_token,
    hash_password,
    hash_token,
    new_token,
    set_auth_cookies,
    verify_password,
)
from app.db.base import utcnow
from app.models import Invite, PasswordReset, User, UserStatus
from app.schemas.user import AcceptInviteIn, ForgotIn, InviteInfoOut, LoginIn, ResetIn, UserOut
from app.services import email

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=UserOut)
def login(data: LoginIn, response: Response, db: DbSession):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if not user or user.status != UserStatus.active or not verify_password(data.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email or password is incorrect")
    user.last_sign_in_at = utcnow()
    db.commit()
    set_auth_cookies(response, user.id)
    return user


@router.post("/refresh", response_model=UserOut)
def refresh(request: Request, response: Response, db: DbSession):
    token = request.cookies.get(REFRESH_COOKIE)
    user_id = decode_token(token, "refresh") if token else None
    user = db.get(User, user_id) if user_id else None
    if not user or user.status != UserStatus.active:
        clear_auth_cookies(response)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired")
    set_auth_cookies(response, user.id)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    clear_auth_cookies(response)


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser):
    return user


@router.post("/forgot", status_code=status.HTTP_204_NO_CONTENT)
def forgot(data: ForgotIn, db: DbSession, tasks: BackgroundTasks):
    """Always 204 so the endpoint cannot be used to discover accounts."""
    user = db.scalar(select(User).where(User.email == data.email.lower(), User.status == UserStatus.active))
    if not user:
        return
    raw, token_hash = new_token()
    db.add(
        PasswordReset(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=utcnow() + timedelta(minutes=settings.password_reset_minutes),
        )
    )
    db.commit()
    tasks.add_task(
        email.send, "password_reset", user.email, name=user.name, link=f"{settings.frontend_url}/reset-password/{raw}"
    )


@router.post("/reset", status_code=status.HTTP_204_NO_CONTENT)
def reset(data: ResetIn, db: DbSession):
    reset_row = db.scalar(select(PasswordReset).where(PasswordReset.token_hash == hash_token(data.token)))
    if not reset_row or reset_row.used_at or reset_row.expires_at < utcnow():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This reset link is invalid or has expired")
    reset_row.user.password_hash = hash_password(data.password)
    reset_row.used_at = utcnow()
    db.commit()


def _valid_invite(db: DbSession, token: str) -> Invite:
    invite = db.scalar(select(Invite).where(Invite.token_hash == hash_token(token)))
    if not invite or invite.accepted_at or invite.expires_at < utcnow():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "This invite link is invalid or has expired")
    return invite


@router.get("/invite/{token}", response_model=InviteInfoOut)
def invite_info(token: str, db: DbSession):
    invite = _valid_invite(db, token)
    return InviteInfoOut(
        email=invite.user.email,
        role=invite.user.role,
        invited_by=invite.invited_by.name.split(" ")[0] if invite.invited_by else "White Crane",
    )


@router.post("/accept-invite", response_model=UserOut)
def accept_invite(data: AcceptInviteIn, response: Response, db: DbSession):
    invite = _valid_invite(db, data.token)
    user = invite.user
    user.name = data.name
    user.password_hash = hash_password(data.password)
    user.status = UserStatus.active
    user.last_sign_in_at = utcnow()
    invite.accepted_at = utcnow()
    db.commit()
    set_auth_cookies(response, user.id)
    return user
