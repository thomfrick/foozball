# ABOUTME: Pydantic schemas for rating history API responses
# ABOUTME: Defines data structures for rating progression and statistics

from datetime import datetime

from pydantic import BaseModel


class RatingHistoryResponse(BaseModel):
    """Response schema for a single rating history entry"""

    id: int
    player_id: int
    game_id: int
    trueskill_mu_before: float
    trueskill_sigma_before: float
    trueskill_mu_after: float
    trueskill_sigma_after: float
    rating_system: str
    created_at: datetime
    mu_change: float
    sigma_change: float
    conservative_rating_before: float
    conservative_rating_after: float
    conservative_rating_change: float

    class Config:
        from_attributes = True


class RatingHistoryListResponse(BaseModel):
    """Response schema for paginated rating history list"""

    rating_history: list[RatingHistoryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PlayerRatingProgression(BaseModel):
    """Rating progression data for charts"""

    player_id: int
    player_name: str
    ratings: list[RatingHistoryResponse]


class MultiPlayerRatingProgression(BaseModel):
    """Multi-player rating progression for comparison charts"""

    players: list[PlayerRatingProgression]
    total_games: int
