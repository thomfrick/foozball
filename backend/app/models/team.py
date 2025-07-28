# ABOUTME: SQLAlchemy model for the teams table
# ABOUTME: Defines team composition (2 players), ratings, and game statistics

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)

    # Team composition (ensure player1_id < player2_id for consistency)
    player1_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    player2_id = Column(Integer, ForeignKey("players.id"), nullable=False)

    # TrueSkill rating system for teams
    trueskill_mu = Column(
        Float, default=50.0, nullable=False
    )  # 2 players default: 25*2
    trueskill_sigma = Column(
        Float, default=16.6666, nullable=False
    )  # sqrt(2) * 8.3333 * 2

    # Game statistics
    games_played = Column(Integer, default=0, nullable=False)
    wins = Column(Integer, default=0, nullable=False)
    losses = Column(Integer, default=0, nullable=False)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    player1 = relationship("Player", foreign_keys=[player1_id])
    player2 = relationship("Player", foreign_keys=[player2_id])

    # Constraints
    __table_args__ = (
        # Ensure players are different
        CheckConstraint("player1_id != player2_id", name="different_players"),
        # Ensure consistent ordering (player1_id < player2_id)
        CheckConstraint("player1_id < player2_id", name="ordered_players"),
        # Unique team composition
        UniqueConstraint("player1_id", "player2_id", name="unique_team_composition"),
    )

    @classmethod
    def create_team_key(cls, player_id_1: int, player_id_2: int) -> tuple[int, int]:
        """
        Create ordered team key to ensure consistent team identification

        Args:
            player_id_1: First player ID
            player_id_2: Second player ID

        Returns:
            Tuple with (smaller_id, larger_id)
        """
        if player_id_1 == player_id_2:
            raise ValueError("Players must be different")
        return (min(player_id_1, player_id_2), max(player_id_1, player_id_2))

    @property
    def win_percentage(self) -> float:
        """Calculate team win percentage"""
        games_played = self.games_played or 0
        wins = self.wins or 0

        if games_played == 0:
            return 0.0
        return (wins / games_played) * 100

    @property
    def conservative_rating(self) -> float:
        """Conservative skill estimate (mu - 3*sigma)"""
        return self.trueskill_mu - (3 * self.trueskill_sigma)

    @property
    def player_names(self) -> str:
        """Get formatted team name as 'Player1 & Player2'"""
        return f"{self.player1.name} & {self.player2.name}"

    def __repr__(self) -> str:
        return f"<Team(id={self.id}, players='{self.player_names}', rating={self.conservative_rating:.1f})>"
