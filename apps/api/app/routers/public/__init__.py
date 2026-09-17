from fastapi import APIRouter

from app.routers.public import content, directory, resources, trainings

router = APIRouter(prefix="/public", tags=["public"])
for module in (content, trainings, directory, resources):
    router.include_router(module.router)
