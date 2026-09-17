from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.core.security import hash_password, verify_password
from app.models import User
from app.schemas.user import PasswordChange, ProfileUpdate, UserOut

# Any signed-in role.
router = APIRouter(prefix="/account")


@router.patch("", response_model=UserOut)
def update_profile(data: ProfileUpdate, db: DbSession, me: CurrentUser):
    email = data.email.lower()
    if email != me.email and db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "That email is already in use")
    me.name, me.email = data.name, email
    db.commit()
    return me


@router.post("/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(data: PasswordChange, db: DbSession, me: CurrentUser):
    if not verify_password(data.current, me.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect")
    me.password_hash = hash_password(data.password)
    db.commit()
