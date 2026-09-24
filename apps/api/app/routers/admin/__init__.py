"""/admin/* mirrors the dashboard pages. Every route requires a session; role checks live on each sub-router."""

from fastapi import APIRouter, Depends

from app.core.deps import current_user
from app.routers.admin import (
    account,
    applications,
    board_members,
    content,
    listings,
    resources,
    subscribers,
    summary,
    trainings,
    uploads,
    users,
)

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(current_user)])
MODULES = (
    summary,
    content,
    board_members,
    trainings,
    applications,
    listings,
    resources,
    uploads,
    subscribers,
    users,
    account,
)
for module in MODULES:
    router.include_router(module.router)
