from fastapi import APIRouter

from app.core.deps import BOARD, DbSession, require_role
from app.schemas.content import SiteContentOut, SiteContentUpdate
from app.services.content import get_content, update_content

router = APIRouter(prefix="/content", dependencies=[require_role(*BOARD)])


@router.get("", response_model=SiteContentOut)
def read(db: DbSession):
    return get_content(db)


@router.patch("", response_model=SiteContentOut)
def update(data: SiteContentUpdate, db: DbSession):
    return update_content(db, data)
