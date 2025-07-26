# ABOUTME: TrueSkill rating calculation service for foosball games
# ABOUTME: Implements Microsoft's TrueSkill algorithm for accurate skill assessment


import trueskill

from app.models.player import Player


class TrueSkillService:
    """Service for TrueSkill rating calculations and updates"""

    def __init__(self):
        # Configure TrueSkill environment
        # mu: initial mean skill rating
        # sigma: initial standard deviation (uncertainty)
        # beta: distance that guarantees about 76% chance of winning
        # tau: dynamics factor (how much ratings change over time)
        # draw_probability: likelihood of a draw (0 for foosball - no draws)
        self.env = trueskill.TrueSkill(
            mu=25.0, sigma=8.3333, beta=4.1667, tau=0.0833, draw_probability=0.0
        )

        # Set this as the global environment
        trueskill.setup(env=self.env)

    def create_rating(
        self, mu: float = 25.0, sigma: float = 8.3333
    ) -> trueskill.Rating:
        """Create a TrueSkill rating object"""
        return trueskill.Rating(mu=mu, sigma=sigma)

    def get_player_rating(self, player: Player) -> trueskill.Rating:
        """Get TrueSkill rating from player model"""
        return self.create_rating(mu=player.trueskill_mu, sigma=player.trueskill_sigma)

    def calculate_new_ratings(
        self, player1: Player, player2: Player, winner_id: int
    ) -> tuple[trueskill.Rating, trueskill.Rating]:
        """
        Calculate new TrueSkill ratings after a game

        Args:
            player1: First player
            player2: Second player
            winner_id: ID of the winning player

        Returns:
            Tuple of (new_player1_rating, new_player2_rating)
        """
        # Get current ratings
        rating1 = self.get_player_rating(player1)
        rating2 = self.get_player_rating(player2)

        # Determine ranks (lower rank = better performance)
        # In TrueSkill, rank 0 means 1st place, rank 1 means 2nd place
        if winner_id == player1.id:
            ranks = [0, 1]  # player1 wins
        elif winner_id == player2.id:
            ranks = [1, 0]  # player2 wins
        else:
            # This shouldn't happen in foosball, but handle gracefully
            raise ValueError(
                f"Winner ID {winner_id} must be either {player1.id} or {player2.id}"
            )

        # Calculate new ratings
        new_ratings = trueskill.rate([(rating1,), (rating2,)], ranks=ranks)

        return new_ratings[0][0], new_ratings[1][0]

    def update_player_ratings(
        self, player1: Player, player2: Player, winner_id: int
    ) -> tuple[Player, Player]:
        """
        Update player ratings after a game (without committing to database)

        Args:
            player1: First player
            player2: Second player
            winner_id: ID of the winning player

        Returns:
            Tuple of updated (player1, player2)
        """
        # Calculate new ratings
        new_rating1, new_rating2 = self.calculate_new_ratings(
            player1, player2, winner_id
        )

        # Update player1
        player1.trueskill_mu = new_rating1.mu
        player1.trueskill_sigma = new_rating1.sigma
        player1.games_played += 1
        if winner_id == player1.id:
            player1.wins += 1
        else:
            player1.losses += 1

        # Update player2
        player2.trueskill_mu = new_rating2.mu
        player2.trueskill_sigma = new_rating2.sigma
        player2.games_played += 1
        if winner_id == player2.id:
            player2.wins += 1
        else:
            player2.losses += 1

        return player1, player2

    def get_conservative_rating(self, player: Player) -> float:
        """
        Get conservative skill estimate (mu - 3*sigma)
        This represents a skill level we're 99.7% confident the player exceeds
        """
        return player.trueskill_mu - (3 * player.trueskill_sigma)

    def get_match_quality(self, player1: Player, player2: Player) -> float:
        """
        Calculate match quality between two players (0-1, higher is better)
        This indicates how evenly matched the players are
        """
        rating1 = self.get_player_rating(player1)
        rating2 = self.get_player_rating(player2)

        return trueskill.quality([(rating1,), (rating2,)])

    def predict_win_probability(self, player1: Player, player2: Player) -> float:
        """
        Predict probability that player1 beats player2

        Returns:
            Float between 0 and 1 representing player1's win probability
        """
        rating1 = self.get_player_rating(player1)
        rating2 = self.get_player_rating(player2)

        # Calculate the difference in conservative ratings
        delta_mu = rating1.mu - rating2.mu
        sum_sigma = (rating1.sigma**2) + (rating2.sigma**2)

        # Use cumulative distribution function
        import math

        denom = math.sqrt(2 * (self.env.beta**2) + sum_sigma)

        return trueskill.TrueSkill().cdf(delta_mu / denom)


# Create a global instance
trueskill_service = TrueSkillService()
