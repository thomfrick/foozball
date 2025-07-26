# ABOUTME: Test data fixtures and factories for comprehensive test coverage
# ABOUTME: Provides reusable test data creation utilities for all test scenarios

from datetime import datetime, timedelta
from typing import Any

import pytest
from sqlalchemy.orm import Session

from app.models.player import Player


class PlayerFactory:
    """Factory class for creating Player test data"""

    @staticmethod
    def create_player_data(
        name: str = "Test Player",
        email: str | None = "test@example.com",
        trueskill_mu: float = 25.0,
        trueskill_sigma: float = 8.3333,
        games_played: int = 0,
        wins: int = 0,
        losses: int = 0,
        is_active: bool = True,
        **kwargs,
    ) -> dict[str, Any]:
        """Create player data dictionary for API requests"""
        data = {
            "name": name,
            "email": email,
            "trueskill_mu": trueskill_mu,
            "trueskill_sigma": trueskill_sigma,
            "games_played": games_played,
            "wins": wins,
            "losses": losses,
            "is_active": is_active,
        }
        data.update(kwargs)
        return data

    @staticmethod
    def create_player_model(
        db: Session,
        name: str = "Test Player",
        email: str | None = "test@example.com",
        trueskill_mu: float = 25.0,
        trueskill_sigma: float = 8.3333,
        games_played: int = 0,
        wins: int = 0,
        losses: int = 0,
        is_active: bool = True,
        **kwargs,
    ) -> Player:
        """Create and persist a Player model instance"""
        player = Player(
            name=name,
            email=email,
            trueskill_mu=trueskill_mu,
            trueskill_sigma=trueskill_sigma,
            games_played=games_played,
            wins=wins,
            losses=losses,
            is_active=is_active,
            **kwargs,
        )
        db.add(player)
        db.commit()
        db.refresh(player)
        return player

    @staticmethod
    def create_multiple_players(
        db: Session, count: int = 5, base_name: str = "Player"
    ) -> list[Player]:
        """Create multiple players with sequential names and emails"""
        players = []
        for i in range(count):
            player = PlayerFactory.create_player_model(
                db=db,
                name=f"{base_name} {i + 1}",
                email=f"{base_name.lower()}{i + 1}@example.com",
            )
            players.append(player)
        return players

    @staticmethod
    def create_players_with_ratings(
        db: Session, ratings_data: list[dict[str, Any]]
    ) -> list[Player]:
        """Create players with specific rating and performance data"""
        players = []
        for i, data in enumerate(ratings_data):
            player = PlayerFactory.create_player_model(
                db=db,
                name=data.get("name", f"Rated Player {i + 1}"),
                email=data.get("email", f"rated{i + 1}@example.com"),
                trueskill_mu=data.get("mu", 25.0),
                trueskill_sigma=data.get("sigma", 8.3333),
                games_played=data.get("games_played", 0),
                wins=data.get("wins", 0),
                losses=data.get("losses", 0),
                is_active=data.get("is_active", True),
            )
            players.append(player)
        return players


@pytest.fixture
def player_factory():
    """Fixture providing player factory instance"""
    return PlayerFactory


@pytest.fixture
def sample_player_data():
    """Fixture providing sample player data for API requests"""
    return PlayerFactory.create_player_data()


@pytest.fixture
def diverse_players_data():
    """Fixture providing diverse player data scenarios"""
    return [
        # New player with default values
        PlayerFactory.create_player_data(
            name="Rookie Player", email="rookie@example.com"
        ),
        # Experienced player with high rating
        PlayerFactory.create_player_data(
            name="Pro Player",
            email="pro@example.com",
            trueskill_mu=35.0,
            trueskill_sigma=5.2,
            games_played=100,
            wins=75,
            losses=25,
        ),
        # Player with average performance
        PlayerFactory.create_player_data(
            name="Average Player",
            email="average@example.com",
            trueskill_mu=25.0,
            trueskill_sigma=6.8,
            games_played=50,
            wins=25,
            losses=25,
        ),
        # Player with low rating
        PlayerFactory.create_player_data(
            name="Learning Player",
            email="learning@example.com",
            trueskill_mu=18.5,
            trueskill_sigma=7.1,
            games_played=30,
            wins=8,
            losses=22,
        ),
        # Player without email
        PlayerFactory.create_player_data(
            name="Anonymous Player", email=None, games_played=10, wins=3, losses=7
        ),
    ]


