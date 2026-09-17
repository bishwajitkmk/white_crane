"""Directory workflow: application -> Directorate decision -> listing."""

from datetime import timedelta
from typing import Literal

from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import utcnow
from app.models import Application, ApplicationStatus, Listing, User
from app.schemas.application import ApplicationIn
from app.services import email

Decision = Literal["approve", "decline", "request-info"]

_RESULT = {
    "approve": (ApplicationStatus.approved, "Approved and listing published"),
    "decline": (ApplicationStatus.declined, "Declined"),
    "request-info": (ApplicationStatus.info_requested, "More information requested"),
}


def submit(db: Session, data: ApplicationIn, tasks: BackgroundTasks) -> Application:
    application = Application(**data.model_dump())
    application.log("Submitted by applicant")
    tasks.add_task(email.send, "application_received", data.contact_email, application=data)
    application.log("Confirmation email sent")
    db.add(application)
    db.commit()
    return application


def decide(
    db: Session, application: Application, decision: Decision, note: str, reviewer: User, tasks: BackgroundTasks
) -> Application:
    if application.status in (ApplicationStatus.approved, ApplicationStatus.declined):
        raise HTTPException(status.HTTP_409_CONFLICT, f"Application is already {application.status.value}")
    if decision == "request-info" and not note.strip():
        raise HTTPException(422, "Add a note describing what is needed")

    new_status, label = _RESULT[decision]
    application.status = new_status
    application.reviewed_at = utcnow()
    application.reviewed_by_id = reviewer.id
    application.log(f"{label} by {reviewer.name}" + (f". Note: {note}" if note else ""))

    if decision == "approve":
        db.add(
            Listing(
                application_id=application.id,
                agency_name=application.agency_name,
                location=application.location,
                website=application.website,
                public_contact=application.public_contact,
                renewal_due_at=utcnow() + timedelta(days=settings.listing_term_days),
            )
        )

    db.commit()
    tasks.add_task(
        email.send,
        "application_decision",
        application.contact_email,
        agency_name=application.agency_name,
        decision=decision,
        note=note,
    )
    return application


def renew(db: Session, listing: Listing) -> Listing:
    """Mark renewed: one year from today, and visible again."""
    listing.renewal_due_at = utcnow() + timedelta(days=settings.listing_term_days)
    listing.hidden = False
    db.commit()
    return listing
