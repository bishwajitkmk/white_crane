from fastapi import APIRouter

from app.core.deps import TRAININGS, require_role
from app.schemas.resource import PresignIn, PresignOut
from app.services import storage

# Board (resources, photos, hero image) and Trainers (training cover images).
router = APIRouter(prefix="/uploads", dependencies=[require_role(*TRAININGS)])


@router.post("/presign", response_model=PresignOut)
def presign(data: PresignIn):
    upload_url, public_url = storage.presign_upload(data.filename, data.content_type)
    return PresignOut(upload_url=upload_url, public_url=public_url)
