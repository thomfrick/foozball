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

    # Team-based TrueSkill methods

    def get_team_rating(self, team) -> trueskill.Rating:
        """Get TrueSkill rating from team model"""
        return self.create_rating(mu=team.trueskill_mu, sigma=team.trueskill_sigma)

    def calculate_initial_team_rating(
        self, player1: Player, player2: Player
    ) -> tuple[float, float]:
        """
        Calculate initial team rating based on individual player ratings

        Args:
            player1: First team member
            player2: Second team member

        Returns:
            Tuple of (initial_mu, initial_sigma) for the team
        """
        # For team ratings, we start with the sum of individual ratings
        # This follows TrueSkill principles for team composition
        combined_mu = player1.trueskill_mu + player2.trueskill_mu

        # Team sigma is calculated as sqrt(sigma1^2 + sigma2^2)
        # This represents the combined uncertainty of both players
        combined_sigma = (
            player1.trueskill_sigma**2 + player2.trueskill_sigma**2
        ) ** 0.5

        return combined_mu, combined_sigma

    def calculate_new_team_ratings(
        self, team1, team2, winner_team_id: int
    ) -> tuple[trueskill.Rating, trueskill.Rating]:
        """
        Calculate new TrueSkill ratings for teams after a game

        Args:
            team1: First team
            team2: Second team
            winner_team_id: ID of the winning team

        Returns:
            Tuple of (new_team1_rating, new_team2_rating)
        """
        # Get current team ratings
        rating1 = self.get_team_rating(team1)
        rating2 = self.get_team_rating(team2)

        # Determine ranks (lower rank = better performance)
        if winner_team_id == team1.id:
            ranks = [0, 1]  # team1 wins
        elif winner_team_id == team2.id:
            ranks = [1, 0]  # team2 wins
        else:
            raise ValueError(
                f"Winner team ID {winner_team_id} must be either {team1.id} or {team2.id}"
            )

        # Calculate new ratings using team-based TrueSkill
        new_ratings = trueskill.rate([(rating1,), (rating2,)], ranks=ranks)

        return new_ratings[0][0], new_ratings[1][0]

    def calculate_team_vs_individual_ratings(
        self,
        team1_player1: Player,
        team1_player2: Player,
        team2_player1: Player,
        team2_player2: Player,
        winning_team: int,
    ) -> tuple[
        tuple[trueskill.Rating, trueskill.Rating],  # team1 new player ratings
        tuple[trueskill.Rating, trueskill.Rating],  # team2 new player ratings
    ]:
        """
        Calculate new individual player ratings after a team game (2v2)
        This updates individual player skills based on team performance

        Args:
            team1_player1: First member of team 1
            team1_player2: Second member of team 1
            team2_player1: First member of team 2
            team2_player2: Second member of team 2
            winning_team: 1 if team1 wins, 2 if team2 wins

        Returns:
            Tuple of ((team1_p1_new, team1_p2_new), (team2_p1_new, team2_p2_new))
        """
        # Get individual player ratings
        t1p1_rating = self.get_player_rating(team1_player1)
        t1p2_rating = self.get_player_rating(team1_player2)
        t2p1_rating = self.get_player_rating(team2_player1)
        t2p2_rating = self.get_player_rating(team2_player2)

        # Create team compositions for TrueSkill
        team1_composition = (t1p1_rating, t1p2_rating)
        team2_composition = (t2p1_rating, t2p2_rating)

        # Determine ranks
        if winning_team == 1:
            ranks = [0, 1]  # team1 wins
        elif winning_team == 2:
            ranks = [1, 0]  # team2 wins
        else:
            raise ValueError("winning_team must be 1 or 2")

        # Calculate new ratings for 2v2 scenario
        new_ratings = trueskill.rate(
            [team1_composition, team2_composition], ranks=ranks
        )

        # Extract new individual ratings
        team1_new = (new_ratings[0][0], new_ratings[0][1])
        team2_new = (new_ratings[1][0], new_ratings[1][1])

        return team1_new, team2_new

    def update_team_ratings(self, team1, team2, winner_team_id: int) -> tuple:
        """
        Update team ratings after a game (without committing to database)

        Args:
            team1: First team
            team2: Second team
            winner_team_id: ID of the winning team

        Returns:
            Tuple of updated (team1, team2)
        """
        # Calculate new team ratings
        new_rating1, new_rating2 = self.calculate_new_team_ratings(
            team1, team2, winner_team_id
        )

        # Update team1
        team1.trueskill_mu = new_rating1.mu
        team1.trueskill_sigma = new_rating1.sigma
        team1.games_played += 1
        if winner_team_id == team1.id:
            team1.wins += 1
        else:
            team1.losses += 1

        # Update team2
        team2.trueskill_mu = new_rating2.mu
        team2.trueskill_sigma = new_rating2.sigma
        team2.games_played += 1
        if winner_team_id == team2.id:
            team2.wins += 1
        else:
            team2.losses += 1

        return team1, team2

    def update_players_from_team_game(
        self, team1, team2, winner_team_id: int
    ) -> tuple[tuple, tuple]:
        """
        Update individual player ratings after a team game

        Args:
            team1: First team (with player1 and player2 attributes)
            team2: Second team (with player1 and player2 attributes)
            winner_team_id: ID of the winning team

        Returns:
            Tuple of ((team1_player1, team1_player2), (team2_player1, team2_player2))
        """
        winning_team = 1 if winner_team_id == team1.id else 2

        # Calculate new individual ratings
        team1_new_ratings, team2_new_ratings = (
            self.calculate_team_vs_individual_ratings(
                team1.player1, team1.player2, team2.player1, team2.player2, winning_team
            )
        )

        # Update team1 players
        team1.player1.trueskill_mu = team1_new_ratings[0].mu
        team1.player1.trueskill_sigma = team1_new_ratings[0].sigma
        team1.player1.games_played += 1

        team1.player2.trueskill_mu = team1_new_ratings[1].mu
        team1.player2.trueskill_sigma = team1_new_ratings[1].sigma
        team1.player2.games_played += 1

        # Update team2 players
        team2.player1.trueskill_mu = team2_new_ratings[0].mu
        team2.player1.trueskill_sigma = team2_new_ratings[0].sigma
        team2.player1.games_played += 1

        team2.player2.trueskill_mu = team2_new_ratings[1].mu
        team2.player2.trueskill_sigma = team2_new_ratings[1].sigma
        team2.player2.games_played += 1

        # Update win/loss counts
        if winner_team_id == team1.id:
            team1.player1.wins += 1
            team1.player2.wins += 1
            team2.player1.losses += 1
            team2.player2.losses += 1
        else:
            team2.player1.wins += 1
            team2.player2.wins += 1
            team1.player1.losses += 1
            team1.player2.losses += 1

        return (team1.player1, team1.player2), (team2.player1, team2.player2)

    def get_team_match_quality(self, team1, team2) -> float:
        """
        Calculate match quality between two teams (0-1, higher is better)
        This indicates how evenly matched the teams are
        """
        # Get individual player ratings
        t1p1_rating = self.get_player_rating(team1.player1)
        t1p2_rating = self.get_player_rating(team1.player2)
        t2p1_rating = self.get_player_rating(team2.player1)
        t2p2_rating = self.get_player_rating(team2.player2)

        # Calculate team vs team match quality
        return trueskill.quality(
            [(t1p1_rating, t1p2_rating), (t2p1_rating, t2p2_rating)]
        )


# Create a global instance
trueskill_service = TrueSkillService()
