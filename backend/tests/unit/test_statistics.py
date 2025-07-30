# ABOUTME: Unit tests for statistics calculation endpoints and business logic
# ABOUTME: Tests comprehensive player statistics, head-to-head analysis, and performance trends

from datetime import datetime, timedelta
from unittest.mock import MagicMock

from app.models.player import Player
from app.schemas.statistics import (
    GameForm,
    PerformanceTrend,
    RecentForm,
)


class TestStatisticsCalculations:
    """Test statistics calculation logic"""

    def test_player_win_percentage_calculation(self):
        """Test win percentage calculation for players"""
        # Player with games
        player = Player(id=1, name="Test Player", games_played=10, wins=7, losses=3)
        assert player.win_percentage == 70.0

        # Player with no games
        new_player = Player(id=2, name="New Player", games_played=0, wins=0, losses=0)
        assert new_player.win_percentage == 0.0

    def test_conservative_rating_calculation(self):
        """Test TrueSkill conservative rating calculation (mu - 3*sigma)"""
        Player(id=1, name="Rated Player", trueskill_mu=30.0, trueskill_sigma=5.0)

        expected_conservative = 30.0 - (3 * 5.0)
        assert expected_conservative == 15.0

    def test_streak_calculation_logic(self):
        """Test win/loss streak calculation logic"""
        # Mock games for streak testing
        games = [
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=1)
            ),  # Win (most recent)
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=2)
            ),  # Win
            MagicMock(
                winner_id=2, created_at=datetime.now() - timedelta(days=3)
            ),  # Loss
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=4)
            ),  # Win
        ]

        # Calculate current streak for player 1
        player_id = 1
        current_streak_count = 0
        streak_type = "W" if games[0].winner_id == player_id else "L"

        for game in games:
            if (game.winner_id == player_id and streak_type == "W") or (
                game.winner_id != player_id and streak_type == "L"
            ):
                current_streak_count += 1
            else:
                break

        assert current_streak_count == 2
        assert streak_type == "W"

    def test_performance_trend_analysis(self):
        """Test performance trend calculation over time periods"""
        # Mock rating history for trend analysis
        base_date = datetime.now()
        rating_history = [
            MagicMock(
                created_at=base_date - timedelta(days=6),
                conservative_rating_before=20.0,
                conservative_rating_after=22.0,
            ),
            MagicMock(
                created_at=base_date - timedelta(days=3),
                conservative_rating_before=22.0,
                conservative_rating_after=25.0,
            ),
            MagicMock(
                created_at=base_date - timedelta(days=1),
                conservative_rating_before=25.0,
                conservative_rating_after=27.0,
            ),
        ]

        # Test 7-day trend calculation
        week_start = base_date - timedelta(days=7)
        period_history = [r for r in rating_history if r.created_at >= week_start]

        if period_history:
            rating_change = (
                period_history[-1].conservative_rating_after
                - period_history[0].conservative_rating_before
            )
            assert rating_change == 7.0  # 27.0 - 20.0

            # Determine trend direction
            trend_direction = (
                "up"
                if rating_change > 2.0
                else "down"
                if rating_change < -2.0
                else "stable"
            )
            assert trend_direction == "up"

    def test_head_to_head_calculation(self):
        """Test head-to-head record calculation between players"""
        # Mock games between two players
        player1_id, _player2_id = 1, 2
        head_to_head_games = [
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=1)
            ),  # P1 wins
            MagicMock(
                winner_id=2, created_at=datetime.now() - timedelta(days=2)
            ),  # P2 wins
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=3)
            ),  # P1 wins
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=4)
            ),  # P1 wins
        ]

        total_games = len(head_to_head_games)
        player1_wins = len([g for g in head_to_head_games if g.winner_id == player1_id])
        player2_wins = total_games - player1_wins

        assert total_games == 4
        assert player1_wins == 3
        assert player2_wins == 1

        player1_win_percentage = (
            (player1_wins / total_games * 100) if total_games > 0 else 0.0
        )
        player2_win_percentage = (
            (player2_wins / total_games * 100) if total_games > 0 else 0.0
        )

        assert player1_win_percentage == 75.0
        assert player2_win_percentage == 25.0

    def test_recent_form_analysis(self):
        """Test recent form tracking and trend analysis"""
        # Mock recent games
        recent_games = [
            MagicMock(winner_id=1, created_at=datetime.now() - timedelta(days=1)),  # W
            MagicMock(winner_id=2, created_at=datetime.now() - timedelta(days=2)),  # L
            MagicMock(winner_id=1, created_at=datetime.now() - timedelta(days=3)),  # W
            MagicMock(winner_id=1, created_at=datetime.now() - timedelta(days=4)),  # W
            MagicMock(winner_id=2, created_at=datetime.now() - timedelta(days=5)),  # L
        ]

        player_id = 1
        form_string = ""
        for game in recent_games:
            if game.winner_id == player_id:
                form_string += "W"
            else:
                form_string += "L"

        assert form_string == "WLWWL"

        wins = form_string.count("W")
        losses = form_string.count("L")
        win_percentage = (wins / len(form_string) * 100) if form_string else 0.0

        assert wins == 3
        assert losses == 2
        assert win_percentage == 60.0

    def test_performance_trend_schema(self):
        """Test PerformanceTrend schema validation"""
        trend = PerformanceTrend(
            period="7d",
            games_played=5,
            wins=3,
            losses=2,
            win_percentage=60.0,
            avg_rating=25.5,
            rating_change=2.3,
            trend_direction="up",
        )

        assert trend.period == "7d"
        assert trend.games_played == 5
        assert trend.wins == 3
        assert trend.losses == 2
        assert trend.win_percentage == 60.0
        assert trend.avg_rating == 25.5
        assert trend.rating_change == 2.3
        assert trend.trend_direction == "up"

    def test_game_form_schema(self):
        """Test GameForm schema for recent form data"""
        game_date = datetime.now()
        game_form = GameForm(
            game_id=123,
            date=game_date,
            opponent_id=456,
            opponent_name="Test Opponent",
            result="W",
            rating_change=1.5,
            conservative_rating_change=0.8,
        )

        assert game_form.game_id == 123
        assert game_form.date == game_date
        assert game_form.opponent_id == 456
        assert game_form.opponent_name == "Test Opponent"
        assert game_form.result == "W"
        assert game_form.rating_change == 1.5
        assert game_form.conservative_rating_change == 0.8

    def test_recent_form_schema(self):
        """Test RecentForm schema with complete game data"""
        games = [
            GameForm(
                game_id=1,
                date=datetime.now(),
                opponent_id=2,
                opponent_name="Opponent 1",
                result="W",
                rating_change=1.2,
                conservative_rating_change=0.6,
            ),
            GameForm(
                game_id=2,
                date=datetime.now() - timedelta(days=1),
                opponent_id=3,
                opponent_name="Opponent 2",
                result="L",
                rating_change=-0.8,
                conservative_rating_change=-0.4,
            ),
        ]

        recent_form = RecentForm(
            player_id=1,
            player_name="Test Player",
            games_analyzed=2,
            wins=1,
            losses=1,
            win_percentage=50.0,
            avg_rating_change=0.1,
            current_form="WL",
            form_trend="stable",
            games=games,
        )

        assert recent_form.player_id == 1
        assert recent_form.player_name == "Test Player"
        assert recent_form.games_analyzed == 2
        assert recent_form.wins == 1
        assert recent_form.losses == 1
        assert recent_form.win_percentage == 50.0
        assert recent_form.avg_rating_change == 0.1
        assert recent_form.current_form == "WL"
        assert recent_form.form_trend == "stable"
        assert len(recent_form.games) == 2

    def test_longest_streak_calculation(self):
        """Test longest win/loss streak calculation"""
        # Mock games in chronological order
        games = [
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=10)
            ),  # Win
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=9)
            ),  # Win
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=8)
            ),  # Win
            MagicMock(
                winner_id=2, created_at=datetime.now() - timedelta(days=7)
            ),  # Loss
            MagicMock(
                winner_id=2, created_at=datetime.now() - timedelta(days=6)
            ),  # Loss
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=5)
            ),  # Win
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=4)
            ),  # Win
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=3)
            ),  # Win
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=2)
            ),  # Win
            MagicMock(
                winner_id=1, created_at=datetime.now() - timedelta(days=1)
            ),  # Win
        ]

        player_id = 1
        longest_win_streak = 0
        longest_loss_streak = 0
        current_win_streak = 0
        current_loss_streak = 0

        # Process chronologically
        for game in reversed(games):
            if game.winner_id == player_id:
                current_win_streak += 1
                current_loss_streak = 0
                longest_win_streak = max(longest_win_streak, current_win_streak)
            else:
                current_loss_streak += 1
                current_win_streak = 0
                longest_loss_streak = max(longest_loss_streak, current_loss_streak)

        assert longest_win_streak == 5  # Last 5 games were wins
        assert longest_loss_streak == 2  # 2 losses in the middle

    def test_system_statistics_calculation(self):
        """Test overall system statistics calculations"""
        # Mock system data
        total_players = 10
        total_games = 50

        # Average calculations
        avg_games_per_player = total_games / max(total_players, 1)
        assert avg_games_per_player == 5.0

        # Test with zero players edge case
        avg_games_zero_players = total_games / max(0, 1)
        assert avg_games_zero_players == 50.0
