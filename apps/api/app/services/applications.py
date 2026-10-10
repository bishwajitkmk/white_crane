"""Directory workflow: application -> Directorate decision -> listing."""

from datetime import timedelta
from typing import Literal

from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy import func, select
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
    # JSON columns need plain values, so the roster's dates go in as ISO strings.
    application = Application(
        **data.model_dump(exclude={"team_members"}),
        team_members=[member.model_dump(mode="json") for member in data.team_members],
    )
    application.log("Submitted by applicant" + (" as an annual renewal" if data.renewal else ""))
    if data.renewal:
        listing = _find_listing(db, data)
        application.renews_listing_id = listing.id if listing else None
        if listing:
            application.log(f"Matched to listing {listing.agency_name}")
        else:
            application.log("No matching listing found; link one before approving")
    tasks.add_task(email.send, "application_received", data.contact_email, application=data)
    application.log("Confirmation email sent")
    db.add(application)
    db.commit()
    return application


def _find_listing(db: Session, data: ApplicationIn) -> Listing | None:
    """The listing a renewal most likely renews: same Team Leader email, else same agency name."""
    by_email = (
        select(Listing)
        .join(Application, Listing.application_id == Application.id)
        .where(func.lower(Application.contact_email) == data.contact_email.lower())
    )
    by_name = select(Listing).where(func.lower(Listing.agency_name) == data.agency_name.strip().lower())
    for stmt in (by_email, by_name):
        if listing := db.scalars(stmt.order_by(Listing.renewal_due_at)).first():
            return listing
    return None


def _check_undecided(application: Application) -> None:
    if application.status in (ApplicationStatus.approved, ApplicationStatus.declined):
        raise HTTPException(status.HTTP_409_CONFLICT, f"Application is already {application.status.value}")


def link_listing(db: Session, application: Application, listing_id, reviewer: User) -> Application:
    """Set (or clear) the listing a renewal renews. Cleared, approving creates a new listing instead."""
    _check_undecided(application)
    listing = db.get(Listing, listing_id) if listing_id else None
    if listing_id and not listing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    application.renews_listing_id = listing.id if listing else None
    application.log(
        f"Linked to listing {listing.agency_name} by {reviewer.name}"
        if listing
        else f"Renewal link cleared by {reviewer.name}; approving will create a new listing"
    )
    db.commit()
    return application


def decide(
    db: Session, application: Application, decision: Decision, note: str, reviewer: User, tasks: BackgroundTasks
) -> Application:
    _check_undecided(application)
    if decision == "request-info" and not note.strip():
        raise HTTPException(422, "Add a note describing what is needed")

    renewing = db.get(Listing, application.renews_listing_id) if application.renews_listing_id else None
    new_status, label = _RESULT[decision]
    if decision == "approve" and renewing:
        label = "Approved and listing renewed"
    application.status = new_status
    application.reviewed_at = utcnow()
    application.reviewed_by_id = reviewer.id
    application.log(f"{label} by {reviewer.name}" + (f". Note: {note}" if note else ""))

    if decision == "approve":
        listing = renewing or Listing()
        if not renewing:
            db.add(listing)
        # A renewal re-points the listing at its new attestation and takes the team's updated public details.
        listing.application = application
        listing.agency_name = application.agency_name
        listing.location = application.location
        listing.website = application.website
        listing.public_contact = application.public_contact
        listing.renewal_due_at = utcnow() + timedelta(days=settings.listing_term_days)
        listing.hidden = False

    db.commit()
    tasks.add_task(
        email.send,
        "application_decision",
        application.contact_email,
        agency_name=application.agency_name,
        decision=decision,
        renewal=renewing is not None,
        note=note,
    )
    return application


def renew(db: Session, listing: Listing) -> Listing:
    """Mark renewed: one year from today, and visible again."""
    listing.renewal_due_at = utcnow() + timedelta(days=settings.listing_term_days)
    listing.hidden = False
    db.commit()
    return listing
