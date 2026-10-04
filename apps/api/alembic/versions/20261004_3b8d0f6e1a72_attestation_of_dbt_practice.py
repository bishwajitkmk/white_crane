"""attestation of DBT practice

Revision ID: 3b8d0f6e1a72
Revises: 7c1e4b9a2d53
Create Date: 2026-10-04 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3b8d0f6e1a72'
down_revision: Union[str, None] = '7c1e4b9a2d53'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Applications submitted before this (attestation version 1.0) get empty values.
COLUMNS = [
    sa.Column('program_address', sa.Text(), nullable=False, server_default=''),
    sa.Column('services', sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
    sa.Column('team_members', sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
    sa.Column('first_consultation_on', sa.Date(), nullable=True),
    sa.Column('residential', sa.Boolean(), nullable=False, server_default=sa.false()),
    sa.Column('answers', sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
    sa.Column('comments_residential', sa.Text(), nullable=False, server_default=''),
    sa.Column('comments_practices', sa.Text(), nullable=False, server_default=''),
    sa.Column('additional_info', sa.Text(), nullable=False, server_default=''),
    sa.Column('attestation_signed_title', sa.String(length=200), nullable=False, server_default=''),
]


def upgrade() -> None:
    for column in COLUMNS:
        op.add_column('applications', column)


def downgrade() -> None:
    with op.batch_alter_table('applications') as batch:
        for column in reversed(COLUMNS):
            batch.drop_column(column.name)
