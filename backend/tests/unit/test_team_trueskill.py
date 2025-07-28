# ABOUTME: Unit tests for TrueSkill team rating calculations
# ABOUTME: Tests team rating algorithms, player updates, and 2v2 game scenarios

import pytest

from app.models.player import Player
from app.models.team import Team
from app.services.trueskill_service import TrueSkillService, trueskill_service


class TestTeamTrueSkillService:
    """Test suite for TrueSkill team rating calculations"""

    def test_get_team_rating(self):
        """Test extracting TrueSkill rating from team model"""
        service = TrueSkillService()

        team = Team(
            player1_id=1,
            player2_id=2,
            trueskill_mu=50.0,
            trueskill_sigma=16.6666,
        )

        rating = service.get_team_rating(team)
        assert abs(rating.mu - 50.0) < 0.001
        assert abs(rating.sigma - 16.6666) < 0.001

    def test_calculate_initial_team_rating(self):
        """Test initial team rating calculation from individual players"""
        service = TrueSkillService()

        # Create two players with default ratings
        player1 = Player(
            id=1, name="Player 1", trueskill_mu=25.0, trueskill_sigma=8.3333
        )
        player2 = Player(
            id=2, name="Player 2", trueskill_mu=25.0, trueskill_sigma=8.3333
        )

        mu, sigma = service.calculate_initial_team_rating(player1, player2)

        # Team mu should be sum of individual mus
        expected_mu = 25.0 + 25.0
        assert abs(mu - expected_mu) < 0.001
        assert mu == 50.0

        # Team sigma should be sqrt(sigma1^2 + sigma2^2)
        expected_sigma = (8.3333**2 + 8.3333**2) ** 0.5
        assert abs(sigma - expected_sigma) < 0.001

    def test_calculate_initial_team_rating_different_players(self):
        """Test initial team rating with players of different skills"""
        service = TrueSkillService()

        # Skilled player
        player1 = Player(id=1, name="Pro", trueskill_mu=35.0, trueskill_sigma=5.0)
        # Beginner player
        player2 = Player(id=2, name="Novice", trueskill_mu=15.0, trueskill_sigma=10.0)

        mu, sigma = service.calculate_initial_team_rating(player1, player2)

        # Team mu should be sum
        assert abs(mu - 50.0) < 0.001  # 35 + 15

        # Team sigma should be sqrt(25 + 100) = sqrt(125)
        expected_sigma = (5.0**2 + 10.0**2) ** 0.5
        assert abs(sigma - expected_sigma) < 0.001

    def test_calculate_new_team_ratings_team1_wins(self):
        """Test team rating calculation when team1 wins"""
        service = TrueSkillService()

        # Create two equally matched teams
        team1 = Team(
            id=1, player1_id=1, player2_id=2, trueskill_mu=50.0, trueskill_sigma=16.6666
        )
        team2 = Team(
            id=2, player1_id=3, player2_id=4, trueskill_mu=50.0, trueskill_sigma=16.6666
        )

        # Team 1 wins
        new_rating1, new_rating2 = service.calculate_new_team_ratings(team1, team2, 1)

        # Winner should gain rating, loser should lose rating
        assert new_rating1.mu > 50.0
        assert new_rating2.mu < 50.0

        # Uncertainty should decrease for both teams
        assert new_rating1.sigma < 16.6666
        assert new_rating2.sigma < 16.6666

    def test_calculate_new_team_ratings_team2_wins(self):
        """Test team rating calculation when team2 wins"""
        service = TrueSkillService()

        team1 = Team(
            id=1, player1_id=1, player2_id=2, trueskill_mu=50.0, trueskill_sigma=16.6666
        )
        team2 = Team(
            id=2, player1_id=3, player2_id=4, trueskill_mu=50.0, trueskill_sigma=16.6666
        )

        # Team 2 wins
        new_rating1, new_rating2 = service.calculate_new_team_ratings(team1, team2, 2)

        # Team 2 should gain rating, team 1 should lose rating
        assert new_rating1.mu < 50.0
        assert new_rating2.mu > 50.0

        # Uncertainty should decrease
        assert new_rating1.sigma < 16.6666
        assert new_rating2.sigma < 16.6666

    def test_calculate_new_team_ratings_invalid_winner(self):
        """Test error handling for invalid winner team ID"""
        service = TrueSkillService()

        team1 = Team(id=1, player1_id=1, player2_id=2)
        team2 = Team(id=2, player1_id=3, player2_id=4)

        # Invalid winner ID should raise ValueError
        with pytest.raises(
            ValueError, match="Winner team ID 999 must be either 1 or 2"
        ):
            service.calculate_new_team_ratings(team1, team2, 999)

    def test_calculate_team_vs_individual_ratings(self):
        """Test individual player rating updates from team game"""
        service = TrueSkillService()

        # Create 4 players with default ratings
        players = []
        for i in range(1, 5):
            player = Player(
                id=i, name=f"Player {i}", trueskill_mu=25.0, trueskill_sigma=8.3333
            )
            players.append(player)

        # Team 1 wins (winning_team = 1)
        team1_new, team2_new = service.calculate_team_vs_individual_ratings(
            players[0], players[1], players[2], players[3], winning_team=1
        )

        # Winners should gain rating
        assert team1_new[0].mu > 25.0  # Team 1 Player 1
        assert team1_new[1].mu > 25.0  # Team 1 Player 2

        # Losers should lose rating
        assert team2_new[0].mu < 25.0  # Team 2 Player 1
        assert team2_new[1].mu < 25.0  # Team 2 Player 2

        # All players should have reduced uncertainty
        assert team1_new[0].sigma < 8.3333
        assert team1_new[1].sigma < 8.3333
        assert team2_new[0].sigma < 8.3333
        assert team2_new[1].sigma < 8.3333

    def test_calculate_team_vs_individual_ratings_team2_wins(self):
        """Test individual ratings when team 2 wins"""
        service = TrueSkillService()

        players = []
        for i in range(1, 5):
            player = Player(
                id=i, name=f"Player {i}", trueskill_mu=25.0, trueskill_sigma=8.3333
            )
            players.append(player)

        # Team 2 wins (winning_team = 2)
        team1_new, team2_new = service.calculate_team_vs_individual_ratings(
            players[0], players[1], players[2], players[3], winning_team=2
        )

        # Team 1 should lose rating
        assert team1_new[0].mu < 25.0
        assert team1_new[1].mu < 25.0

        # Team 2 should gain rating
        assert team2_new[0].mu > 25.0
        assert team2_new[1].mu > 25.0

    def test_calculate_team_vs_individual_ratings_invalid_winner(self):
        """Test error handling for invalid winning team"""
        service = TrueSkillService()

        players = []
        for i in range(1, 5):
            player = Player(id=i, name=f"Player {i}")
            players.append(player)

        with pytest.raises(ValueError, match="winning_team must be 1 or 2"):
            service.calculate_team_vs_individual_ratings(
                players[0], players[1], players[2], players[3], winning_team=3
            )

    def test_update_team_ratings(self):
        """Test team rating update with stats increment"""
        service = TrueSkillService()

        team1 = Team(
            id=1,
            player1_id=1,
            player2_id=2,
            trueskill_mu=50.0,
            trueskill_sigma=16.6666,
            games_played=5,
            wins=3,
            losses=2,
        )
        team2 = Team(
            id=2,
            player1_id=3,
            player2_id=4,
            trueskill_mu=50.0,
            trueskill_sigma=16.6666,
            games_played=8,
            wins=4,
            losses=4,
        )

        # Team 1 wins
        updated_team1, updated_team2 = service.update_team_ratings(team1, team2, 1)

        # Check rating updates
        assert updated_team1.trueskill_mu > 50.0
        assert updated_team2.trueskill_mu < 50.0

        # Check games_played increment
        assert updated_team1.games_played == 6
        assert updated_team2.games_played == 9

        # Check win/loss updates
        assert updated_team1.wins == 4  # 3 + 1
        assert updated_team1.losses == 2  # unchanged
        assert updated_team2.wins == 4  # unchanged
        assert updated_team2.losses == 5  # 4 + 1

    def test_update_players_from_team_game(self):
        """Test individual player updates from team game"""
        service = TrueSkillService()

        # Create mock players
        players = []
        for i in range(1, 5):
            player = Player(
                id=i,
                name=f"Player {i}",
                trueskill_mu=25.0,
                trueskill_sigma=8.3333,
                games_played=10,
                wins=5,
                losses=5,
            )
            players.append(player)

        # Create mock teams
        team1 = Team(id=1, player1_id=1, player2_id=2)
        team1.player1 = players[0]
        team1.player2 = players[1]

        team2 = Team(id=2, player1_id=3, player2_id=4)
        team2.player1 = players[2]
        team2.player2 = players[3]

        # Team 1 wins
        (t1_players, t2_players) = service.update_players_from_team_game(
            team1, team2, 1
        )

        # Check that all players' games_played incremented
        assert team1.player1.games_played == 11
        assert team1.player2.games_played == 11
        assert team2.player1.games_played == 11
        assert team2.player2.games_played == 11

        # Check win/loss updates
        assert team1.player1.wins == 6  # 5 + 1
        assert team1.player2.wins == 6  # 5 + 1
        assert team1.player1.losses == 5  # unchanged
        assert team1.player2.losses == 5  # unchanged

        assert team2.player1.wins == 5  # unchanged
        assert team2.player2.wins == 5  # unchanged
        assert team2.player1.losses == 6  # 5 + 1
        assert team2.player2.losses == 6  # 5 + 1

        # Check rating updates
        assert team1.player1.trueskill_mu > 25.0  # Winners gain rating
        assert team1.player2.trueskill_mu > 25.0
        assert team2.player1.trueskill_mu < 25.0  # Losers lose rating
        assert team2.player2.trueskill_mu < 25.0

    def test_get_team_match_quality(self):
        """Test team match quality calculation"""
        service = TrueSkillService()

        # Create equally matched players
        players = []
        for i in range(1, 5):
            player = Player(
                id=i, name=f"Player {i}", trueskill_mu=25.0, trueskill_sigma=8.3333
            )
            players.append(player)

        # Create teams
        team1 = Team(id=1, player1_id=1, player2_id=2)
        team1.player1 = players[0]
        team1.player2 = players[1]

        team2 = Team(id=2, player1_id=3, player2_id=4)
        team2.player1 = players[2]
        team2.player2 = players[3]

        quality = service.get_team_match_quality(team1, team2)

        # Quality should be reasonable for equally matched teams
        assert 0.0 <= quality <= 1.0
        assert quality > 0.4  # Should be reasonable for equal teams

    def test_get_team_match_quality_uneven_teams(self):
        """Test match quality with uneven team skills"""
        service = TrueSkillService()

        # Create skilled team
        skilled_players = [
            Player(id=1, name="Pro 1", trueskill_mu=35.0, trueskill_sigma=5.0),
            Player(id=2, name="Pro 2", trueskill_mu=35.0, trueskill_sigma=5.0),
        ]

        # Create beginner team
        beginner_players = [
            Player(id=3, name="Novice 1", trueskill_mu=15.0, trueskill_sigma=10.0),
            Player(id=4, name="Novice 2", trueskill_mu=15.0, trueskill_sigma=10.0),
        ]

        team1 = Team(id=1, player1_id=1, player2_id=2)
        team1.player1 = skilled_players[0]
        team1.player2 = skilled_players[1]

        team2 = Team(id=2, player1_id=3, player2_id=4)
        team2.player1 = beginner_players[0]
        team2.player2 = beginner_players[1]

        quality = service.get_team_match_quality(team1, team2)

        # Quality should be lower for uneven teams
        assert 0.0 <= quality <= 1.0
        assert quality < 0.5  # Should be low for mismatched teams


class TestTrueSkillServiceIntegration:
    """Integration tests using the global trueskill_service instance"""

    def test_global_service_instance(self):
        """Test that global service instance works correctly"""
        # Test with the actual global instance
        player = Player(name="Test", trueskill_mu=25.0, trueskill_sigma=8.3333)
        rating = trueskill_service.get_player_rating(player)

        assert abs(rating.mu - 25.0) < 0.001
        assert abs(rating.sigma - 8.3333) < 0.001

    def test_team_rating_consistency(self):
        """Test that team ratings are consistent across multiple calculations"""
        service = TrueSkillService()

        # Same input should produce same output
        player1 = Player(id=1, name="P1", trueskill_mu=25.0, trueskill_sigma=8.3333)
        player2 = Player(id=2, name="P2", trueskill_mu=25.0, trueskill_sigma=8.3333)

        mu1, sigma1 = service.calculate_initial_team_rating(player1, player2)
        mu2, sigma2 = service.calculate_initial_team_rating(player1, player2)

        assert abs(mu1 - mu2) < 0.001
        assert abs(sigma1 - sigma2) < 0.001