@pytest.fixture
def high_uncertainty_players_data():
    """Fixture for players with high rating uncertainty (new players)"""
    return [
        PlayerFactory.create_player_data(
            name="New Player 1",
            email="new1@example.com",
            trueskill_sigma=8.3333,  # High uncertainty
        ),
        PlayerFactory.create_player_data(
            name="New Player 2", email="new2@example.com", trueskill_sigma=8.0
        ),
    ]


@pytest.fixture
def low_uncertainty_players_data():
    """Fixture for players with low rating uncertainty (experienced)"""
    return [
        PlayerFactory.create_player_data(
            name="Veteran Player 1",
            email="vet1@example.com",
            trueskill_mu=32.0,
            trueskill_sigma=3.2,  # Low uncertainty
            games_played=200,
            wins=140,
            losses=60,
        ),
        PlayerFactory.create_player_data(
            name="Veteran Player 2",
            email="vet2@example.com",
            trueskill_mu=28.5,
            trueskill_sigma=2.8,
            games_played=150,
            wins=90,
            losses=60,
        ),
    ]


@pytest.fixture
def edge_case_players_data():
    """Fixture for edge case player scenarios"""
    return [
        # Player with maximum name length
        PlayerFactory.create_player_data(
            name="A" * 100,  # Assuming 100 char limit
            email="long@example.com",
        ),
        # Player with special characters in name
        PlayerFactory.create_player_data(
            name="José María O'Connor-Smith", email="special@example.com"
        ),
        # Player with zero games but wins/losses (data inconsistency test)
        PlayerFactory.create_player_data(
            name="Inconsistent Player",
            email="inconsistent@example.com",
            games_played=0,
            wins=5,
            losses=3,
        ),
        # Inactive player
        PlayerFactory.create_player_data(
            name="Inactive Player",
            email="inactive@example.com",
            is_active=False,
            games_played=25,
            wins=10,
            losses=15,
        ),
    ]


