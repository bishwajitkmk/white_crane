import logging

from fastapi import APIRouter, BackgroundTasks, status

from app.core.config import settings
from app.core.rate_limit import rate_limit
from app.schemas.contact import TOPIC_LABELS, ContactIn
from app.services import email

router = APIRouter()
log = logging.getLogger(__name__)


@router.post("/contact", status_code=status.HTTP_202_ACCEPTED, dependencies=[rate_limit("contact", 5, 3600)])
def contact(data: ContactIn, tasks: BackgroundTasks):
    """Website contact form: emailed to CONTACT_EMAIL with Reply-To set to the visitor. Nothing is stored."""
    if data.nickname:
        # Honeypot filled: same response as a real message, nothing sent.
        log.info("Dropped contact message with honeypot filled (%s)", data.email)
        return {"status": "sent"}
    topic = TOPIC_LABELS[data.topic]
    tasks.add_task(
        email.send,
        "contact_message",
        settings.contact_email,
        subject=f"Website message: {topic} from {data.name}",
        reply_to=data.email,
        name=data.name,
        email=data.email,
        organization=data.organization,
        topic=topic,
        message=data.message,
    )
    return {"status": "sent"}
