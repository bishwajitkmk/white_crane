"""training registrations

Revision ID: 7c1e4b9a2d53
Revises: 16f21aff0b4e
Create Date: 2026-09-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7c1e4b9a2d53'
down_revision: Union[str, None] = '16f21aff0b4e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('trainings', sa.Column('capacity', sa.Integer(), nullable=True))
    op.create_table('training_registrations',
    sa.Column('training_id', sa.Uuid(), nullable=False),
    sa.Column('full_name', sa.String(length=200), nullable=False),
    sa.Column('email', sa.String(length=320), nullable=False),
    sa.Column('phone', sa.String(length=50), nullable=False),
    sa.Column('organization', sa.String(length=300), nullable=False),
    sa.Column('role', sa.String(length=200), nullable=False),
    sa.Column('notes', sa.Text(), nullable=False),
    sa.Column('registered_at', sa.DateTime(), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.ForeignKeyConstraint(['training_id'], ['trainings.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('training_id', 'email')
    )
    op.create_index(op.f('ix_training_registrations_training_id'), 'training_registrations', ['training_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_training_registrations_training_id'), table_name='training_registrations')
    op.drop_table('training_registrations')
    op.drop_column('trainings', 'capacity')
