# ABOUTME: Unit tests for game API endpoints
# ABOUTME: Tests game creation, listing, and validation functionality

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.game import Game
from app.models.player import Player

client = TestClient(app)


@pytest.fixture
def test_players(clean_db: Session):
    """Create two test players for game testing"""
    # Clear existing data
    clean_db.query(Game).delete()
    clean_db.query(Player).delete()
    clean_db.commit()

    player1 = Player(
        name="Player 1",
        email="player1@test.com",
        trueskill_mu=25.0,
        trueskill_sigma=8.3333,
        games_played=0,
        wins=0,
        losses=0,
        is_active=True,
    )
    player2 = Player(
        name="Player 2",
        email="player2@test.com",
        trueskill_mu=25.0,
        trueskill_sigma=8.3333,
        games_played=0,
        wins=0,
        losses=0,
        is_active=True,
    )

    clean_db.add(player1)
    clean_db.add(player2)
    clean_db.commit()
    clean_db.refresh(player1)
    clean_db.refresh(player2)

    return player1, player2


class TestGameEndpoints:
    """Test cases for game management endpoints"""

    def test_create_game_success(self, clean_db: Session, test_players):
        """Test successful game creation"""
        player1, player2 = test_players

        response = client.post(
            "/api/v1/games/",
            json={
                "player1_id": player1.id,
                "player2_id": player2.id,
                "winner_id": player1.id,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["player1_id"] == player1.id
        assert data["player2_id"] == player2.id
        assert data["winner_id"] == player1.id
        assert "id" in data
        assert "created_at" in data
        assert data["player1"]["name"] == player1.name
        assert data["player2"]["name"] == player2.name
        assert data["winner"]["name"] == player1.name

        # Verify game was created in database
        game = clean_db.query(Game).filter(Game.id == data["id"]).first()
        assert game is not None
        assert game.player1_id == player1.id
        assert game.player2_id == player2.id
        assert game.winner_id == player1.id

    def test_create_game_same_player_error(self, test_players):
        """Test error when player1 and player2 are the same"""
        player1, _ = test_players

        response = client.post(
            "/api/v1/games/",
            json={
                "player1_id": player1.id,
                "player2_id": player1.id,
                "winner_id": player1.id,
            },
        )

        assert response.status_code == 400
        assert "Player 1 and Player 2 must be different" in response.json()["detail"]

    def test_create_game_invalid_winner(self, test_players):
        """Test error when winner is not one of the players"""
        player1, player2 = test_players

        response = client.post(
            "/api/v1/games/",
            json={
                "player1_id": player1.id,
                "player2_id": player2.id,
                "winner_id": 99999,  # Invalid player ID
            },
        )

        assert response.status_code == 400
        assert (
            "Winner must be one of the players in the game" in response.json()["detail"]
        )

    def test_create_game_nonexistent_player(self, test_players):
        """Test error when one of the players doesn't exist"""
        player1, _ = test_players

        response = client.post(
            "/api/v1/games/",
            json={
                "player1_id": player1.id,
                "player2_id": 99999,  # Nonexistent player
                "winner_id": player1.id,
            },
        )

        assert response.status_code == 404
        assert "not found or inactive" in response.json()["detail"]

    def test_create_game_inactive_player(self, clean_db: Session, test_players):
        """Test error when one of the players is inactive"""
        player1, player2 = test_players

        # Make player2 inactive
        player2.is_active = False
        clean_db.commit()

        response = client.post(
            "/api/v1/games/",
            json={
                "player1_id": player1.id,
                "player2_id": player2.id,
                "winner_id": player1.id,
            },
        )

        assert response.status_code == 404
        assert "not found or inactive" in response.json()["detail"]

    def test_list_games_empty(self, clean_db: Session):
        """Test listing games when none exist"""
        # Clear existing data
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        response = client.get("/api/v1/games/")

        assert response.status_code == 200
        data = response.json()
        assert data["games"] == []
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["page_size"] == 20
        assert data["total_pages"] == 0

    def test_list_games_with_data(self, clean_db: Session, test_players):
        """Test listing games with existing data"""
        player1, player2 = test_players

        # Create multiple games
        games_data = [
            {
                "player1_id": player1.id,
                "player2_id": player2.id,
                "winner_id": player1.id,
            },
            {
                "player1_id": player2.id,
                "player2_id": player1.id,
                "winner_id": player2.id,
            },
            {
                "player1_id": player1.id,
                "player2_id": player2.id,
                "winner_id": player1.id,
            },
        ]

        created_games = []
        for game_data in games_data:
            response = client.post("/api/v1/games/", json=game_data)
            assert response.status_code == 201
            created_games.append(response.json())

        # List games
        response = client.get("/api/v1/games/")

        assert response.status_code == 200
        data = response.json()
        assert len(data["games"]) == 3
        assert data["total"] == 3
        assert data["page"] == 1
        assert data["page_size"] == 20
        assert data["total_pages"] == 1

        # Verify games are ordered by created_at desc (most recent first)
        game_ids = [game["id"] for game in data["games"]]
        created_ids = [game["id"] for game in created_games]
        assert game_ids == list(reversed(created_ids))  # Most recent first

    def test_list_games_pagination(self, clean_db: Session, test_players):
        """Test game listing with pagination"""
        player1, player2 = test_players

        # Create 5 games
        for i in range(5):
            response = client.post(
                "/api/v1/games/",
                json={
                    "player1_id": player1.id,
                    "player2_id": player2.id,
                    "winner_id": player1.id if i % 2 == 0 else player2.id,
                },
            )
            assert response.status_code == 201

        # Test first page
        response = client.get("/api/v1/games/?page=1&page_size=3")

        assert response.status_code == 200
        data = response.json()
        assert len(data["games"]) == 3
        assert data["total"] == 5
        assert data["page"] == 1
        assert data["page_size"] == 3
        assert data["total_pages"] == 2

        # Test second page
        response = client.get("/api/v1/games/?page=2&page_size=3")

        assert response.status_code == 200
        data = response.json()
        assert len(data["games"]) == 2
        assert data["total"] == 5
        assert data["page"] == 2
        assert data["page_size"] == 3
        assert data["total_pages"] == 2

    def test_get_game_by_id(self, test_players):
        """Test getting a specific game by ID"""
        player1, player2 = test_players

        # Create a game
        create_response = client.post(
            "/api/v1/games/",
            json={
                "player1_id": player1.id,
                "player2_id": player2.id,
                "winner_id": player2.id,
            },
        )

        assert create_response.status_code == 201
        created_game = create_response.json()

        # Get the game by ID
        response = client.get(f"/api/v1/games/{created_game['id']}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == created_game["id"]
        assert data["player1_id"] == player1.id
        assert data["player2_id"] == player2.id
        assert data["winner_id"] == player2.id
        assert data["player1"]["name"] == player1.name
        assert data["player2"]["name"] == player2.name
        assert data["winner"]["name"] == player2.name

    def test_get_game_not_found(self):
        """Test getting a game that doesn't exist"""
        response = client.get("/api/v1/games/99999")

        assert response.status_code == 404
        assert "Game not found" in response.json()["detail"]

    def test_get_player_games(self, clean_db: Session, test_players):
        """Test getting games for a specific player"""
        player1, player2 = test_players

        # Create games where player1 participates
        games_data = [
            {
                "player1_id": player1.id,
                "player2_id": player2.id,
                "winner_id": player1.id,
            },
            {
                "player1_id": player2.id,
                "player2_id": player1.id,
                "winner_id": player2.id,
            },
            {
                "player1_id": player1.id,
                "player2_id": player2.id,
                "winner_id": player1.id,
            },
        ]

        for game_data in games_data:
            response = client.post("/api/v1/games/", json=game_data)
            assert response.status_code == 201

        # Get games for player1
        response = client.get(f"/api/v1/players/{player1.id}/games")

        assert response.status_code == 200
        data = response.json()
        assert len(data["games"]) == 3  # player1 participated in all 3 games
        assert data["total"] == 3

        # Verify all games include player1
        for game in data["games"]:
            assert player1.id in [game["player1_id"], game["player2_id"]]

        # Get games for player2
        response = client.get(f"/api/v1/players/{player2.id}/games")

        assert response.status_code == 200
        data = response.json()
        assert len(data["games"]) == 3  # player2 also participated in all 3 games
        assert data["total"] == 3

    def test_get_player_games_pagination(self, clean_db: Session, test_players):
        """Test getting player games with pagination"""
        player1, player2 = test_players

        # Create 5 games for player1
        for i in range(5):
            response = client.post(
                "/api/v1/games/",
                json={
                    "player1_id": player1.id,
                    "player2_id": player2.id,
                    "winner_id": player1.id if i % 2 == 0 else player2.id,
                },
            )
            assert response.status_code == 201

        # Test pagination
        response = client.get(f"/api/v1/players/{player1.id}/games?page=1&page_size=3")

        assert response.status_code == 200
        data = response.json()
        assert len(data["games"]) == 3
        assert data["total"] == 5
        assert data["page"] == 1
        assert data["page_size"] == 3
        assert data["total_pages"] == 2

    def test_get_player_games_not_found(self):
        """Test getting games for a player that doesn't exist"""
        response = client.get("/api/v1/players/99999/games")

        assert response.status_code == 404
        assert "Player not found" in response.json()["detail"]

    def test_get_player_games_no_games(self, test_players):
        """Test getting games for a player who hasn't played any games"""
        player1, _ = test_players

        response = client.get(f"/api/v1/players/{player1.id}/games")

        assert response.status_code == 200
        data = response.json()
        assert data["games"] == []
        assert data["total"] == 0
