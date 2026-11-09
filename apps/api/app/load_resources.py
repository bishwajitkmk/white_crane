"""Post the Board's resource list (app/client_content.py RESOURCES) to a database.

    uv run python -m app.load_resources

Resources are matched by title: missing ones are added, ones already listed are left as edited in the
dashboard. Documents are served by the web app from apps/web/public/downloads; their sizes are read from
there, so run this from a full checkout. Safe to re-run.
"""

from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.client_content import RESOURCES
from app.db.session import SessionLocal
from app.models import Resource, ResourceCategory, ResourceKind

WEB_PUBLIC = Path(__file__).resolve().parents[2] / "web" / "public"


def _size(url: str) -> int | None:
    path = WEB_PUBLIC / url.lstrip("/")
    return path.stat().st_size if url.startswith("/") and path.is_file() else None


def load(db: Session) -> tuple[int, int]:
    existing = set(db.scalars(select(Resource.title)))
    added = 0
    for title, description, category, url in RESOURCES:
        if title in existing:
            continue
        kind = ResourceKind.file if url.startswith("/") else ResourceKind.link
        db.add(
            Resource(
                title=title,
                description=description,
                category=ResourceCategory(category),
                kind=kind,
                url=url,
                file_size_bytes=_size(url) if kind == ResourceKind.file else None,
            )
        )
        added += 1
    return added, len(RESOURCES) - added


def main() -> None:
    with SessionLocal() as db:
        added, kept = load(db)
        db.commit()
    print(f"Resources: {added} added, {kept} already listed.")


if __name__ == "__main__":
    main()
