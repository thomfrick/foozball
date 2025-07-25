"""remove_elo_rating_column

Revision ID: a470f7d40e7e
Revises: 688b00e0ebbb
Create Date: 2025-07-25 16:52:36.202440

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a470f7d40e7e"
down_revision: str | Sequence[str] | None = "688b00e0ebbb"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Remove elo_rating column from players table."""
    op.drop_column("players", "elo_rating")


def downgrade() -> None:
    """Add elo_rating column back to players table."""
    op.add_column(
        "players",
        op.Column("elo_rating", op.Float(), nullable=False, server_default="1500.0"),
    )
