import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import BOARD, DbSession, require_role
from app.models import Resource
from app.schemas.resource import ResourceIn, ResourceOut

router = APIRouter(dependencies=[require_role(*BOARD)])


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
    resource = Resource(**data.model_dump())
    db.add(resource)
    db.commit()
    return resource


@router.patch("/resources/{resource_id}", response_model=ResourceOut)
def update(resource_id: uuid.UUID, data: ResourceIn, db: DbSession):
    resource = _get(db, resource_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(resource, key, value)
    db.commit()
    return resource


@router.delete("/resources/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(resource_id: uuid.UUID, db: DbSession):
    db.delete(_get(db, resource_id))
    db.commit()
