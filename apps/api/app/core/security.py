import hashlib
import secrets
import uuid
from datetime import timedelta
from typing import Literal

import bcrypt
import jwt
from fastapi import Response

from app.core.config import settings
from app.db.base import utcnow

ACCESS_COOKIE = "wc_access"
REFRESH_COOKIE = "wc_refresh"
ALGORITHM = "HS256"

TokenType = Literal["access", "refresh"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str | None) -> bool:
    if not password_hash:
        return False
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_token(user_id: uuid.UUID, kind: TokenType) -> str:
    lifetime = (
        timedelta(minutes=settings.access_token_minutes)
        if kind == "access"
        else timedelta(days=settings.refresh_token_days)
    )
    payload = {"sub": str(user_id), "type": kind, "exp": utcnow() + lifetime}
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_token(token: str, kind: TokenType) -> uuid.UUID | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
    if payload.get("type") != kind:
        return None
    return uuid.UUID(payload["sub"])


def set_auth_cookies(response: Response, user_id: uuid.UUID) -> None:
    common = {"httponly": True, "secure": settings.cookie_secure, "samesite": settings.cookie_samesite}
    response.set_cookie(
        ACCESS_COOKIE, create_token(user_id, "access"), max_age=settings.access_token_minutes * 60, path="/", **common
    )
    response.set_cookie(
        REFRESH_COOKIE,
        create_token(user_id, "refresh"),
        max_age=settings.refresh_token_days * 86400,
        path="/auth",
        **common,
    )


def clear_auth_cookies(response: Response) -> None:
    # Attributes must match the ones used when setting, or browsers keep SameSite=None cookies.
    common = {"httponly": True, "secure": settings.cookie_secure, "samesite": settings.cookie_samesite}
    response.delete_cookie(ACCESS_COOKIE, path="/", **common)
    response.delete_cookie(REFRESH_COOKIE, path="/auth", **common)


def create_upload_token(key: str, content_type: str) -> str:
    """Short-lived signature for a local-storage PUT, standing in for an S3 presigned URL."""
    payload = {"key": key, "ct": content_type, "type": "upload", "exp": utcnow() + timedelta(minutes=15)}
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_upload_token(token: str) -> tuple[str, str] | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
    if payload.get("type") != "upload":
        return None
    return payload["key"], payload["ct"]


def new_token() -> tuple[str, str]:
    """One-time token for invites / resets / subscribe confirmation. Returns (raw, sha256 hash)."""
    raw = secrets.token_urlsafe(32)
    return raw, hash_token(raw)


def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()
