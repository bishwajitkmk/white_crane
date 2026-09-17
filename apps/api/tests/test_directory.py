from datetime import timedelta

from app.db.base import utcnow
from app.models import Listing, Role

APPLICATION = {
    "agency_name": "Riverbend DBT Team",
    "location": "Portland, OR",
    "website": "https://riverbend.org",
    "public_contact": "intake@riverbend.org",
    "contact_name": "Dana Lee",
    "contact_email": "dana@riverbend.org",
    "contact_phone": "(503) 555 0100",
    "attestation_signed_name": "Dana Lee",
}


def test_apply_review_approve_publishes_listing(login):
    client = login(Role.directorate)

    res = client.post("/public/applications", json=APPLICATION)
    assert res.status_code == 201
    app_id = res.json()["id"]
    assert client.get("/public/directory").json() == []

    queue = client.get("/admin/applications", params={"status": "pending"}).json()
    assert [a["id"] for a in queue] == [app_id]

    res = client.post(f"/admin/applications/{app_id}/approve", json={"note": ""})
    assert res.status_code == 200
    assert res.json()["status"] == "approved"

    directory = client.get("/public/directory", params={"q": "river"}).json()
    assert [d["agency_name"] for d in directory] == ["Riverbend DBT Team"]
    assert "contact_email" not in directory[0]  # private contact never public

    # Decided applications cannot be decided again
    assert client.post(f"/admin/applications/{app_id}/decline", json={"note": ""}).status_code == 409


def test_request_info_needs_note(login):
    client = login(Role.directorate)
    app_id = client.post("/public/applications", json=APPLICATION).json()["id"]
    assert client.post(f"/admin/applications/{app_id}/request-info", json={"note": ""}).status_code == 422
    res = client.post(f"/admin/applications/{app_id}/request-info", json={"note": "Send your team roster"})
    assert res.json()["status"] == "info_requested"


def test_expired_listing_hidden_then_renewed(login, db):
    client = login(Role.directorate)
    app_id = client.post("/public/applications", json=APPLICATION).json()["id"]
    client.post(f"/admin/applications/{app_id}/approve", json={"note": ""})

    listing = db.query(Listing).one()
    listing.renewal_due_at = utcnow() - timedelta(days=1)
    db.commit()

    assert client.get("/public/directory").json() == []
    assert len(client.get("/admin/listings", params={"renewal": "overdue"}).json()) == 1

    assert client.post(f"/admin/listings/{listing.id}/renew").status_code == 200
    assert len(client.get("/public/directory").json()) == 1


def test_training_crud_and_public_views(login):
    client = login(Role.trainer)
    starts = (utcnow() + timedelta(days=10)).replace(microsecond=0)
    body = {
        "title": "DBT Skills Intensive",
        "slug": "dbt-skills-intensive",
        "status": "open",
        "format": "online",
        "starts_at": starts.isoformat(),
        "ends_at": (starts + timedelta(hours=7)).isoformat(),
        "registration_url": "https://ceu-manager.example/event/1",
    }
    assert client.post("/admin/trainings", json=body).status_code == 201
    assert client.post("/admin/trainings", json=body).status_code == 409  # duplicate slug

    assert [t["slug"] for t in client.get("/public/trainings").json()] == ["dbt-skills-intensive"]
    assert client.get("/public/trainings/dbt-skills-intensive").status_code == 200
    assert client.get("/public/trainings/upcoming").json() == []


def test_subscribe_and_export(client, login):
    first = {"email": "A.Person@gmail.com", "source": "Home page"}
    assert client.post("/public/subscribe", json=first).status_code == 202
    assert client.post("/public/subscribe", json={"email": "a.person@gmail.com", "source": "Footer"}).status_code == 202

    board = login(Role.board)
    subs = board.get("/admin/subscribers").json()
    assert [s["email"] for s in subs] == ["a.person@gmail.com"]

    csv = board.get("/admin/subscribers/export.csv")
    assert csv.headers["content-type"].startswith("text/csv")
    assert "a.person@gmail.com" in csv.text


def test_landing_content_roundtrip(login, client):
    board = login(Role.board)
    board.patch("/admin/content", json={"mission": "Train DBT teams well."})
    assert client.get("/public/content").json()["mission"] == "Train DBT teams well."
