"""indexes for paged lists, searches and foreign keys

Revision ID: 8b3e1f6a9c27
Revises: 5a2d7c9e3f41
Create Date: 2026-10-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '8b3e1f6a9c27'
down_revision: Union[str, None] = '5a2d7c9e3f41'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

INDEXES = [
    ('ix_applications_status_submitted_at', 'applications', ['status', 'submitted_at']),
    ('ix_applications_reviewed_by_id', 'applications', ['reviewed_by_id']),
    ('ix_trainings_status_starts_at', 'trainings', ['status', 'starts_at']),
    ('ix_subscribers_subscribed_at', 'subscribers', ['subscribed_at']),
    ('ix_listings_agency_name', 'listings', ['agency_name']),
    ('ix_invites_user_id', 'invites', ['user_id']),
    ('ix_password_resets_user_id', 'password_resets', ['user_id']),
]


def upgrade() -> None:
    for name, table, columns in INDEXES:
        op.create_index(name, table, columns, unique=False)


def downgrade() -> None:
    for name, table, _ in reversed(INDEXES):
        op.drop_index(name, table_name=table)
