from datetime import timedelta

from app.db.base import utcnow
from app.models import Role, Training, TrainingFormat, TrainingRegistration, TrainingStatus

PERSON = {"full_name": "Dana Lee", "email": "Dana@Riverbend.org", "organization": "Riverbend", "role": "LCSW"}


def make_training(db, **overrides) -> Training:
    start = utcnow() + timedelta(days=10)
    training = Training(
        slug="skills-intensive",
        title="DBT Skills Intensive",
        status=TrainingStatus.open,
        format=TrainingFormat.online,
        starts_at=start,
        ends_at=start + timedelta(hours=6),
        **overrides,
    )
    db.add(training)
    db.commit()
    return training


def test_register_stores_once_and_sends_confirmation(client, db, monkeypatch):
    make_training(db)
    sent = []
    monkeypatch.setattr(
        "app.services.registrations.email.send", lambda template, to, **ctx: sent.append((template, to))
    )

    public = client.get("/public/trainings/skills-intensive").json()
    assert public["accepting_registrations"] is True
    assert "registration_count" not in public  # sign-up numbers stay private

    res = client.post("/public/trainings/skills-intensive/registrations", json=PERSON)
    assert res.status_code == 201
    assert res.json()["training_title"] == "DBT Skills Intensive"

    # Same person again (any casing): still one seat, confirmation re-sent.
    again = client.post(
        "/public/trainings/skills-intensive/registrations", json={**PERSON, "email": "dana@riverbend.org"}
    )
    assert again.status_code == 201
    assert db.query(TrainingRegistration).count() == 1
    assert db.query(TrainingRegistration).one().email == "dana@riverbend.org"
    assert sent == [("training_registration", "dana@riverbend.org")] * 2


def test_capacity_closes_registration(client, db):
    make_training(db, capacity=1)
    url = "/public/trainings/skills-intensive/registrations"
    assert client.post(url, json=PERSON).status_code == 201

    res = client.post(url, json={**PERSON, "email": "sam@harbor.org"})
    assert res.status_code == 409
    assert res.json()["detail"] == "This training is fully booked."
    public = client.get("/public/trainings/skills-intensive").json()
    assert public["is_full"] is True
    assert public["accepting_registrations"] is False


def test_closed_trainings_reject_registrations(client, db):
    url = "/public/trainings/skills-intensive/registrations"

    training = make_training(db, registration_url="https://events.example.org/dbt")
    assert client.post(url, json=PERSON).status_code == 409

    training.registration_url = None
    training.status = TrainingStatus.upcoming
    db.commit()
    assert client.post(url, json=PERSON).status_code == 409

    training.status = TrainingStatus.open
    training.starts_at = training.ends_at = utcnow() - timedelta(days=1)
    db.commit()
    assert client.post(url, json=PERSON).status_code == 409

    assert client.post("/public/trainings/nope/registrations", json=PERSON).status_code == 404
    assert db.query(TrainingRegistration).count() == 0


def test_registration_honeypot_is_silently_dropped(client, db):
    make_training(db)
    res = client.post("/public/trainings/skills-intensive/registrations", json={**PERSON, "nickname": "bot"})
    assert res.status_code == 201
    assert db.query(TrainingRegistration).count() == 0


def test_trainer_lists_exports_and_removes_registrations(login, db):
    client = login(Role.trainer)
    training = make_training(db, capacity=20)
    client.post("/public/trainings/skills-intensive/registrations", json=PERSON)

    listed = client.get("/admin/trainings").json()
    assert listed[0]["registration_count"] == 1

    rows = client.get(f"/admin/trainings/{training.id}/registrations").json()
    assert [r["full_name"] for r in rows] == ["Dana Lee"]

    csv = client.get(f"/admin/trainings/{training.id}/registrations/export.csv")
    assert csv.status_code == 200
    assert "dana@riverbend.org" in csv.text
    assert "registrations-skills-intensive" in csv.headers["content-disposition"]

    assert client.delete(f"/admin/trainings/{training.id}/registrations/{rows[0]['id']}").status_code == 204
    assert client.get(f"/admin/trainings/{training.id}/registrations").json() == []


def test_deleting_training_removes_its_registrations(login, db):
    client = login(Role.board)
    training = make_training(db)
    client.post("/public/trainings/skills-intensive/registrations", json=PERSON)

    assert client.delete(f"/admin/trainings/{training.id}").status_code == 204
    assert db.query(TrainingRegistration).count() == 0


def test_directorate_cannot_see_registrations(login, db):
    client = login(Role.directorate)
    training = make_training(db)
    assert client.get(f"/admin/trainings/{training.id}/registrations").status_code == 403
