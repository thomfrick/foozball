# ABOUTME: SQLAlchemy model for the players table
# ABOUTME: Defines player attributes, ratings, and game statistics

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from app.db.database import Base


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)

    # TrueSkill rating system
    trueskill_mu = Column(Float, default=25.0, nullable=False)
    trueskill_sigma = Column(Float, default=8.3333, nullable=False)

    # Game statistics
    games_played = Column(Integer, default=0, nullable=False)
    wins = Column(Integer, default=0, nullable=False)
    losses = Column(Integer, default=0, nullable=False)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True, nullable=False)

    @property
    def win_percentage(self) -> float:
        """Calculate win percentage"""
        games_played = self.games_played or 0
        wins = self.wins or 0

        if games_played == 0:
            return 0.0
        return (wins / games_played) * 100
