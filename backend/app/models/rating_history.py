# ABOUTME: SQLAlchemy model for the rating_history table
# ABOUTME: Tracks TrueSkill rating changes for players after each game

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class RatingHistory(Base):
    __tablename__ = "rating_history"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)

    # TrueSkill rating before the game
    trueskill_mu_before = Column(Float, nullable=False)
    trueskill_sigma_before = Column(Float, nullable=False)

    # TrueSkill rating after the game
    trueskill_mu_after = Column(Float, nullable=False)
    trueskill_sigma_after = Column(Float, nullable=False)

    # Rating system used (future-proofing)
    rating_system = Column(String(20), default="trueskill", nullable=False)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    player = relationship("Player", back_populates="rating_history")
    game = relationship("Game")

    @property
    def mu_change(self) -> float:
        """Calculate the change in mu (skill rating)"""
        return self.trueskill_mu_after - self.trueskill_mu_before

    @property
    def sigma_change(self) -> float:
        """Calculate the change in sigma (uncertainty)"""
        return self.trueskill_sigma_after - self.trueskill_sigma_before

    @property
    def conservative_rating_before(self) -> float:
        """Conservative rating before the game (mu - 3*sigma)"""
        return self.trueskill_mu_before - (3 * self.trueskill_sigma_before)

    @property
    def conservative_rating_after(self) -> float:
        """Conservative rating after the game (mu - 3*sigma)"""
        return self.trueskill_mu_after - (3 * self.trueskill_sigma_after)

    @property
    def conservative_rating_change(self) -> float:
        """Change in conservative rating"""
        return self.conservative_rating_after - self.conservative_rating_before
