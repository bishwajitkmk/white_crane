import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import BOARD, DbSession, require_role
from app.models import Resource, ResourceKind
from app.schemas.resource import ResourceIn, ResourceOut
from app.services import storage

router = APIRouter(dependencies=[require_role(*BOARD)])


def _with_size(data: ResourceIn, existing: Resource | None = None) -> dict:
    """Files we host are measured server-side; the client-sent (or previously stored) size is only a fallback."""
    values = data.model_dump()
    if data.kind == ResourceKind.file:
        kept = existing.file_size_bytes if existing and existing.url == data.url else None
        values["file_size_bytes"] = storage.file_size(data.url) or data.file_size_bytes or kept
    else:
        values["file_size_bytes"] = None
    return values


def _get(db: DbSession, resource_id: uuid.UUID) -> Resource:
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resource not found")
    return resource


@router.get("/resources", response_model=list[ResourceOut])
def list_resources(db: DbSession):
    return db.scalars(select(Resource).order_by(Resource.updated_at.desc())).all()


@router.get("/resources/{resource_id}", response_model=ResourceOut)
def read(resource_id: uuid.UUID, db: DbSession):
    return _get(db, resource_id)


@router.post("/resources", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
def create(data: ResourceIn, db: DbSession):
    resource = Resource(**_with_size(data))
    db.add(resource)
    db.commit()
    return resource


@router.patch("/resources/{resource_id}", response_model=ResourceOut)
def update(resource_id: uuid.UUID, data: ResourceIn, db: DbSession):
    resource = _get(db, resource_id)
    for key, value in _with_size(data, resource).items():
        setattr(resource, key, value)
    db.commit()
    return resource


@router.delete("/resources/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(resource_id: uuid.UUID, db: DbSession):
    db.delete(_get(db, resource_id))
    db.commit()
