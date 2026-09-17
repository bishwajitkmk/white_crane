import uuid

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import select

from app.core.deps import BOARD, DbSession, require_role
from app.db.base import utcnow
from app.models import Subscriber
from app.schemas.resource import SubscriberOut
from app.services.export import subscribers_csv

router = APIRouter(prefix="/subscribers", dependencies=[require_role(*BOARD)])


@router.get("", response_model=list[SubscriberOut])
def list_subscribers(db: DbSession):
    return db.scalars(select(Subscriber).order_by(Subscriber.subscribed_at.desc())).all()


@router.get("/export.csv")
def export(db: DbSession):
    rows = db.scalars(select(Subscriber).order_by(Subscriber.subscribed_at)).all()
    filename = f"white-crane-subscribers-{utcnow():%Y-%m-%d}.csv"
    return Response(
        subscribers_csv(rows),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.delete("/{subscriber_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(subscriber_id: uuid.UUID, db: DbSession):
    subscriber = db.get(Subscriber, subscriber_id)
    if not subscriber:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Subscriber not found")
    db.delete(subscriber)
    db.commit()
