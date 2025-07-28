# ABOUTME: Pydantic schemas for team data validation and serialization
# ABOUTME: Defines request/response models for team API endpoints

from datetime import datetime

from pydantic import BaseModel, Field

from .player import PlayerResponse


class TeamBase(BaseModel):
    """Base team schema with common fields"""

    player1_id: int = Field(..., description="First team member ID")
    player2_id: int = Field(..., description="Second team member ID")


class TeamCreate(TeamBase):
    """Schema for creating a new team"""

    pass


class TeamResponse(TeamBase):
    """Schema for team response data"""

    id: int
    trueskill_mu: float
    trueskill_sigma: float
    games_played: int
    wins: int
    losses: int
    win_percentage: float
    conservative_rating: float
    player_names: str
    is_active: bool
    created_at: datetime
    updated_at: datetime | None
    player1: PlayerResponse
    player2: PlayerResponse

    class Config:
        from_attributes = True


class TeamListResponse(BaseModel):
    """Schema for paginated team list response"""

    teams: list[TeamResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class TeamGameBase(BaseModel):
    """Base team game schema with common fields"""

    team1_id: int = Field(..., description="First team ID")
    team2_id: int = Field(..., description="Second team ID")
    winner_team_id: int = Field(..., description="Winner team ID")


class TeamGameCreate(TeamGameBase):
    """Schema for creating a new team game"""

    pass


class TeamGameResponse(TeamGameBase):
    """Schema for team game response data"""

    id: int
    created_at: datetime
    team1: TeamResponse
    team2: TeamResponse
    winner_team: TeamResponse

    class Config:
        from_attributes = True


class TeamGameListResponse(BaseModel):
    """Schema for paginated team game list response"""

    team_games: list[TeamGameResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class TeamFormationRequest(BaseModel):
    """Schema for requesting team formation from 4 players"""

    team1_player1_id: int = Field(..., description="Team 1 - First player ID")
    team1_player2_id: int = Field(..., description="Team 1 - Second player ID")
    team2_player1_id: int = Field(..., description="Team 2 - First player ID")
    team2_player2_id: int = Field(..., description="Team 2 - Second player ID")
    winner_team: int = Field(..., ge=1, le=2, description="Winning team (1 or 2)")