@pytest.fixture
def performance_test_players(clean_db):
    """Fixture creating many players for performance testing"""
    players = []
    for i in range(100):
        player = PlayerFactory.create_player_model(
            db=clean_db,
            name=f"Performance Player {i:03d}",
            email=f"perf{i:03d}@example.com",
            trueskill_mu=20.0 + (i % 20),  # Vary ratings
            trueskill_sigma=8.3333 - (i % 5),  # Vary uncertainty
            games_played=i % 50,
            wins=(i % 50) // 2,
            losses=(i % 50) - ((i % 50) // 2),
        )
        players.append(player)
    return players


@pytest.fixture
def duplicate_test_scenarios():
    """Fixture for testing duplicate validation scenarios"""
    return {
        "duplicate_names": [
            PlayerFactory.create_player_data(
                name="Duplicate Name", email="email1@example.com"
            ),
            PlayerFactory.create_player_data(
                name="Duplicate Name", email="email2@example.com"
            ),
        ],
        "duplicate_emails": [
            PlayerFactory.create_player_data(
                name="Player One", email="same@example.com"
            ),
            PlayerFactory.create_player_data(
                name="Player Two", email="same@example.com"
            ),
        ],
        "case_sensitivity": [
            PlayerFactory.create_player_data(
                name="Case Test", email="case@example.com"
            ),
            PlayerFactory.create_player_data(
                name="case test", email="CASE@EXAMPLE.COM"
            ),
        ],
    }


@pytest.fixture
def pagination_test_data(clean_db):
    """Fixture creating data for pagination testing"""
    # Create exactly 25 players for pagination edge cases
    players = []
    for i in range(25):
        player = PlayerFactory.create_player_model(
            db=clean_db,
            name=f"Page Player {i:02d}",
            email=f"page{i:02d}@example.com",
            created_at=datetime.utcnow() - timedelta(days=i),  # Vary creation dates
        )
        players.append(player)
    return players


@pytest.fixture
def search_test_data(clean_db):
    """Fixture creating data for search functionality testing"""
    search_players = [
        ("John Doe", "john.doe@example.com"),
        ("Jane Smith", "jane.smith@example.com"),
        ("John Smith", "john.smith@example.com"),
        ("Bob Johnson", "bob.johnson@example.com"),
        ("Alice Johnson", "alice.johnson@example.com"),
        ("David Wilson", "david.wilson@example.com"),
        ("Sarah Wilson", "sarah.wilson@example.com"),
    ]

    players = []
    for name, email in search_players:
        player = PlayerFactory.create_player_model(db=clean_db, name=name, email=email)
        players.append(player)
    return players


@pytest.fixture
def api_error_scenarios():
    """Fixture providing data for API error scenario testing"""
    return {
        "invalid_requests": [
            {"name": ""},  # Empty name
            {"name": None},  # None name
            {"email": "not-an-email"},  # Invalid email format
            {"name": "Valid", "email": ""},  # Empty email
            {"trueskill_mu": "not-a-number"},  # Invalid mu type
            {"trueskill_sigma": -1.0},  # Negative sigma
            {"games_played": -5},  # Negative games
            {"wins": -1},  # Negative wins
            {"losses": -1},  # Negative losses
        ],
        "malformed_json": [
            '{"name": "Test", "email":}',  # Malformed JSON
            '{"name": "Test" "email": "test@example.com"}',  # Missing comma
            "",  # Empty body
        ],
    }


@pytest.fixture
def rating_calculation_scenarios():
    """Fixture for TrueSkill rating calculation test scenarios"""
    return [
        {
            "name": "Equal Skill Match",
            "player1": {"mu": 25.0, "sigma": 8.3333},
            "player2": {"mu": 25.0, "sigma": 8.3333},
            "expected_change": "moderate",
        },
        {
            "name": "Upset Victory",
            "player1": {"mu": 20.0, "sigma": 5.0},  # Lower rated wins
            "player2": {"mu": 30.0, "sigma": 4.0},  # Higher rated loses
            "expected_change": "large",
        },
        {
            "name": "Expected Victory",
            "player1": {"mu": 30.0, "sigma": 4.0},  # Higher rated wins
            "player2": {"mu": 20.0, "sigma": 5.0},  # Lower rated loses
            "expected_change": "small",
        },
        {
            "name": "New Player Victory",
            "player1": {"mu": 25.0, "sigma": 8.3333},  # New player wins
            "player2": {"mu": 28.0, "sigma": 3.0},  # Experienced loses
            "expected_change": "large_uncertainty_reduction",
        },
    ]


# Utility functions for test data manipulation
def clear_all_players(db: Session):
    """Utility to clear all players from test database"""
    db.query(Player).delete()
    db.commit()


def create_test_leaderboard(db: Session, size: int = 10) -> list[Player]:
    """Create a diverse leaderboard for ranking tests"""
    leaderboard_data = []
    for i in range(size):
        mu = 30.0 - (i * 2.0)  # Decreasing skill
        sigma = 3.0 + (i * 0.5)  # Increasing uncertainty
        games = 50 + i * 10
        wins = int(games * (0.8 - i * 0.05))  # Decreasing win rate

        leaderboard_data.append(
            {
                "name": f"Rank {i + 1} Player",
                "email": f"rank{i + 1}@example.com",
                "mu": mu,
                "sigma": sigma,
                "games_played": games,
                "wins": wins,
                "losses": games - wins,
            }
        )

    return PlayerFactory.create_players_with_ratings(db, leaderboard_data)
