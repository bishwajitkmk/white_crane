"""File uploads. The browser PUTs the file straight to the returned upload_url, then saves public_url.

Production: S3-compatible storage (Cloudflare R2) with presigned PUTs.
Local dev (S3_ENDPOINT empty): the API itself accepts the PUT (signed token in the URL) and serves /files/.
"""

import re
import uuid
from pathlib import Path
from urllib.parse import quote

from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import create_upload_token

# No HTML/SVG/JS: files are served from the API origin, which holds the auth cookies.
ALLOWED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".rtf", ".zip",
}  # fmt: skip


def _client():
    import boto3
    from botocore.client import Config

    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint or None,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def safe_key(filename: str, folder: str = "uploads") -> str:
    safe = re.sub(r"[^A-Za-z0-9._-]+", "-", filename).strip("-.") or "file"
    if Path(safe).suffix.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            422,
            "Unsupported file type. Use an image, PDF, Office document, text/CSV or zip file.",
        )
    return f"{folder}/{uuid.uuid4().hex}/{safe}"


def presign_upload(filename: str, content_type: str, folder: str = "uploads") -> tuple[str, str]:
    """Returns (upload_url, public_url). Keys are namespaced with a uuid so names never collide."""
    key = safe_key(filename, folder)
    if settings.use_local_storage:
        api = settings.api_url.rstrip("/")
        token = create_upload_token(key, content_type)
        return f"{api}/uploads/{quote(key)}?token={token}", f"{api}/files/{quote(key)}"

    upload_url = _client().generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.s3_bucket, "Key": key, "ContentType": content_type},
        ExpiresIn=900,
    )
    public_url = f"{settings.s3_public_url.rstrip('/')}/{key}"
    return upload_url, public_url


def local_root() -> Path:
    root = Path(settings.local_upload_dir).resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root


def local_path(key: str) -> Path:
    root = local_root()
    path = (root / key).resolve()
    if root not in path.parents:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid file key")
    return path
