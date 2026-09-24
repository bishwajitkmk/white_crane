"""Local-storage stand-in for the S3 presigned PUT. Only mounted when S3_ENDPOINT is empty (local dev)."""

from fastapi import APIRouter, HTTPException, Request, status

from app.core.config import settings
from app.core.security import decode_upload_token
from app.services.storage import local_path

router = APIRouter(tags=["uploads"], include_in_schema=False)


@router.put("/uploads/{key:path}", status_code=status.HTTP_204_NO_CONTENT)
async def put_file(key: str, token: str, request: Request):
    signed = decode_upload_token(token)
    if not signed or signed[0] != key:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Upload link is invalid or has expired")

    limit = settings.max_upload_mb * 1024 * 1024
    path = local_path(key)
    path.parent.mkdir(parents=True, exist_ok=True)
    size = 0
    try:
        with path.open("wb") as out:
            async for chunk in request.stream():
                size += len(chunk)
                if size > limit:
                    raise HTTPException(
                        status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, f"Files are limited to {settings.max_upload_mb} MB"
                    )
                out.write(chunk)
    except HTTPException:
        path.unlink(missing_ok=True)
        raise
