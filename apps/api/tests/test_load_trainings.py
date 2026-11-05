from datetime import datetime

from sqlalchemy import select

from app.load_trainings import load
from app.models import Training, TrainingFormat, TrainingRegistration, TrainingStatus


def _demo(slug: str, status=TrainingStatus.open) -> Training:
    return Training(slug=slug, title=slug, status=status, format=TrainingFormat.online)


def test_posts_schedule_and_clears_demo_placeholders(db, client):
    kept = _demo("chain-analysis-workshop")
    db.add_all([_demo("dbt-skills-intensive"), kept, _demo("adolescent-dbt-overview", TrainingStatus.upcoming)])
    db.flush()
    db.add(TrainingRegistration(training_id=kept.id, full_name="A", email="a@example.org"))
    db.commit()

    assert load(db) == (6, 0, 2)
    db.commit()
    assert db.scalar(select(Training).where(Training.slug == "chain-analysis-workshop"))  # has a sign-up

    nov = db.scalar(select(Training).where(Training.slug == "suicide-assessment-nov-2026"))
    assert (nov.starts_at, nov.ends_at) == (datetime(2026, 11, 18), datetime(2026, 11, 20, 23, 59))
    assert nov.registration_url == "https://cvent.me/QZQ7D5" and nov.expected_label == "Nov 18, 19, & 20, 2026"

    upcoming = client.get("/public/trainings/upcoming").json()
    assert [t["slug"] for t in upcoming] == [
        "intro-to-dbt-jan-2027", "dbt-basics-feb-2027", "suicide-assessment-mar-2027", "dbt-skills-training-apr-2027",
    ]  # fmt: skip
    assert all(not t["accepting_registrations"] and t["registration_url"] is None for t in upcoming)


def test_rerun_keeps_dashboard_edits(db):
    load(db)
    db.flush()
    jan = db.scalar(select(Training).where(Training.slug == "intro-to-dbt-jan-2027"))
    jan.status, jan.registration_url, jan.format = TrainingStatus.open, "https://cvent.me/x", TrainingFormat.in_person
    jan.description = "Edited"
    db.commit()

    assert load(db) == (0, 6, 0)
    db.commit()
    db.refresh(jan)
    assert (jan.status, jan.registration_url, jan.format, jan.description) == (
        TrainingStatus.open, "https://cvent.me/x", TrainingFormat.in_person, "Edited",
    )  # fmt: skip
    assert jan.starts_at < jan.ends_at
