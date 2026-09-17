import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models import Role, UserStatus
from app.schemas.common import ORMModel


class UserOut(ORMModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    role: Role
    status: UserStatus
    last_sign_in_at: datetime | None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str
    password: str = Field(min_length=10)


class InviteInfoOut(BaseModel):
    email: EmailStr
    role: Role
    invited_by: str


class AcceptInviteIn(BaseModel):
    token: str
    name: str = Field(min_length=1, max_length=200)
    password: str = Field(min_length=10)


class InviteIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    role: Role


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    role: Role | None = None


class ProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr


class PasswordChange(BaseModel):
    current: str
    password: str = Field(min_length=10)
