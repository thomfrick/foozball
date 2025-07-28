# ABOUTME: SQLAlchemy model for the team_games table
# ABOUTME: Defines team game attributes, team relationships, and match results

from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class TeamGame(Base):
    __tablename__ = "team_games"

    id = Column(Integer, primary_key=True, index=True)
    team1_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    team2_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    winner_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    team1 = relationship("Team", foreign_keys=[team1_id])
    team2 = relationship("Team", foreign_keys=[team2_id])
    winner_team = relationship("Team", foreign_keys=[winner_team_id])

    @property
    def loser_team_id(self) -> int:
        """Get the ID of the losing team"""
        return self.team2_id if self.winner_team_id == self.team1_id else self.team1_id

    @property
    def loser_team(self):
        """Get the losing team object"""
        return self.team2 if self.winner_team_id == self.team1_id else self.team1

    def __repr__(self) -> str:
        return f"<TeamGame(id={self.id}, {self.team1.player_names} vs {self.team2.player_names}, winner={self.winner_team.player_names})>"
