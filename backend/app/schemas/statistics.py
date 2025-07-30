# ABOUTME: Pydantic schemas for enhanced statistics API responses
# ABOUTME: Defines data structures for player statistics, head-to-head records, and performance analysis

from datetime import datetime

from pydantic import BaseModel


class HeadToHeadRecord(BaseModel):
    """Head-to-head record between two players"""

    player1_id: int
    player1_name: str
    player2_id: int
    player2_name: str
    total_games: int
    player1_wins: int
    player2_wins: int
    player1_win_percentage: float
    player2_win_percentage: float
    last_game_date: datetime | None = None
    current_streak: str | None = None  # e.g., "Player 1 - 3 game win streak"


class GameForm(BaseModel):
    """Recent form data for a single game"""

    game_id: int
    date: datetime
    opponent_id: int
    opponent_name: str
    result: str  # "W" or "L"
    rating_change: float
    conservative_rating_change: float


class RecentForm(BaseModel):
    """Recent form statistics for a player"""

    player_id: int
    player_name: str
    games_analyzed: int
    wins: int
    losses: int
    win_percentage: float
    avg_rating_change: float
    current_form: str  # e.g., "WWLWL"
    form_trend: str  # "improving", "declining", "stable"
    games: list[GameForm]


class PerformanceTrend(BaseModel):
    """Performance trend analysis over time periods"""

    period: str  # "7d", "30d", "90d", "all"
    games_played: int
    wins: int
    losses: int
    win_percentage: float
    avg_rating: float
    rating_change: float
    trend_direction: str  # "up", "down", "stable"


class PlayerStatistics(BaseModel):
    """Comprehensive player statistics"""

    player_id: int
    player_name: str

    # Basic stats
    total_games: int
    wins: int
    losses: int
    win_percentage: float

    # Rating stats
    current_mu: float
    current_sigma: float
    conservative_rating: float
    peak_rating: float
    peak_rating_date: datetime | None = None

    # Streak stats
    current_streak: str
    longest_win_streak: int
    longest_loss_streak: int

    # Performance trends
    performance_trends: list[PerformanceTrend]

    # Recent form
    recent_form: RecentForm

    # Activity stats
    first_game_date: datetime | None = None
    last_game_date: datetime | None = None
    games_this_week: int
    games_this_month: int


class PlayerStatisticsListResponse(BaseModel):
    """Response schema for paginated player statistics list"""

    statistics: list[PlayerStatistics]
    total: int
    page: int
    page_size: int
    total_pages: int


class HeadToHeadResponse(BaseModel):
    """Response schema for head-to-head statistics"""

    head_to_head: HeadToHeadRecord
    recent_games: list[GameForm]  # Last 10 games between these players


class LeaderboardEntry(BaseModel):
    """Enhanced leaderboard entry with additional statistics"""

    rank: int
    player_id: int
    player_name: str

    # Core stats
    games_played: int
    wins: int
    losses: int
    win_percentage: float

    # TrueSkill
    conservative_rating: float
    trueskill_mu: float
    trueskill_sigma: float

    # Performance indicators
    recent_form: str  # Last 5 games, e.g., "WWLWL"
    trend_7d: str  # "up", "down", "stable"
    rating_change_7d: float

    # Activity
    last_game_date: datetime | None = None
    games_this_week: int


class EnhancedLeaderboardResponse(BaseModel):
    """Enhanced leaderboard with comprehensive statistics"""

    leaderboard: list[LeaderboardEntry]
    total_players: int
    active_players: int
    total_games: int
    last_updated: datetime


class StatisticsSummary(BaseModel):
    """Overall statistics summary for the application"""

    total_players: int
    active_players: int
    total_games: int
    games_today: int
    games_this_week: int
    games_this_month: int

    # Top performers
    highest_rated_player: LeaderboardEntry | None = None
    most_active_player: LeaderboardEntry | None = None
    best_win_rate_player: LeaderboardEntry | None = None  # Min 10 games

    # System stats
    avg_games_per_player: float
    avg_rating: float
    most_common_matchup: str | None = None

    last_updated: datetime
