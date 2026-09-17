"""S3-compatible storage (Cloudflare R2). The browser uploads directly with a presigned PUT."""

import re
import uuid

import boto3
from botocore.client import Config

from app.core.config import settings


def _client():
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint or None,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def presign_upload(filename: str, content_type: str, folder: str = "uploads") -> tuple[str, str]:
    """Returns (upload_url, public_url). Keys are namespaced with a uuid so names never collide."""
    safe = re.sub(r"[^A-Za-z0-9._-]+", "-", filename).strip("-") or "file"
    key = f"{folder}/{uuid.uuid4().hex}/{safe}"
    upload_url = _client().generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.s3_bucket, "Key": key, "ContentType": content_type},
        ExpiresIn=900,
    )
    public_url = f"{settings.s3_public_url.rstrip('/')}/{key}"
    return upload_url, public_url
