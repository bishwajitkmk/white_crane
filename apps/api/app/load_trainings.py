"""Post the Board's training schedule (app/client_content.py TRAININGS) to a database.

    uv run python -m app.load_trainings

Trainings are matched by slug: existing ones get the schedule's title and dates, and its status and registration
link where it has one (an open training or a link set in the dashboard is kept; description, trainers, format
and the rest stay as edited there). Missing ones are added. The
demo placeholders from app.seed_demo are removed, unless someone has registered for one. Safe to re-run.
"""

from datetime import date, datetime, time

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.client_content import TRAININGS
from app.db.session import SessionLocal
from app.models import Training, TrainingFormat, TrainingStatus
from app.seed_demo import OPEN_TRAININGS, UPCOMING_TRAININGS

DEMO_SLUGS = {row[0] for row in OPEN_TRAININGS + UPCOMING_TRAININGS}
# Used only when adding a training: the schedule doesn't say. Change per training in the dashboard.
DEFAULT_FORMAT = TrainingFormat.in_person


def load(db: Session) -> tuple[int, int, int]:
    added = updated = removed = 0
    for demo in db.scalars(select(Training).where(Training.slug.in_(DEMO_SLUGS))):
        if demo.registration_count == 0:
            db.delete(demo)
            removed += 1

    existing = {t.slug: t for t in db.scalars(select(Training).where(Training.slug.in_([r[0] for r in TRAININGS])))}
    for slug, title, status, dates, first, last, url in TRAININGS:
        training = existing.get(slug)
        if training is None:
            training = Training(slug=slug, format=DEFAULT_FORMAT)
            db.add(training)
            added += 1
        else:
            updated += 1
        training.title, training.expected_label = title, dates
        training.starts_at = datetime.combine(date.fromisoformat(first), time(0, 0))
        training.ends_at = datetime.combine(date.fromisoformat(last), time(23, 59))
        # Never undo a training a trainer already opened in the dashboard, or drop a link they entered.
        if training.status != TrainingStatus.open:
            training.status = TrainingStatus(status)
        training.registration_url = url or training.registration_url
    return added, updated, removed


def main() -> None:
    with SessionLocal() as db:
        added, updated, removed = load(db)
        db.commit()
    print(f"Trainings: {added} added, {updated} updated, {removed} demo placeholders removed.")


if __name__ == "__main__":
    main()
