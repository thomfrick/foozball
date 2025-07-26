# ABOUTME: Unit tests for TrueSkill rating calculation service
# ABOUTME: Tests rating calculations, player updates, and game quality metrics

import pytest

from app.models.player import Player
from app.services.trueskill_service import TrueSkillService, trueskill_service


class TestTrueSkillService:
    """Test suite for TrueSkill rating calculations"""

    def test_create_rating(self):
        """Test creating a TrueSkill rating object"""
        service = TrueSkillService()

        # Test default rating
        rating = service.create_rating()
        assert abs(rating.mu - 25.0) < 0.001
        assert abs(rating.sigma - 8.3333) < 0.001

        # Test custom rating
        custom_rating = service.create_rating(mu=30.0, sigma=5.0)
        assert abs(custom_rating.mu - 30.0) < 0.001
        assert abs(custom_rating.sigma - 5.0) < 0.001

    def test_get_player_rating(self):
        """Test extracting TrueSkill rating from player model"""
        service = TrueSkillService()

        player = Player(name="Test Player", trueskill_mu=25.0, trueskill_sigma=8.3333)

        rating = service.get_player_rating(player)
        assert abs(rating.mu - 25.0) < 0.001
        assert abs(rating.sigma - 8.3333) < 0.001

    def test_calculate_new_ratings_player1_wins(self):
        """Test TrueSkill calculation when player1 wins"""
        service = TrueSkillService()

        # Create two equally matched players
        player1 = Player(
            id=1, name="Player 1", trueskill_mu=25.0, trueskill_sigma=8.3333
        )
        player2 = Player(
            id=2, name="Player 2", trueskill_mu=25.0, trueskill_sigma=8.3333
        )

        # Player 1 wins
        new_rating1, new_rating2 = service.calculate_new_ratings(
            player1, player2, player1.id
        )

        # Winner should gain rating, loser should lose rating
        assert new_rating1.mu > player1.trueskill_mu
        assert new_rating2.mu < player2.trueskill_mu

        # Both players should have reduced uncertainty (sigma)
        assert new_rating1.sigma < player1.trueskill_sigma
        assert new_rating2.sigma < player2.trueskill_sigma

    def test_calculate_new_ratings_player2_wins(self):
        """Test TrueSkill calculation when player2 wins"""
        service = TrueSkillService()

        # Create two equally matched players
        player1 = Player(
            id=1, name="Player 1", trueskill_mu=25.0, trueskill_sigma=8.3333
        )
        player2 = Player(
            id=2, name="Player 2", trueskill_mu=25.0, trueskill_sigma=8.3333
        )

        # Player 2 wins
        new_rating1, new_rating2 = service.calculate_new_ratings(
            player1, player2, player2.id
        )

        # Winner should gain rating, loser should lose rating
        assert new_rating1.mu < player1.trueskill_mu
        assert new_rating2.mu > player2.trueskill_mu

        # Both players should have reduced uncertainty (sigma)
        assert new_rating1.sigma < player1.trueskill_sigma
        assert new_rating2.sigma < player2.trueskill_sigma

    def test_calculate_new_ratings_upset_victory(self):
        """Test TrueSkill calculation when lower-rated player beats higher-rated player"""
        service = TrueSkillService()

        # Create unequally matched players
        strong_player = Player(
            id=1, name="Strong Player", trueskill_mu=35.0, trueskill_sigma=5.0
        )
        weak_player = Player(
            id=2, name="Weak Player", trueskill_mu=15.0, trueskill_sigma=5.0
        )

        # Weak player wins (upset!)
        new_rating1, new_rating2 = service.calculate_new_ratings(
            strong_player, weak_player, weak_player.id
        )

        # Strong player should lose more rating than in an even match
        assert new_rating1.mu < strong_player.trueskill_mu

        # Weak player should gain more rating than in an even match
        assert new_rating2.mu > weak_player.trueskill_mu

        # The rating change should be significant due to unexpected result
        mu_loss = strong_player.trueskill_mu - new_rating1.mu
        mu_gain = new_rating2.mu - weak_player.trueskill_mu

        # Both changes should be meaningful (> 1 point)
        assert mu_loss > 1.0
        assert mu_gain > 1.0

    def test_update_player_ratings(self):
        """Test complete player rating update process"""
        service = TrueSkillService()

        # Create players with some game history
        player1 = Player(
            id=1,
            name="Player 1",
            trueskill_mu=25.0,
            trueskill_sigma=8.3333,
            games_played=5,
            wins=3,
            losses=2,
        )
        player2 = Player(
            id=2,
            name="Player 2",
            trueskill_mu=25.0,
            trueskill_sigma=8.3333,
            games_played=5,
            wins=2,
            losses=3,
        )

        # Store original values
        original_mu1 = player1.trueskill_mu
        original_mu2 = player2.trueskill_mu

        # Player 1 wins
        updated_p1, updated_p2 = service.update_player_ratings(
            player1, player2, player1.id
        )

        # Check rating updates
        assert updated_p1.trueskill_mu > original_mu1
        assert updated_p2.trueskill_mu < original_mu2

        # Check game statistics updates
        assert updated_p1.games_played == 6
        assert updated_p1.wins == 4
        assert updated_p1.losses == 2

        assert updated_p2.games_played == 6
        assert updated_p2.wins == 2
        assert updated_p2.losses == 4

    def test_calculate_new_ratings_invalid_winner(self):
        """Test error handling for invalid winner ID"""
        service = TrueSkillService()

        player1 = Player(id=1, name="Player 1")
        player2 = Player(id=2, name="Player 2")

        with pytest.raises(ValueError, match="Winner ID 3 must be either 1 or 2"):
            service.calculate_new_ratings(player1, player2, 3)

    def test_get_conservative_rating(self):
        """Test conservative rating calculation (mu - 3*sigma)"""
        service = TrueSkillService()

        player = Player(name="Test Player", trueskill_mu=25.0, trueskill_sigma=5.0)

        conservative = service.get_conservative_rating(player)
        expected = 25.0 - (3 * 5.0)  # 10.0
        assert conservative == expected

    def test_get_match_quality(self):
        """Test match quality calculation between players"""
        service = TrueSkillService()

        # Evenly matched players should have high quality
        player1 = Player(name="Player 1", trueskill_mu=25.0, trueskill_sigma=5.0)
        player2 = Player(name="Player 2", trueskill_mu=25.0, trueskill_sigma=5.0)

        quality_even = service.get_match_quality(player1, player2)
        assert 0.0 <= quality_even <= 1.0
        assert quality_even > 0.5  # Should be high for evenly matched players

        # Unevenly matched players should have lower quality
        strong_player = Player(
            name="Strong Player", trueskill_mu=40.0, trueskill_sigma=3.0
        )
        weak_player = Player(name="Weak Player", trueskill_mu=10.0, trueskill_sigma=3.0)

        quality_uneven = service.get_match_quality(strong_player, weak_player)
        assert 0.0 <= quality_uneven <= 1.0
        assert quality_uneven < quality_even  # Should be lower for mismatched players

    def test_predict_win_probability(self):
        """Test win probability prediction"""
        service = TrueSkillService()

        # Evenly matched players should have ~50% probability
        player1 = Player(name="Player 1", trueskill_mu=25.0, trueskill_sigma=5.0)
        player2 = Player(name="Player 2", trueskill_mu=25.0, trueskill_sigma=5.0)

        prob = service.predict_win_probability(player1, player2)
        assert 0.0 <= prob <= 1.0
        assert abs(prob - 0.5) < 0.1  # Should be close to 50%

        # Stronger player should have higher probability
        strong_player = Player(
            name="Strong Player", trueskill_mu=35.0, trueskill_sigma=3.0
        )
        weak_player = Player(name="Weak Player", trueskill_mu=15.0, trueskill_sigma=3.0)

        prob_strong = service.predict_win_probability(strong_player, weak_player)
        assert prob_strong > 0.7  # Strong player should have high probability

        prob_weak = service.predict_win_probability(weak_player, strong_player)
        assert prob_weak < 0.3  # Weak player should have low probability

    def test_global_service_instance(self):
        """Test that the global service instance is properly configured"""
        # The global instance should be properly configured
        assert trueskill_service is not None
        assert isinstance(trueskill_service, TrueSkillService)

        # Test basic functionality
        player = Player(name="Test Player", trueskill_mu=25.0, trueskill_sigma=8.3333)
        rating = trueskill_service.get_player_rating(player)
        assert abs(rating.mu - 25.0) < 0.001
        assert abs(rating.sigma - 8.3333) < 0.001

    def test_rating_convergence_over_multiple_games(self):
        """Test that ratings converge properly over multiple games"""
        service = TrueSkillService()

        # Create a strong and weak player
        strong_player = Player(
            id=1,
            name="Strong Player",
            trueskill_mu=25.0,
            trueskill_sigma=8.3333,
            games_played=0,
            wins=0,
            losses=0,
        )
        weak_player = Player(
            id=2,
            name="Weak Player",
            trueskill_mu=25.0,
            trueskill_sigma=8.3333,
            games_played=0,
            wins=0,
            losses=0,
        )

        # Simulate 10 games where strong player always wins
        for _ in range(10):
            service.update_player_ratings(strong_player, weak_player, strong_player.id)

        # Strong player should have much higher rating
        assert strong_player.trueskill_mu > 30.0
        assert weak_player.trueskill_mu < 20.0

        # Both should have lower uncertainty after 10 games
        assert strong_player.trueskill_sigma < 7.0
        assert weak_player.trueskill_sigma < 7.0

        # Game statistics should be correct
        assert strong_player.games_played == 10
        assert strong_player.wins == 10
        assert strong_player.losses == 0

        assert weak_player.games_played == 10
        assert weak_player.wins == 0
        assert weak_player.losses == 10
