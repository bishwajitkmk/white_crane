from fastapi import APIRouter

from app.routers.public import contact, content, directory, resources, trainings

router = APIRouter(prefix="/public", tags=["public"])
for module in (content, trainings, directory, resources, contact):
    router.include_router(module.router)
