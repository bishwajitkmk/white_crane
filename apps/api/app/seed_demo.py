"""Fill an empty database with the same placeholder content the wireframes / mock mode show.

    uv run python -m app.seed_demo

Safe to re-run: does nothing if any training already exists. Everything it creates is editable
(or deletable) from the dashboard. Registration URLs are left empty on purpose: they must be the
real event pages on the client's registration platform, entered by a trainer.
"""

from datetime import timedelta

from sqlalchemy import select

from app.db.base import utcnow
from app.db.session import SessionLocal
from app.models import (
    Application,
    ApplicationStatus,
    BoardMember,
    Listing,
    SiteContent,
    Training,
    TrainingFormat,
    TrainingStatus,
)

CONTENT = {
    "hero_headline": "Advancing DBT fidelity through training and community",
    "hero_subheading": (
        "White Crane Training Collective offers high-quality Dialectical Behavior Therapy training "
        "and maintains a directory of teams practicing DBT with fidelity."
    ),
    "hero_cta_label": "Browse Trainings",
    "mission": "Mission text. Editable from Landing content in the dashboard.",
    "vision": "Vision text. Editable from Landing content in the dashboard.",
    "values": "Values text. Editable from Landing content in the dashboard.",
}

BOARD = [
    ("Ronda Oswalt Reitz", "Founder, LCSW"),
    ("Member Name", "Role / credentials"),
    ("Member Name", "Role / credentials"),
    ("Member Name", "Role / credentials"),
]

LOREM = "Rich text block managed from the dashboard training editor."

# (slug, title, format, days from today, start hour, hours, trainers)
OPEN_TRAININGS = [
    ("dbt-skills-intensive", "DBT Skills Intensive", TrainingFormat.online, 20, 9, 7, "J. Doe"),
    ("chain-analysis-workshop", "Chain Analysis Workshop", TrainingFormat.in_person, 39, 9, 7, "A. Smith"),
    ("dbt-team-consultation", "DBT Team Consultation Basics", TrainingFormat.online, 55, 9, 4, "J. Doe, A. Smith"),
]
UPCOMING_TRAININGS = [
    ("adolescent-dbt-overview", "Adolescent DBT Overview", TrainingFormat.online, "Spring 2027"),
    ("dbt-for-substance-use", "DBT for Substance Use", TrainingFormat.in_person, "Summer 2027"),
]

# (agency, location, website, public contact, contact name, contact email, status, days ago submitted)
APPLICATIONS = [
    ("Riverbend DBT Team", "Portland, OR", "https://riverbend.org", "intake@riverbend.org", "Dana Lee",
     "dana@riverbend.org", ApplicationStatus.pending, 12),
    ("Harbor Health", "Seattle, WA", "https://harbor.org", "admin@harbor.org", "Sam Ortiz",
     "admin@harbor.org", ApplicationStatus.pending, 16),
    ("Cedar Counseling", "Boise, ID", "https://cedar.org", "info@cedar.org", "Lee Park",
     "info@cedar.org", ApplicationStatus.pending, 23),
    ("Northside Clinic", "Denver, CO", "https://northside.org", "intake@northside.org", "Dana Lee",
     "dana@northside.org", ApplicationStatus.info_requested, 14),
    ("Lakeside Behavioral", "Madison, WI", "https://lakeside.org", "hello@lakeside.org", "Pat Kim",
     "ops@lakeside.org", ApplicationStatus.approved, 200),
    ("Summit DBT", "Salt Lake City, UT", "https://summitdbt.org", "(801) 555 0199", "Alex Morgan",
     "team@summitdbt.org", ApplicationStatus.approved, 250),
]  # fmt: skip


def main() -> None:
    with SessionLocal() as db:
        if db.scalar(select(Training.id).limit(1)):
            print("Database already has trainings; demo seed skipped.")
            return
        now = utcnow().replace(minute=0, second=0, microsecond=0)
        today = now.replace(hour=0)

        for key, value in CONTENT.items():
            db.merge(SiteContent(key=key, value=value))

        for position, (name, role) in enumerate(BOARD):
            db.add(BoardMember(name=name, role=role, bio="Short bio, two to three lines.", position=position))

        for slug, title, fmt, days, hour, hours, trainers in OPEN_TRAININGS:
            starts = today + timedelta(days=days, hours=hour)
            db.add(
                Training(
                    slug=slug, title=title, status=TrainingStatus.open, format=fmt, trainers=trainers,
                    starts_at=starts, ends_at=starts + timedelta(hours=hours),
                    description=LOREM, objectives=LOREM, agenda=LOREM,
                )
            )  # fmt: skip
        for slug, title, fmt, label in UPCOMING_TRAININGS:
            db.add(
                Training(
                    slug=slug, title=title, status=TrainingStatus.upcoming, format=fmt, trainers="TBD",
                    expected_label=label, description="Short description.",
                )
            )  # fmt: skip

        for agency, location, website, public, name, email, status, days_ago in APPLICATIONS:
            submitted = now - timedelta(days=days_ago)
            application = Application(
                agency_name=agency, location=location, website=website, public_contact=public,
                contact_name=name, contact_email=email, contact_phone="(503) 555 0100",
                attestation_signed_name=name, attestation_signed_at=submitted, submitted_at=submitted,
                status=status, activity=[{"at": submitted.isoformat(), "message": "Submitted by applicant"}],
            )  # fmt: skip
            db.add(application)
            if status == ApplicationStatus.approved:
                reviewed = submitted + timedelta(days=7)
                application.reviewed_at = reviewed
                application.log("Approved and listing published (demo data)")
                db.flush()
                db.add(
                    Listing(
                        application_id=application.id, agency_name=agency, location=location, website=website,
                        public_contact=public, published_at=reviewed, renewal_due_at=reviewed + timedelta(days=365),
                    )
                )  # fmt: skip

        db.commit()
        print("Demo content created: landing text, 4 board members, 5 trainings, 6 applications, 2 listings.")


if __name__ == "__main__":
    main()
