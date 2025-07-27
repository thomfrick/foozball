# ABOUTME: Integration tests for TrueSkill rating system with game creation
# ABOUTME: Tests complete workflow of game recording and rating updates

import pytest
from sqlalchemy.orm import Session

from app.models.game import Game
from app.models.player import Player
from app.models.rating_history import RatingHistory
from app.services.trueskill_service import trueskill_service


class TestTrueSkillIntegration:
    """Integration tests for TrueSkill rating system"""

    @pytest.fixture
    def sample_players(self, db_session: Session):
        """Create sample players for testing"""
        # Use unique names to avoid database constraint violations
        import uuid

        unique_suffix = str(uuid.uuid4())[:8]

        player1 = Player(
            name=f"Alice-{unique_suffix}",
            trueskill_mu=25.0,
            trueskill_sigma=8.3333,
            games_played=0,
            wins=0,
            losses=0,
        )
        player2 = Player(
            name=f"Bob-{unique_suffix}",
            trueskill_mu=25.0,
            trueskill_sigma=8.3333,
            games_played=0,
            wins=0,
            losses=0,
        )

        db_session.add(player1)
        db_session.add(player2)
        db_session.commit()
        db_session.refresh(player1)
        db_session.refresh(player2)

        return player1, player2

    def test_game_creation_updates_ratings(self, db_session: Session, sample_players):
        """Test that creating a game updates player ratings correctly"""
        player1, player2 = sample_players

        # Store original ratings
        original_mu1 = player1.trueskill_mu
        original_sigma1 = player1.trueskill_sigma
        original_mu2 = player2.trueskill_mu
        original_sigma2 = player2.trueskill_sigma

        # Create a game
        game = Game(player1_id=player1.id, player2_id=player2.id, winner_id=player1.id)

        db_session.add(game)
        db_session.flush()  # Get game ID

        # Update ratings using TrueSkill
        updated_p1, updated_p2 = trueskill_service.update_player_ratings(
            player1, player2, player1.id
        )

        # Create rating history
        history1 = RatingHistory(
            player_id=player1.id,
            game_id=game.id,
            trueskill_mu_before=original_mu1,
            trueskill_sigma_before=original_sigma1,
            trueskill_mu_after=updated_p1.trueskill_mu,
            trueskill_sigma_after=updated_p1.trueskill_sigma,
        )

        history2 = RatingHistory(
            player_id=player2.id,
            game_id=game.id,
            trueskill_mu_before=original_mu2,
            trueskill_sigma_before=original_sigma2,
            trueskill_mu_after=updated_p2.trueskill_mu,
            trueskill_sigma_after=updated_p2.trueskill_sigma,
        )

        db_session.add(history1)
        db_session.add(history2)
        db_session.commit()

        # Verify rating changes
        assert updated_p1.trueskill_mu > original_mu1  # Winner gains rating
        assert updated_p2.trueskill_mu < original_mu2  # Loser loses rating

        # Verify game statistics
        assert updated_p1.games_played == 1
        assert updated_p1.wins == 1
        assert updated_p1.losses == 0

        assert updated_p2.games_played == 1
        assert updated_p2.wins == 0
        assert updated_p2.losses == 1

        # Verify rating history was created
        p1_history = (
            db_session.query(RatingHistory).filter_by(player_id=player1.id).first()
        )
        p2_history = (
            db_session.query(RatingHistory).filter_by(player_id=player2.id).first()
        )

        assert p1_history is not None
        assert p2_history is not None
        assert p1_history.game_id == game.id
        assert p2_history.game_id == game.id

    def test_multiple_games_rating_progression(
        self, db_session: Session, sample_players
    ):
        """Test rating progression over multiple games"""
        player1, player2 = sample_players

        rating_history = []

        # Play 5 games where player1 wins all
        for i in range(5):
            # Store current ratings
            mu1_before = player1.trueskill_mu
            mu2_before = player2.trueskill_mu

            # Create game
            game = Game(
                player1_id=player1.id, player2_id=player2.id, winner_id=player1.id
            )

            db_session.add(game)
            db_session.flush()

            # Update ratings
            trueskill_service.update_player_ratings(player1, player2, player1.id)

            db_session.commit()

            rating_history.append(
                {
                    "game": i + 1,
                    "p1_mu_before": mu1_before,
                    "p1_mu_after": player1.trueskill_mu,
                    "p2_mu_before": mu2_before,
                    "p2_mu_after": player2.trueskill_mu,
                }
            )

        # Verify final statistics
        assert player1.games_played == 5
        assert player1.wins == 5
        assert player1.losses == 0

        assert player2.games_played == 5
        assert player2.wins == 0
        assert player2.losses == 5

        # Verify rating progression
        assert player1.trueskill_mu > 30.0  # Should be significantly higher
        assert player2.trueskill_mu < 20.0  # Should be significantly lower

        # Verify uncertainty decreased
        assert player1.trueskill_sigma < 8.0
        assert player2.trueskill_sigma < 8.0

        # Verify rating changes decreased over time (convergence)
        first_game_change = abs(
            rating_history[0]["p1_mu_after"] - rating_history[0]["p1_mu_before"]
        )
        last_game_change = abs(
            rating_history[4]["p1_mu_after"] - rating_history[4]["p1_mu_before"]
        )

        assert last_game_change < first_game_change

    def test_upset_victory_rating_changes(self, db_session: Session):
        """Test larger rating changes when underdog wins"""
        # Create players with different skill levels
        import uuid

        unique_suffix = str(uuid.uuid4())[:8]

        strong_player = Player(
            name=f"Strong Player Upset-{unique_suffix}",
            trueskill_mu=35.0,
            trueskill_sigma=5.0,
            games_played=20,
            wins=15,
            losses=5,
        )
        weak_player = Player(
            name=f"Weak Player Upset-{unique_suffix}",
            trueskill_mu=15.0,
            trueskill_sigma=5.0,
            games_played=20,
            wins=5,
            losses=15,
        )

        db_session.add(strong_player)
        db_session.add(weak_player)
        db_session.commit()

        # Store original ratings
        strong_mu_before = strong_player.trueskill_mu
        weak_mu_before = weak_player.trueskill_mu

        # Weak player wins (upset!)
        game = Game(
            player1_id=strong_player.id,
            player2_id=weak_player.id,
            winner_id=weak_player.id,
        )

        db_session.add(game)
        db_session.flush()

        # Update ratings
        trueskill_service.update_player_ratings(
            strong_player, weak_player, weak_player.id
        )

        db_session.commit()

        # Verify significant rating changes due to upset
        strong_rating_loss = strong_mu_before - strong_player.trueskill_mu
        weak_rating_gain = weak_player.trueskill_mu - weak_mu_before

        # Both changes should be substantial (> 2 points)
        assert strong_rating_loss > 2.0
        assert weak_rating_gain > 2.0

    def test_rating_history_properties(self, db_session: Session, sample_players):
        """Test rating history model properties"""
        player1, player2 = sample_players

        # Create a game and rating history
        game = Game(player1_id=player1.id, player2_id=player2.id, winner_id=player1.id)

        db_session.add(game)
        db_session.flush()

        # Update ratings
        original_mu = player1.trueskill_mu
        original_sigma = player1.trueskill_sigma

        trueskill_service.update_player_ratings(player1, player2, player1.id)

        # Create rating history
        history = RatingHistory(
            player_id=player1.id,
            game_id=game.id,
            trueskill_mu_before=original_mu,
            trueskill_sigma_before=original_sigma,
            trueskill_mu_after=player1.trueskill_mu,
            trueskill_sigma_after=player1.trueskill_sigma,
        )

        db_session.add(history)
        db_session.commit()

        # Test calculated properties
        assert history.mu_change > 0  # Winner should gain mu
        assert history.sigma_change < 0  # Uncertainty should decrease

        conservative_before = history.conservative_rating_before
        conservative_after = history.conservative_rating_after

        assert conservative_before == original_mu - (3 * original_sigma)
        assert conservative_after == player1.trueskill_mu - (
            3 * player1.trueskill_sigma
        )
        assert (
            history.conservative_rating_change
            == conservative_after - conservative_before
        )

    def test_match_quality_calculation(self, db_session: Session):
        """Test match quality calculation between different player combinations"""
        # Create players with different skill levels
        import uuid

        unique_suffix = str(uuid.uuid4())[:8]

        beginner = Player(
            name=f"Beginner Quality-{unique_suffix}",
            trueskill_mu=15.0,
            trueskill_sigma=8.0,
        )
        intermediate = Player(
            name=f"Intermediate Quality-{unique_suffix}",
            trueskill_mu=25.0,
            trueskill_sigma=5.0,
        )
        expert = Player(
            name=f"Expert Quality-{unique_suffix}",
            trueskill_mu=35.0,
            trueskill_sigma=3.0,
        )

        db_session.add(beginner)
        db_session.add(intermediate)
        db_session.add(expert)
        db_session.commit()

        # Test match qualities
        quality_even = trueskill_service.get_match_quality(intermediate, intermediate)
        quality_moderate = trueskill_service.get_match_quality(beginner, intermediate)
        quality_poor = trueskill_service.get_match_quality(beginner, expert)

        # More evenly matched players should have higher quality
        assert quality_even > quality_moderate > quality_poor
        assert 0.0 <= quality_poor <= quality_moderate <= quality_even <= 1.0

    def test_win_probability_prediction(self, db_session: Session):
        """Test win probability predictions"""
        # Create players with different skill levels
        import uuid

        unique_suffix = str(uuid.uuid4())[:8]

        strong_player = Player(
            name=f"Strong Player Prob-{unique_suffix}",
            trueskill_mu=35.0,
            trueskill_sigma=3.0,
        )
        weak_player = Player(
            name=f"Weak Player Prob-{unique_suffix}",
            trueskill_mu=15.0,
            trueskill_sigma=3.0,
        )

        db_session.add(strong_player)
        db_session.add(weak_player)
        db_session.commit()

        # Strong player should have high probability of winning
        prob_strong_wins = trueskill_service.predict_win_probability(
            strong_player, weak_player
        )
        prob_weak_wins = trueskill_service.predict_win_probability(
            weak_player, strong_player
        )

        assert prob_strong_wins > 0.8
        assert prob_weak_wins < 0.2
        assert abs(prob_strong_wins + prob_weak_wins - 1.0) < 0.01  # Should sum to ~1.0

    def test_conservative_rating_calculation(self, db_session: Session, sample_players):
        """Test conservative rating calculation for ranking purposes"""
        player1, player2 = sample_players

        # Conservative rating should be mu - 3*sigma
        conservative1 = trueskill_service.get_conservative_rating(player1)
        expected1 = player1.trueskill_mu - (3 * player1.trueskill_sigma)

        assert abs(conservative1 - expected1) < 0.001

        # After games, uncertainty should decrease, affecting conservative rating
        # Play some games to reduce uncertainty
        for _ in range(3):
            game = Game(
                player1_id=player1.id, player2_id=player2.id, winner_id=player1.id
            )
            db_session.add(game)
            db_session.flush()

            trueskill_service.update_player_ratings(player1, player2, player1.id)
            db_session.commit()

        # New conservative rating should be higher due to reduced uncertainty
        new_conservative = trueskill_service.get_conservative_rating(player1)
        assert new_conservative > conservative1
