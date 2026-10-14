"""Bring a database up to date with the copy, bios and photos the Board supplied (app/client_content.py).

    uv run python -m app.load_client_content

Overwrites the About page and Trainers page text blocks (not the home page hero). Board members and trainers
are matched by name: existing entries are updated, missing ones added, and the seeded "Member Name"
placeholders removed. Anyone else already listed is kept, after the Board's list. Safe to re-run.
"""

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app import client_content as copy
from app.db.session import SessionLocal
from app.models import BoardMember, MemberKind, SiteContent
from app.schemas.content import SiteContentOut

HERO_KEYS = {"hero_headline", "hero_subheading", "hero_cta_label", "hero_image_url"}
PLACEHOLDER_NAME = "Member Name"


def load(db: Session) -> None:
    for key, value in SiteContentOut().model_dump(exclude=HERO_KEYS).items():
        db.merge(SiteContent(key=key, value=value))

    db.execute(delete(BoardMember).where(BoardMember.name == PLACEHOLDER_NAME))
    for kind, people in ((MemberKind.board, copy.BOARD), (MemberKind.trainer, copy.TRAINERS)):
        existing = {m.name: m for m in db.scalars(select(BoardMember).where(BoardMember.kind == kind))}
        for position, (name, role, bio, photo_url) in enumerate(people):
            member = existing.pop(name, None) or BoardMember(kind=kind, name=name)
            member.role, member.bio, member.photo_url, member.position = role, bio, photo_url, position
            db.add(member)
        for position, member in enumerate(sorted(existing.values(), key=lambda m: m.position), len(people)):
            member.position = position


def main() -> None:
    with SessionLocal() as db:
        load(db)
        db.commit()
    print(f"Loaded About and Trainers copy, {len(copy.BOARD)} board members and {len(copy.TRAINERS)} trainers.")


if __name__ == "__main__":
    main()
