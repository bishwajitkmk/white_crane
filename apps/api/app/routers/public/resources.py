from fastapi import APIRouter, BackgroundTasks, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select

from app.core.config import settings
from app.core.deps import DbSession
from app.core.security import hash_token, new_token
from app.models import Resource, Subscriber
from app.schemas.resource import ResourceOut, SubscribeIn
from app.services import email

router = APIRouter()


@router.get("/resources", response_model=list[ResourceOut])
def resources(db: DbSession):
    return db.scalars(select(Resource).order_by(Resource.category, Resource.title)).all()


@router.post("/subscribe", status_code=status.HTTP_202_ACCEPTED)
def subscribe(data: SubscribeIn, db: DbSession, tasks: BackgroundTasks):
    """Idempotent: re-subscribing an existing address only re-sends the confirmation if still unconfirmed."""
    email_addr = data.email.lower()
    subscriber = db.scalar(select(Subscriber).where(Subscriber.email == email_addr))
    if subscriber and subscriber.confirmed:
        return {"status": "subscribed"}
    raw, token_hash = new_token()
    if not subscriber:
        subscriber = Subscriber(email=email_addr, source=data.source)
        db.add(subscriber)
    subscriber.confirm_token_hash = token_hash
    db.commit()
    link = f"{settings.api_url}/public/subscribe/confirm/{raw}"
    tasks.add_task(email.send, "subscribe_confirm", email_addr, link=link)
    return {"status": "pending_confirmation"}


@router.get("/subscribe/confirm/{token}", include_in_schema=False)
def confirm_subscription(token: str, db: DbSession):
    subscriber = db.scalar(select(Subscriber).where(Subscriber.confirm_token_hash == hash_token(token)))
    if subscriber:
        subscriber.confirmed = True
        subscriber.confirm_token_hash = None
        db.commit()
    return RedirectResponse(f"{settings.frontend_url}/subscribed")
