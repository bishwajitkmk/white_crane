from pydantic import BaseModel

from app.schemas.application import ApplicationOut


class DashboardSummary(BaseModel):
    pending_applications: int
    pending_over_7_days: int
    renewals_due_60_days: int
    upcoming_trainings_30_days: int
    subscribers: int
    subscribers_this_month: int
    recent_applications: list[ApplicationOut]
