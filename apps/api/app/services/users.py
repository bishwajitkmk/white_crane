from datetime import timedelta

from fastapi import BackgroundTasks
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import new_token
from app.db.base import utcnow
from app.models import Invite, PasswordReset, User
from app.services import email


def expire_invites(db: Session, user: User) -> None:
    """Unaccepted invite links for this user stop working (flushed with the caller's commit)."""
    db.execute(
        update(Invite).where(Invite.user_id == user.id, Invite.accepted_at.is_(None)).values(expires_at=utcnow())
    )


def expire_password_resets(db: Session, user: User) -> None:
    """Unused reset links for this user stop working (flushed with the caller's commit)."""
    db.execute(
        update(PasswordReset)
        .where(PasswordReset.user_id == user.id, PasswordReset.used_at.is_(None))
        .values(expires_at=utcnow())
    )


def send_invite(db: Session, user: User, invited_by: User | None, tasks: BackgroundTasks) -> str:
    """Creates a one-time invite link (expires in 7 days) and emails it. Returns the raw token.

    Resending replaces the previous link: older unaccepted invites for the user stop working.
    """
    expire_invites(db, user)
    raw, token_hash = new_token()
    db.add(
        Invite(
            user_id=user.id,
            invited_by_id=invited_by.id if invited_by else None,
            token_hash=token_hash,
            expires_at=utcnow() + timedelta(days=settings.invite_expiry_days),
        )
    )
    db.commit()
    tasks.add_task(
        email.send,
        "invite",
        user.email,
        name=user.name,
        role=user.role.value,
        invited_by=invited_by.name if invited_by else "White Crane",
        link=f"{settings.frontend_url}/invite/{raw}",
    )
    return raw
