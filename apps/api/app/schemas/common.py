from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Page[T](BaseModel):
    """One page of a list endpoint. `total` counts every match, not just this page."""

    items: list[T]
    total: int
