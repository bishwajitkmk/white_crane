"""Future phase: automated renewal reminder emails (out of scope for v1, PRD section 1).

Intended to run daily from a scheduler (cron / Railway / Fly machine):
    uv run python -m app.jobs.renewal_reminders

For now it only prints which listings are due so the Directorate can contact teams manually.
"""

from datetime import timedelta

from sqlalchemy import select

from app.db.base import utcnow
from app.db.session import SessionLocal
from app.models import Listing


def due_listings(days: int = 30) -> list[Listing]:
    now = utcnow()
    with SessionLocal() as db:
        stmt = select(Listing).where(Listing.renewal_due_at.between(now, now + timedelta(days=days)))
        return list(db.scalars(stmt))


if __name__ == "__main__":
    for listing in due_listings():
        print(f"{listing.renewal_due_at:%Y-%m-%d}  {listing.agency_name}  {listing.contact_email}")
