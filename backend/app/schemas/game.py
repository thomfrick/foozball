# ABOUTME: Pydantic schemas for game data validation and serialization
# ABOUTME: Defines request/response models for game API endpoints

from datetime import datetime

from pydantic import BaseModel, Field

from .player import PlayerResponse


class GameBase(BaseModel):
    """Base game schema with common fields"""

    player1_id: int = Field(..., description="First player ID")
    player2_id: int = Field(..., description="Second player ID")
    winner_id: int = Field(..., description="Winner player ID")


class GameCreate(GameBase):
    """Schema for creating a new game"""

    pass


class GameResponse(GameBase):
    """Schema for game response data"""

    id: int
    created_at: datetime
    player1: PlayerResponse
    player2: PlayerResponse
    winner: PlayerResponse

    class Config:
        from_attributes = True


class GameListResponse(BaseModel):
    """Schema for paginated game list response"""

    games: list[GameResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
