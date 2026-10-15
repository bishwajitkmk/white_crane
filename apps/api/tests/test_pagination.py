from datetime import timedelta

from app.db.base import utcnow
from app.models import Application, ApplicationStatus, Listing, Role, Subscriber


def _application(i: int, status: ApplicationStatus, name: str | None = None) -> Application:
    return Application(
        agency_name=name or f"Team {i:02d}", location="Columbia, MO", public_contact="x", contact_name="C",
        contact_email=f"c{i}@team.org", attestation_signed_name="C", status=status,
        submitted_at=utcnow() - timedelta(days=100 - i),
    )  # fmt: skip


def test_subscribers_are_paged_and_searched(db, login):
    now = utcnow()
    db.add_all(Subscriber(email=f"person{i:02d}@example.org", subscribed_at=now - timedelta(days=i)) for i in range(25))
    db.commit()
    client = login(Role.board)

    first = client.get("/admin/subscribers", params={"limit": 10}).json()
    assert first["total"] == 25 and len(first["items"]) == 10
    assert first["items"][0]["email"] == "person00@example.org"  # newest first
    last = client.get("/admin/subscribers", params={"limit": 10, "offset": 20}).json()
    assert [s["email"] for s in last["items"]][-1] == "person24@example.org"

    found = client.get("/admin/subscribers", params={"q": "PERSON1"}).json()
    assert found["total"] == 10
    assert client.get("/admin/subscribers", params={"limit": 500}).status_code == 422


def test_search_treats_wildcards_literally(db, login):
    db.add_all([_application(1, ApplicationStatus.pending, "100% DBT"), _application(2, ApplicationStatus.pending)])
    db.commit()
    client = login(Role.directorate)
    found = client.get("/admin/applications", params={"q": "%"}).json()["items"]
    assert [a["agency_name"] for a in found] == ["100% DBT"]
    assert client.get("/admin/applications", params={"q": "_"}).json()["total"] == 0


def test_application_queue_counts_and_slim_rows(db, login):
    db.add_all(_application(i, ApplicationStatus.pending) for i in range(3))
    db.add(_application(10, ApplicationStatus.approved))
    db.commit()
    client = login(Role.directorate)

    counts = client.get("/admin/applications/counts").json()
    assert counts == {"pending": 3, "info_requested": 0, "approved": 1, "declined": 0}
    page = client.get("/admin/applications", params={"status": "pending", "limit": 2}).json()
    assert page["total"] == 3 and [a["agency_name"] for a in page["items"]] == ["Team 00", "Team 01"]  # oldest first
    assert "team_members" not in page["items"][0]


def test_listings_filter_by_state_and_report_stats(db, login):
    now = utcnow()
    teams = [
        ("St. Louis, MO", False, 30),
        ("Austin, TX", False, 30),
        ("Columbia, MO", True, 30),  # hidden
        ("Kansas City, MO", False, -1),  # expired
    ]
    for i, (location, hidden, due) in enumerate(teams):
        application = _application(i, ApplicationStatus.approved)
        db.add(application)
        db.flush()
        db.add(Listing(application_id=application.id, agency_name=f"Team {i}", location=location, hidden=hidden,
                       renewal_due_at=now + timedelta(days=due)))  # fmt: skip
    db.commit()
    client = login(Role.directorate)

    assert client.get("/admin/listings/stats").json() == {"public": 2, "states": ["MO", "TX"]}
    mo = client.get("/admin/listings", params={"state": "MO"}).json()
    assert mo["total"] == 3 and all(entry["contact_email"].endswith("@team.org") for entry in mo["items"])
    one = mo["items"][0]
    assert client.get(f"/admin/listings/{one['id']}").json()["attested_at"] == one["attested_at"]

    public = client.get("/public/directory", params={"limit": 1}).json()
    assert public["total"] == 2 and len(public["items"]) == 1
