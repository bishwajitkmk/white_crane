from sqlalchemy import select

from app.client_content import RESOURCES
from app.load_resources import load
from app.models import Resource, ResourceKind


def test_posts_resource_list(db, client):
    assert load(db) == (len(RESOURCES), 0)
    db.commit()

    listed = client.get("/public/resources").json()
    assert len(listed) == len(RESOURCES)
    files = [r for r in listed if r["kind"] == ResourceKind.file]
    assert len(files) == 8
    assert all(r["url"].startswith("/downloads/") and r["file_size_bytes"] for r in files)
    assert {r["category"] for r in listed} == {"forms", "for_teams", "links", "reading", "suicide"}


def test_rerun_keeps_dashboard_edits(db):
    load(db)
    db.flush()
    diary = db.scalar(select(Resource).where(Resource.title == "Diary Card"))
    diary.description = "Edited"
    db.commit()

    assert load(db) == (0, len(RESOURCES))
    db.refresh(diary)
    assert diary.description == "Edited"
