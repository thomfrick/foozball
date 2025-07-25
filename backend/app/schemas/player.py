# ABOUTME: Pydantic schemas for player data validation and serialization
# ABOUTME: Defines request/response models for player API endpoints

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class PlayerBase(BaseModel):
    """Base player schema with common fields"""

    name: str = Field(..., min_length=1, max_length=100, description="Player name")
    email: EmailStr | None = Field(None, description="Player email address")


class PlayerCreate(PlayerBase):
    """Schema for creating a new player"""

    pass


class PlayerUpdate(BaseModel):
    """Schema for updating an existing player"""

    name: str | None = Field(
        None, min_length=1, max_length=100, description="Player name"
    )
    email: EmailStr | None = Field(None, description="Player email address")
    is_active: bool | None = Field(None, description="Whether player is active")


class PlayerResponse(PlayerBase):
    """Schema for player response data"""

    id: int
    trueskill_mu: float
    trueskill_sigma: float
    games_played: int
    wins: int
    losses: int
    win_percentage: float
    is_active: bool
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class PlayerListResponse(BaseModel):
    """Schema for paginated player list response"""

    players: list[PlayerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
