# ABOUTME: Integration tests for statistics API endpoints with real database
# ABOUTME: Tests complete statistics workflows with comprehensive data scenarios

from datetime import datetime, timedelta

from fastapi.testclient import TestClient

from app.db.test_database import test_db
from app.main import app
from app.models.game import Game
from app.models.player import Player
from app.models.rating_history import RatingHistory

client = TestClient(app)


class TestStatisticsAPI:
    """Integration tests for statistics API endpoints"""

    def setup_method(self):
        """Set up test data for each test"""
        self.db = test_db.get_session()

        # Clean up existing data
        self.db.query(RatingHistory).delete()
        self.db.query(Game).delete()
        self.db.query(Player).delete()
        self.db.commit()

    def teardown_method(self):
        """Clean up after each test"""
        self.db.close()

    def test_statistics_summary_empty_database(self):
        """Test statistics summary with empty database"""
        response = client.get("/api/v1/statistics/summary")
        assert response.status_code == 200

        data = response.json()
        assert data["total_players"] == 0
        assert data["active_players"] == 0
        assert data["total_games"] == 0
        assert data["games_today"] == 0
        assert data["games_this_week"] == 0
        assert data["games_this_month"] == 0
        assert data["highest_rated_player"] is None
        assert data["most_active_player"] is None
        assert data["best_win_rate_player"] is None
        assert data["avg_games_per_player"] == 0.0
        assert data["avg_rating"] == 0.0
        assert data["most_common_matchup"] is None

    def test_statistics_summary_with_players_no_games(self):
        """Test statistics summary with players but no games"""
        # Create test players
        player1 = Player(name="Alice", trueskill_mu=25.0, trueskill_sigma=8.333)
        player2 = Player(name="Bob", trueskill_mu=25.0, trueskill_sigma=8.333)

        self.db.add_all([player1, player2])
        self.db.commit()

        response = client.get("/api/v1/statistics/summary")
        assert response.status_code == 200

        data = response.json()
        assert data["total_players"] == 2
        assert data["active_players"] == 2
        assert data["total_games"] == 0
        assert data["highest_rated_player"] is None  # No games >= 5
        assert data["most_active_player"]["player_name"] in ["Alice", "Bob"]
        assert data["best_win_rate_player"] is None  # No games >= 10

    def test_statistics_summary_with_games(self):
        """Test statistics summary with players and games"""
        # Create test players
        player1 = Player(
            name="Alice",
            trueskill_mu=30.0,
            trueskill_sigma=5.0,
            games_played=12,
            wins=8,
            losses=4,
        )
        player2 = Player(
            name="Bob",
            trueskill_mu=22.0,
            trueskill_sigma=6.0,
            games_played=15,
            wins=6,
            losses=9,
        )

        self.db.add_all([player1, player2])
        self.db.commit()

        # Create test games
        now = datetime.utcnow()
        games = [
            Game(
                player1_id=player1.id,
                player2_id=player2.id,
                winner_id=player1.id,
                created_at=now - timedelta(hours=2),
            ),  # Today
            Game(
                player1_id=player1.id,
                player2_id=player2.id,
                winner_id=player2.id,
                created_at=now - timedelta(days=2),
            ),  # This week
            Game(
                player1_id=player1.id,
                player2_id=player2.id,
                winner_id=player1.id,
                created_at=now - timedelta(days=10),
            ),  # This month
        ]

        self.db.add_all(games)
        self.db.commit()

        response = client.get("/api/v1/statistics/summary")
        assert response.status_code == 200

        data = response.json()
        assert data["total_players"] == 2
        assert data["active_players"] == 2
        assert data["total_games"] == 3
        assert data["games_today"] == 1
        assert data["games_this_week"] == 2
        assert data["games_this_month"] == 3

        # Alice should be highest rated (30 - 3*5 = 15 vs 22 - 3*6 = 4)
        assert data["highest_rated_player"]["player_name"] == "Alice"

        # Bob has more games (15 vs 12)
        assert data["most_active_player"]["player_name"] == "Bob"

        # Alice has better win rate (8/12 = 66.7% vs 6/15 = 40%)
        assert data["best_win_rate_player"]["player_name"] == "Alice"

    def test_player_statistics_not_found(self):
        """Test player statistics endpoint with non-existent player"""
        response = client.get("/api/v1/statistics/players/999")
        assert response.status_code == 404
        assert "Player not found" in response.json()["detail"]

    def test_player_statistics_comprehensive(self):
        """Test comprehensive player statistics calculation"""
        # Create test player
        player = Player(
            name="Charlie",
            trueskill_mu=28.0,
            trueskill_sigma=4.0,
            games_played=10,
            wins=7,
            losses=3,
        )
        opponent = Player(name="David", trueskill_mu=22.0, trueskill_sigma=6.0)

        self.db.add_all([player, opponent])
        self.db.commit()

        # Create game history (most recent first)
        now = datetime.utcnow()
        games = [
            # Recent wins
            Game(
                player1_id=player.id,
                player2_id=opponent.id,
                winner_id=player.id,
                created_at=now - timedelta(days=1),
            ),
            Game(
                player1_id=player.id,
                player2_id=opponent.id,
                winner_id=player.id,
                created_at=now - timedelta(days=2),
            ),
            # Loss
            Game(
                player1_id=player.id,
                player2_id=opponent.id,
                winner_id=opponent.id,
                created_at=now - timedelta(days=3),
            ),
            # Older wins
            Game(
                player1_id=player.id,
                player2_id=opponent.id,
                winner_id=player.id,
                created_at=now - timedelta(days=30),
            ),
        ]

        self.db.add_all(games)
        self.db.commit()

        # Create rating history
        for i, game in enumerate(games):
            rating_entry = RatingHistory(
                player_id=player.id,
                game_id=game.id,
                trueskill_mu_before=25.0 + i,
                trueskill_sigma_before=8.0,
                trueskill_mu_after=26.0 + i,
                trueskill_sigma_after=7.5,
                rating_system="trueskill",
                created_at=game.created_at,
            )
            self.db.add(rating_entry)

        self.db.commit()

        response = client.get(f"/api/v1/statistics/players/{player.id}")
        if response.status_code != 200:
            print(f"Response status: {response.status_code}")
            print(f"Response content: {response.text}")
        assert response.status_code == 200

        data = response.json()
        assert data["player_id"] == player.id
        assert data["player_name"] == "Charlie"
        assert data["total_games"] == 4  # Games we created
        assert data["wins"] == 3
        assert data["losses"] == 1
        assert data["win_percentage"] == 75.0
        assert data["current_mu"] == 28.0
        assert data["current_sigma"] == 4.0

        # Check performance trends
        assert len(data["performance_trends"]) == 4  # 7d, 30d, 90d, all
        assert all(
            trend["period"] in ["7d", "30d", "90d", "all"]
            for trend in data["performance_trends"]
        )

        # Check recent form
        assert data["recent_form"]["games_analyzed"] == 4
        assert data["recent_form"]["current_form"] == "WWLW"  # Most recent first

        # Check streak (should be 2 game win streak based on most recent games)
        assert "2 game win streak" in data["current_streak"]

    def test_head_to_head_not_found(self):
        """Test head-to-head endpoint with non-existent players"""
        response = client.get("/api/v1/statistics/head-to-head/999/998")
        assert response.status_code == 404

    def test_head_to_head_same_player(self):
        """Test head-to-head endpoint with same player ID"""
        # Create test player
        player = Player(name="Self", trueskill_mu=25.0, trueskill_sigma=8.333)
        self.db.add(player)
        self.db.commit()

        response = client.get(
            f"/api/v1/statistics/head-to-head/{player.id}/{player.id}"
        )
        assert response.status_code == 400
        assert "Cannot compare player with themselves" in response.json()["detail"]

    def test_head_to_head_comprehensive(self):
        """Test comprehensive head-to-head statistics"""
        # Create test players
        player1 = Player(name="Elena", trueskill_mu=28.0, trueskill_sigma=5.0)
        player2 = Player(name="Frank", trueskill_mu=24.0, trueskill_sigma=6.0)

        self.db.add_all([player1, player2])
        self.db.commit()

        # Create head-to-head games (most recent first)
        now = datetime.utcnow()
        games = [
            # Elena wins recent games
            Game(
                player1_id=player1.id,
                player2_id=player2.id,
                winner_id=player1.id,
                created_at=now - timedelta(days=1),
            ),
            Game(
                player1_id=player1.id,
                player2_id=player2.id,
                winner_id=player1.id,
                created_at=now - timedelta(days=2),
            ),
            # Frank wins one
            Game(
                player1_id=player2.id,
                player2_id=player1.id,
                winner_id=player2.id,
                created_at=now - timedelta(days=3),
            ),
            # Elena wins older games
            Game(
                player1_id=player1.id,
                player2_id=player2.id,
                winner_id=player1.id,
                created_at=now - timedelta(days=4),
            ),
            Game(
                player1_id=player2.id,
                player2_id=player1.id,
                winner_id=player1.id,
                created_at=now - timedelta(days=5),
            ),
        ]

        self.db.add_all(games)
        self.db.commit()

        response = client.get(
            f"/api/v1/statistics/head-to-head/{player1.id}/{player2.id}"
        )
        assert response.status_code == 200

        data = response.json()

        # Check head-to-head record
        h2h = data["head_to_head"]
        assert h2h["player1_id"] == player1.id
        assert h2h["player1_name"] == "Elena"
        assert h2h["player2_id"] == player2.id
        assert h2h["player2_name"] == "Frank"
        assert h2h["total_games"] == 5
        assert h2h["player1_wins"] == 4
        assert h2h["player2_wins"] == 1
        assert h2h["player1_win_percentage"] == 80.0
        assert h2h["player2_win_percentage"] == 20.0

        # Check current streak (Elena has 2 game win streak)
        assert "Elena - 2 game win streak" in h2h["current_streak"]

        # Check recent games (should show last 5 games)
        assert len(data["recent_games"]) == 5

    def test_enhanced_leaderboard_empty(self):
        """Test enhanced leaderboard with no players"""
        response = client.get("/api/v1/statistics/leaderboard")
        assert response.status_code == 200

        data = response.json()
        assert data["leaderboard"] == []
        assert data["total_players"] == 0
        assert data["active_players"] == 0
        assert data["total_games"] == 0

    def test_enhanced_leaderboard_with_players(self):
        """Test enhanced leaderboard with multiple players"""
        # Create test players with different ratings
        players = [
            Player(
                name="Grace",
                trueskill_mu=30.0,
                trueskill_sigma=4.0,
                games_played=10,
                wins=8,
                losses=2,
                is_active=True,
            ),
            Player(
                name="Henry",
                trueskill_mu=25.0,
                trueskill_sigma=5.0,
                games_played=8,
                wins=5,
                losses=3,
                is_active=True,
            ),
            Player(
                name="Inactive",
                trueskill_mu=35.0,
                trueskill_sigma=3.0,
                games_played=5,
                wins=4,
                losses=1,
                is_active=False,
            ),  # Should be filtered out
        ]

        self.db.add_all(players)
        self.db.commit()

        response = client.get("/api/v1/statistics/leaderboard?page=1&page_size=10")
        assert response.status_code == 200

        data = response.json()

        # Should only show active players, sorted by conservative rating
        assert len(data["leaderboard"]) == 2
        assert data["total_players"] == 3
        assert data["active_players"] == 2

        # Grace should be ranked #1 (higher conservative rating: 30-4*3=18 vs 25-5*3=10)
        leaderboard = data["leaderboard"]
        assert leaderboard[0]["player_name"] == "Grace"
        assert leaderboard[0]["rank"] == 1
        assert leaderboard[1]["player_name"] == "Henry"
        assert leaderboard[1]["rank"] == 2

    def test_leaderboard_filtering_and_sorting(self):
        """Test leaderboard filtering and sorting options"""
        # Create players with different stats
        players = [
            Player(
                name="Alice",
                trueskill_mu=25.0,
                trueskill_sigma=8.0,
                games_played=5,
                wins=3,
                losses=2,
            ),
            Player(
                name="Bob",
                trueskill_mu=30.0,
                trueskill_sigma=6.0,
                games_played=15,
                wins=12,
                losses=3,
            ),
            Player(
                name="Charlie",
                trueskill_mu=20.0,
                trueskill_sigma=7.0,
                games_played=2,
                wins=1,
                losses=1,
            ),
        ]

        self.db.add_all(players)
        self.db.commit()

        # Test minimum games filter
        response = client.get("/api/v1/statistics/leaderboard?min_games=5")
        assert response.status_code == 200

        data = response.json()
        assert len(data["leaderboard"]) == 2  # Charlie filtered out

        # Test sorting by wins
        response = client.get("/api/v1/statistics/leaderboard?sort_by=wins")
        assert response.status_code == 200

        data = response.json()
        leaderboard = data["leaderboard"]
        # Bob should be first (12 wins)
        assert leaderboard[0]["player_name"] == "Bob"
        assert leaderboard[0]["wins"] == 12

    def test_leaderboard_pagination(self):
        """Test leaderboard pagination"""
        # Create multiple players
        players = [
            Player(
                name=f"Player{i}",
                trueskill_mu=25.0 + i,
                trueskill_sigma=8.0,
                games_played=i,
                wins=i // 2,
                losses=i // 2,
            )
            for i in range(1, 6)  # 5 players
        ]

        self.db.add_all(players)
        self.db.commit()

        # Test first page with page_size=2
        response = client.get("/api/v1/statistics/leaderboard?page=1&page_size=2")
        assert response.status_code == 200

        data = response.json()
        assert len(data["leaderboard"]) == 2
        assert data["leaderboard"][0]["rank"] == 1
        assert data["leaderboard"][1]["rank"] == 2

        # Test second page
        response = client.get("/api/v1/statistics/leaderboard?page=2&page_size=2")
        assert response.status_code == 200

        data = response.json()
        assert len(data["leaderboard"]) == 2
        assert data["leaderboard"][0]["rank"] == 3
        assert data["leaderboard"][1]["rank"] == 4

    def test_statistics_endpoints_error_handling(self):
        """Test error handling in statistics endpoints"""
        # Test invalid player ID formats
        response = client.get("/api/v1/statistics/players/invalid")
        assert response.status_code == 422  # Validation error

        # Test invalid head-to-head parameters
        response = client.get("/api/v1/statistics/head-to-head/invalid/123")
        assert response.status_code == 422  # Validation error

        # Test invalid leaderboard parameters
        response = client.get(
            "/api/v1/statistics/leaderboard?page=0"
        )  # page must be >= 1
        assert response.status_code == 422

        response = client.get(
            "/api/v1/statistics/leaderboard?page_size=200"
        )  # page_size must be <= 100
        assert response.status_code == 422
