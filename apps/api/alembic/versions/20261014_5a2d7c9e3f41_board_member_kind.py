"""board member kind (board or trainer)

Revision ID: 5a2d7c9e3f41
Revises: 9e4c2a7f5b18
Create Date: 2026-10-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5a2d7c9e3f41'
down_revision: Union[str, None] = '9e4c2a7f5b18'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('board_members', sa.Column('kind', sa.String(length=20), nullable=False, server_default='board'))
    op.create_index(op.f('ix_board_members_kind'), 'board_members', ['kind'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_board_members_kind'), table_name='board_members')
    with op.batch_alter_table('board_members') as batch:
        batch.drop_column('kind')
