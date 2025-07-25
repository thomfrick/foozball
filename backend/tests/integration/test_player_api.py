# ABOUTME: Integration tests for player API endpoints
# ABOUTME: Tests complete API workflow including validation and error cases

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.player import Player

client = TestClient(app)


class TestPlayerAPI:
    """Test suite for player API endpoints"""

    def test_create_player_success(self, clean_db: Session):
        """Test successful player creation"""
        # Clear any existing players
        clean_db.query(Player).delete()
        clean_db.commit()

        response = client.post(
            "/api/v1/players/",
            json={"name": "Test Player", "email": "test@example.com"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Player"
        assert data["email"] == "test@example.com"
        assert data["elo_rating"] == 1500.0
        assert data["trueskill_mu"] == 25.0
        assert data["trueskill_sigma"] == 8.3333
        assert data["games_played"] == 0
        assert data["wins"] == 0
        assert data["losses"] == 0
        assert data["win_percentage"] == 0.0
        assert data["is_active"] is True
        assert "id" in data
        assert "created_at" in data

    def test_create_player_without_email(self, clean_db: Session):
        """Test creating player without email"""
        response = client.post(
            "/api/v1/players/",
            json={"name": "No Email Player"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "No Email Player"
        assert data["email"] is None

    def test_create_player_duplicate_name(self, clean_db: Session):
        """Test creating player with duplicate name"""
        # Create first player
        client.post(
            "/api/v1/players/",
            json={"name": "Duplicate Name"}
        )

        # Try to create another with same name
        response = client.post(
            "/api/v1/players/",
            json={"name": "Duplicate Name"}
        )
        assert response.status_code == 400
        assert "name already exists" in response.json()["detail"]

    def test_create_player_duplicate_email(self, clean_db: Session):
        """Test creating player with duplicate email"""
        # Create first player
        client.post(
            "/api/v1/players/",
            json={"name": "Player One", "email": "same@example.com"}
        )

        # Try to create another with same email
        response = client.post(
            "/api/v1/players/",
            json={"name": "Player Two", "email": "same@example.com"}
        )
        assert response.status_code == 400
        assert "email already exists" in response.json()["detail"]

    def test_create_player_invalid_email(self, clean_db: Session):
        """Test creating player with invalid email"""
        response = client.post(
            "/api/v1/players/",
            json={"name": "Bad Email", "email": "not-an-email"}
        )
        assert response.status_code == 422

    def test_create_player_empty_name(self, clean_db: Session):
        """Test creating player with empty name"""
        response = client.post(
            "/api/v1/players/",
            json={"name": ""}
        )
        assert response.status_code == 422

    def test_list_players_empty(self, clean_db: Session):
        """Test listing players when none exist"""
        # Clear all players
        clean_db.query(Player).delete()
        clean_db.commit()

        response = client.get("/api/v1/players/")
        assert response.status_code == 200
        data = response.json()
        assert data["players"] == []
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["page_size"] == 20
        assert data["total_pages"] == 0

    def test_list_players_with_data(self, clean_db: Session):
        """Test listing players with data"""
        # Clear and create test players
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create multiple players
        players_data = [
            {"name": "High Rating", "email": "high@example.com"},
            {"name": "Medium Rating", "email": "medium@example.com"},
            {"name": "Low Rating", "email": "low@example.com"}
        ]

        for player_data in players_data:
            client.post("/api/v1/players/", json=player_data)

        response = client.get("/api/v1/players/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["players"]) == 3
        assert data["total"] == 3
        assert data["page"] == 1
        assert data["page_size"] == 20
        assert data["total_pages"] == 1

    def test_list_players_pagination(self, clean_db: Session):
        """Test pagination functionality"""
        # Clear and create test players
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create 5 players
        for i in range(5):
            client.post(
                "/api/v1/players/",
                json={"name": f"Player {i}", "email": f"player{i}@example.com"}
            )

        # Test first page with page_size=2
        response = client.get("/api/v1/players/?page=1&page_size=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data["players"]) == 2
        assert data["total"] == 5
        assert data["page"] == 1
        assert data["page_size"] == 2
        assert data["total_pages"] == 3

        # Test second page
        response = client.get("/api/v1/players/?page=2&page_size=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data["players"]) == 2
        assert data["page"] == 2

    def test_list_players_search(self, clean_db: Session):
        """Test search functionality"""
        # Clear and create test players
        clean_db.query(Player).delete()
        clean_db.commit()

        client.post("/api/v1/players/", json={"name": "John Doe"})
        client.post("/api/v1/players/", json={"name": "Jane Smith"})
        client.post("/api/v1/players/", json={"name": "John Smith"})

        # Search for "John"
        response = client.get("/api/v1/players/?search=John")
        assert response.status_code == 200
        data = response.json()
        assert len(data["players"]) == 2
        assert all("John" in player["name"] for player in data["players"])

    def test_list_players_include_inactive(self, clean_db: Session):
        """Test including inactive players"""
        # Clear and create test players
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create active player
        client.post("/api/v1/players/", json={"name": "Active Player"})

        # Create and deactivate player
        response = client.post("/api/v1/players/", json={"name": "Inactive Player"})
        inactive_id = response.json()["id"]
        client.delete(f"/api/v1/players/{inactive_id}")

        # Test active_only=True (default)
        response = client.get("/api/v1/players/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["players"]) == 1
        assert data["players"][0]["name"] == "Active Player"

        # Test active_only=False
        response = client.get("/api/v1/players/?active_only=false")
        assert response.status_code == 200
        data = response.json()
        assert len(data["players"]) == 2

    def test_get_player_success(self, clean_db: Session):
        """Test getting a specific player"""
        # Create a player
        response = client.post(
            "/api/v1/players/",
            json={"name": "Get Test Player", "email": "get@example.com"}
        )
        player_id = response.json()["id"]

        # Get the player
        response = client.get(f"/api/v1/players/{player_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Get Test Player"
        assert data["email"] == "get@example.com"
        assert data["id"] == player_id

    def test_get_player_not_found(self, clean_db: Session):
        """Test getting non-existent player"""
        response = client.get("/api/v1/players/99999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

    def test_update_player_success(self, clean_db: Session):
        """Test updating a player"""
        # Create a player
        response = client.post(
            "/api/v1/players/",
            json={"name": "Original Name", "email": "original@example.com"}
        )
        player_id = response.json()["id"]

        # Update the player
        response = client.put(
            f"/api/v1/players/{player_id}",
            json={"name": "Updated Name", "email": "updated@example.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["email"] == "updated@example.com"
        assert data["id"] == player_id

    def test_update_player_partial(self, clean_db: Session):
        """Test partial update of a player"""
        # Create a player
        response = client.post(
            "/api/v1/players/",
            json={"name": "Partial Update", "email": "partial@example.com"}
        )
        player_id = response.json()["id"]

        # Update only the name
        response = client.put(
            f"/api/v1/players/{player_id}",
            json={"name": "New Name Only"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "New Name Only"
        assert data["email"] == "partial@example.com"  # Email unchanged

    def test_update_player_not_found(self, clean_db: Session):
        """Test updating non-existent player"""
        response = client.put(
            "/api/v1/players/99999",
            json={"name": "Not Found"}
        )
        assert response.status_code == 404

    def test_delete_player_success(self, clean_db: Session):
        """Test deleting a player"""
        # Create a player
        response = client.post(
            "/api/v1/players/",
            json={"name": "Delete Me"}
        )
        player_id = response.json()["id"]

        # Delete the player
        response = client.delete(f"/api/v1/players/{player_id}")
        assert response.status_code == 204

        # Verify player is soft deleted
        response = client.get(f"/api/v1/players/{player_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False

    def test_delete_player_not_found(self, clean_db: Session):
        """Test deleting non-existent player"""
        response = client.delete("/api/v1/players/99999")
        assert response.status_code == 404
