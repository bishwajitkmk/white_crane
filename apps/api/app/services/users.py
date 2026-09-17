from datetime import timedelta

from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import new_token
from app.db.base import utcnow
from app.models import Invite, User
from app.services import email


def send_invite(db: Session, user: User, invited_by: User | None, tasks: BackgroundTasks) -> str:
    """Creates a one-time invite link (expires in 7 days) and emails it. Returns the raw token."""
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
