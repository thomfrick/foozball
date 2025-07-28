# ABOUTME: Unit tests for Team and TeamGame models
# ABOUTME: Tests team model behavior, properties, validation, and relationships

import pytest

from app.models.player import Player
from app.models.team import Team
from app.models.teamgame import TeamGame


class TestTeamModel:
    """Test Team model behavior"""

    def test_team_creation(self):
        """Test basic team model creation"""
        team = Team(
            player1_id=1,
            player2_id=2,
            trueskill_mu=50.0,
            trueskill_sigma=16.6666,
            games_played=0,
            wins=0,
            losses=0,
            is_active=True,
        )

        assert team.player1_id == 1
        assert team.player2_id == 2
        assert team.trueskill_mu == 50.0
        assert team.trueskill_sigma == 16.6666
        assert team.games_played == 0
        assert team.wins == 0
        assert team.losses == 0
        assert team.is_active is True

    def test_team_defaults(self):
        """Test team model default values"""
        team = Team(player1_id=1, player2_id=2)

        # Note: Defaults are set by SQLAlchemy, not at object creation
        # These would be set when the object is added to database
        assert team.player1_id == 1
        assert team.player2_id == 2

    def test_create_team_key_ordered(self):
        """Test team key creation with proper ordering"""
        # Test normal order
        key1 = Team.create_team_key(1, 2)
        assert key1 == (1, 2)

        # Test reverse order - should be normalized
        key2 = Team.create_team_key(2, 1)
        assert key2 == (1, 2)

        # Both should be identical
        assert key1 == key2

    def test_create_team_key_same_players_error(self):
        """Test that creating team key with same players raises error"""
        with pytest.raises(ValueError, match="Players must be different"):
            Team.create_team_key(1, 1)

    def test_win_percentage_calculation(self):
        """Test team win percentage property calculation"""
        # Team with no games
        team = Team(player1_id=1, player2_id=2, games_played=0, wins=0)
        assert team.win_percentage == 0.0

        # Team with games
        team = Team(player1_id=1, player2_id=2, games_played=10, wins=7, losses=3)
        assert team.win_percentage == 70.0

        # Team with all wins
        team = Team(player1_id=1, player2_id=2, games_played=5, wins=5, losses=0)
        assert team.win_percentage == 100.0

        # Team with no wins
        team = Team(player1_id=1, player2_id=2, games_played=3, wins=0, losses=3)
        assert team.win_percentage == 0.0

    def test_conservative_rating_calculation(self):
        """Test conservative rating property (mu - 3*sigma)"""
        team = Team(
            player1_id=1,
            player2_id=2,
            trueskill_mu=50.0,
            trueskill_sigma=10.0,
        )

        expected_conservative = 50.0 - (3 * 10.0)
        assert team.conservative_rating == expected_conservative
        assert team.conservative_rating == 20.0

    def test_player_names_property(self):
        """Test player_names property formatting"""
        # Mock players (these would normally be set via relationships)
        player1 = Player(id=1, name="Alice")
        player2 = Player(id=2, name="Bob")

        team = Team(player1_id=1, player2_id=2)
        # Simulate relationship loading
        team.player1 = player1
        team.player2 = player2

        assert team.player_names == "Alice & Bob"

    def test_team_repr(self):
        """Test team string representation"""
        # Mock players
        player1 = Player(id=1, name="Alice")
        player2 = Player(id=2, name="Bob")

        team = Team(
            id=42,
            player1_id=1,
            player2_id=2,
            trueskill_mu=50.0,
            trueskill_sigma=10.0,
        )
        team.player1 = player1
        team.player2 = player2

        repr_str = repr(team)
        assert "Team(id=42" in repr_str
        assert "Alice & Bob" in repr_str
        assert "20.0" in repr_str  # Conservative rating


class TestTeamGameModel:
    """Test TeamGame model behavior"""

    def test_teamgame_creation(self):
        """Test basic team game model creation"""
        team_game = TeamGame(
            team1_id=1,
            team2_id=2,
            winner_team_id=1,
        )

        assert team_game.team1_id == 1
        assert team_game.team2_id == 2
        assert team_game.winner_team_id == 1

    def test_loser_team_id_property(self):
        """Test loser_team_id property calculation"""
        # Team 1 wins
        game1 = TeamGame(team1_id=1, team2_id=2, winner_team_id=1)
        assert game1.loser_team_id == 2

        # Team 2 wins
        game2 = TeamGame(team1_id=1, team2_id=2, winner_team_id=2)
        assert game2.loser_team_id == 1

    def test_loser_team_property(self):
        """Test loser_team property returns correct team object"""
        # Mock teams
        team1 = Team(id=1, player1_id=1, player2_id=2)
        team2 = Team(id=2, player1_id=3, player2_id=4)

        # Team 1 wins, so team 2 loses
        game = TeamGame(team1_id=1, team2_id=2, winner_team_id=1)
        game.team1 = team1
        game.team2 = team2

        assert game.loser_team == team2

        # Team 2 wins, so team 1 loses
        game2 = TeamGame(team1_id=1, team2_id=2, winner_team_id=2)
        game2.team1 = team1
        game2.team2 = team2

        assert game2.loser_team == team1

    def test_teamgame_repr(self):
        """Test team game string representation"""
        # Mock teams with player names
        player1 = Player(id=1, name="Alice")
        player2 = Player(id=2, name="Bob")
        player3 = Player(id=3, name="Charlie")
        player4 = Player(id=4, name="Dana")

        team1 = Team(id=1, player1_id=1, player2_id=2)
        team1.player1 = player1
        team1.player2 = player2

        team2 = Team(id=2, player1_id=3, player2_id=4)
        team2.player1 = player3
        team2.player2 = player4

        winner_team = team1

        game = TeamGame(id=42, team1_id=1, team2_id=2, winner_team_id=1)
        game.team1 = team1
        game.team2 = team2
        game.winner_team = winner_team

        repr_str = repr(game)
        assert "TeamGame(id=42" in repr_str
        assert "Alice & Bob vs Charlie & Dana" in repr_str
        assert "winner=Alice & Bob" in repr_str


class TestTeamModelConstraints:
    """Test Team model database constraints and validation"""

    def test_team_key_consistency(self):
        """Test that team key creation is always consistent"""
        # Multiple calls with same players (different order) should be identical
        key1 = Team.create_team_key(5, 3)
        key2 = Team.create_team_key(3, 5)
        key3 = Team.create_team_key(5, 3)

        assert key1 == key2 == key3
        assert key1 == (3, 5)  # Should always be ordered

    def test_team_key_edge_cases(self):
        """Test team key creation with edge case values"""
        # Large IDs
        key = Team.create_team_key(999999, 1)
        assert key == (1, 999999)

        # Zero ID (edge case)
        key = Team.create_team_key(0, 5)
        assert key == (0, 5)

    def test_win_percentage_edge_cases(self):
        """Test win percentage calculation with edge cases"""
        # None values (should default to 0)
        team = Team(player1_id=1, player2_id=2)
        team.games_played = None
        team.wins = None
        assert team.win_percentage == 0.0

        # Mix of None and valid values
        team.games_played = 10
        team.wins = None
        assert team.win_percentage == 0.0

        team.games_played = None
        team.wins = 5
        assert team.win_percentage == 0.0
