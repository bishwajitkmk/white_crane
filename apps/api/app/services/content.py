from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import SiteContent
from app.schemas.content import CONTENT_KEYS, SiteContentOut, SiteContentUpdate


def get_content(db: Session) -> SiteContentOut:
    rows = db.scalars(select(SiteContent).where(SiteContent.key.in_(CONTENT_KEYS)))
    return SiteContentOut(**{row.key: row.value for row in rows})


def update_content(db: Session, data: SiteContentUpdate) -> SiteContentOut:
    for key, value in data.model_dump(exclude_unset=True).items():
        row = db.get(SiteContent, key) or SiteContent(key=key)
        row.value = value or ""
        db.add(row)
    db.commit()
    return get_content(db)
