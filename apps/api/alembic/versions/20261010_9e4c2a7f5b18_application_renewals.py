"""application renewals

Revision ID: 9e4c2a7f5b18
Revises: 3b8d0f6e1a72
Create Date: 2026-10-10 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9e4c2a7f5b18'
down_revision: Union[str, None] = '3b8d0f6e1a72'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('applications', sa.Column('renewal', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('applications', sa.Column('renews_listing_id', sa.Uuid(), nullable=True))
    op.create_index(op.f('ix_applications_renews_listing_id'), 'applications', ['renews_listing_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_applications_renews_listing_id'), table_name='applications')
    with op.batch_alter_table('applications') as batch:
        batch.drop_column('renews_listing_id')
        batch.drop_column('renewal')
