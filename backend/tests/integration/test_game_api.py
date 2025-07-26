# ABOUTME: Integration tests for game API endpoints with real database
# ABOUTME: Tests complete game workflow including player management and data consistency

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.game import Game
from app.models.player import Player

client = TestClient(app)


class TestGameAPIIntegration:
    """Integration tests for game API with real database operations"""

    def test_complete_game_creation_workflow(self, clean_db: Session):
        """Test the complete workflow of creating players and recording games"""
        # Clear database
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        # Step 1: Create two players
        player1_data = {"name": "Alice", "email": "alice@test.com"}
        player2_data = {"name": "Bob", "email": "bob@test.com"}

        player1_response = client.post("/api/v1/players/", json=player1_data)
        assert player1_response.status_code == 201
        player1 = player1_response.json()

        player2_response = client.post("/api/v1/players/", json=player2_data)
        assert player2_response.status_code == 201
        player2 = player2_response.json()

        # Step 2: Record a game between them
        game_data = {
            "player1_id": player1["id"],
            "player2_id": player2["id"],
            "winner_id": player1["id"],
        }

        game_response = client.post("/api/v1/games/", json=game_data)
        assert game_response.status_code == 201
        game = game_response.json()

        # Verify game data
        assert game["player1_id"] == player1["id"]
        assert game["player2_id"] == player2["id"]
        assert game["winner_id"] == player1["id"]
        assert game["player1"]["name"] == "Alice"
        assert game["player2"]["name"] == "Bob"
        assert game["winner"]["name"] == "Alice"

        # Step 3: Verify the game appears in listings
        games_response = client.get("/api/v1/games/")
        assert games_response.status_code == 200
        games_data = games_response.json()
        assert games_data["total"] == 1
        assert len(games_data["games"]) == 1
        assert games_data["games"][0]["id"] == game["id"]

        # Step 4: Verify player-specific game listings
        player1_games_response = client.get(f"/api/v1/players/{player1['id']}/games")
        assert player1_games_response.status_code == 200
        player1_games = player1_games_response.json()
        assert player1_games["total"] == 1

        player2_games_response = client.get(f"/api/v1/players/{player2['id']}/games")
        assert player2_games_response.status_code == 200
        player2_games = player2_games_response.json()
        assert player2_games["total"] == 1

    def test_game_creation_with_validation_errors(self, clean_db: Session):
        """Test game creation with various validation scenarios"""
        # Clear database
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create one player
        player_data = {"name": "Solo Player", "email": "solo@test.com"}
        player_response = client.post("/api/v1/players/", json=player_data)
        assert player_response.status_code == 201
        player = player_response.json()

        # Test 1: Same player for both positions
        invalid_game_data = {
            "player1_id": player["id"],
            "player2_id": player["id"],
            "winner_id": player["id"],
        }
        response = client.post("/api/v1/games/", json=invalid_game_data)
        assert response.status_code == 400
        assert "Player 1 and Player 2 must be different" in response.json()["detail"]

        # Test 2: Non-existent player
        invalid_game_data = {
            "player1_id": player["id"],
            "player2_id": 99999,
            "winner_id": player["id"],
        }
        response = client.post("/api/v1/games/", json=invalid_game_data)
        assert response.status_code == 404
        assert "not found or inactive" in response.json()["detail"]

        # Test 3: Winner not one of the players
        # First create a second player
        player2_data = {"name": "Player Two", "email": "two@test.com"}
        player2_response = client.post("/api/v1/players/", json=player2_data)
        assert player2_response.status_code == 201
        player2 = player2_response.json()

        invalid_game_data = {
            "player1_id": player["id"],
            "player2_id": player2["id"],
            "winner_id": 99999,
        }
        response = client.post("/api/v1/games/", json=invalid_game_data)
        assert response.status_code == 400
        assert (
            "Winner must be one of the players in the game" in response.json()["detail"]
        )

    def test_games_listing_pagination(self, clean_db: Session):
        """Test game listing with pagination edge cases"""
        # Clear database
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create test players
        players = []
        for i in range(4):
            player_data = {
                "name": f"Player {i + 1}",
                "email": f"player{i + 1}@test.com",
            }
            response = client.post("/api/v1/players/", json=player_data)
            assert response.status_code == 201
            players.append(response.json())

        # Create 25 games (various combinations)
        created_games = []
        for i in range(25):
            player1 = players[i % 2]  # Alternate between first two players
            player2 = players[(i % 2) + 2]  # Alternate between last two players
            winner = player1 if i % 3 == 0 else player2  # Varied winners

            game_data = {
                "player1_id": player1["id"],
                "player2_id": player2["id"],
                "winner_id": winner["id"],
            }
            response = client.post("/api/v1/games/", json=game_data)
            assert response.status_code == 201
            created_games.append(response.json())

        # Test pagination scenarios
        # Page 1 (default page size 20)
        response = client.get("/api/v1/games/")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 25
        assert len(data["games"]) == 20
        assert data["page"] == 1
        assert data["total_pages"] == 2

        # Page 2
        response = client.get("/api/v1/games/?page=2")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 25
        assert len(data["games"]) == 5
        assert data["page"] == 2
        assert data["total_pages"] == 2

        # Custom page size
        response = client.get("/api/v1/games/?page=1&page_size=10")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 25
        assert len(data["games"]) == 10
        assert data["page"] == 1
        assert data["total_pages"] == 3

        # Verify games are ordered by most recent first
        games = data["games"]
        for i in range(len(games) - 1):
            current_game_id = games[i]["id"]
            next_game_id = games[i + 1]["id"]
            assert current_game_id > next_game_id  # Higher ID = more recent

    def test_player_games_with_complex_scenarios(self, clean_db: Session):
        """Test player games endpoint with various player participation patterns"""
        # Clear database
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create test players
        players = []
        for i in range(3):
            player_data = {
                "name": f"Test Player {i + 1}",
                "email": f"test{i + 1}@example.com",
            }
            response = client.post("/api/v1/players/", json=player_data)
            assert response.status_code == 201
            players.append(response.json())

        # Create games with different participation patterns
        # Player 1 vs Player 2 (Player 1 wins)
        game1_data = {
            "player1_id": players[0]["id"],
            "player2_id": players[1]["id"],
            "winner_id": players[0]["id"],
        }
        response = client.post("/api/v1/games/", json=game1_data)
        assert response.status_code == 201

        # Player 2 vs Player 1 (Player 2 wins)
        game2_data = {
            "player1_id": players[1]["id"],
            "player2_id": players[0]["id"],
            "winner_id": players[1]["id"],
        }
        response = client.post("/api/v1/games/", json=game2_data)
        assert response.status_code == 201

        # Player 1 vs Player 3 (Player 3 wins)
        game3_data = {
            "player1_id": players[0]["id"],
            "player2_id": players[2]["id"],
            "winner_id": players[2]["id"],
        }
        response = client.post("/api/v1/games/", json=game3_data)
        assert response.status_code == 201

        # Player 2 vs Player 3 (Player 2 wins)
        game4_data = {
            "player1_id": players[1]["id"],
            "player2_id": players[2]["id"],
            "winner_id": players[1]["id"],
        }
        response = client.post("/api/v1/games/", json=game4_data)
        assert response.status_code == 201

        # Test Player 1's games (should appear in 3 games)
        response = client.get(f"/api/v1/players/{players[0]['id']}/games")
        assert response.status_code == 200
        player1_games = response.json()
        assert player1_games["total"] == 3
        assert len(player1_games["games"]) == 3

        # Verify Player 1 appears in all returned games
        for game in player1_games["games"]:
            assert (
                game["player1_id"] == players[0]["id"]
                or game["player2_id"] == players[0]["id"]
            )

        # Test Player 2's games (should appear in 3 games)
        response = client.get(f"/api/v1/players/{players[1]['id']}/games")
        assert response.status_code == 200
        player2_games = response.json()
        assert player2_games["total"] == 3

        # Test Player 3's games (should appear in 2 games)
        response = client.get(f"/api/v1/players/{players[2]['id']}/games")
        assert response.status_code == 200
        player3_games = response.json()
        assert player3_games["total"] == 2

        # Test pagination for player games
        response = client.get(
            f"/api/v1/players/{players[0]['id']}/games?page=1&page_size=2"
        )
        assert response.status_code == 200
        paginated_games = response.json()
        assert paginated_games["total"] == 3
        assert len(paginated_games["games"]) == 2
        assert paginated_games["total_pages"] == 2

    def test_inactive_player_game_creation(self, clean_db: Session):
        """Test that games cannot be created with inactive players"""
        # Clear database
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create two players
        player1_data = {"name": "Active Player", "email": "active@test.com"}
        player2_data = {"name": "Soon Inactive", "email": "inactive@test.com"}

        player1_response = client.post("/api/v1/players/", json=player1_data)
        assert player1_response.status_code == 201
        player1 = player1_response.json()

        player2_response = client.post("/api/v1/players/", json=player2_data)
        assert player2_response.status_code == 201
        player2 = player2_response.json()

        # Deactivate player2
        update_response = client.put(
            f"/api/v1/players/{player2['id']}", json={"is_active": False}
        )
        assert update_response.status_code == 200

        # Try to create a game with the inactive player
        game_data = {
            "player1_id": player1["id"],
            "player2_id": player2["id"],
            "winner_id": player1["id"],
        }

        response = client.post("/api/v1/games/", json=game_data)
        assert response.status_code == 404
        assert "not found or inactive" in response.json()["detail"]

    def test_game_retrieval_by_id(self, clean_db: Session):
        """Test retrieving specific games by ID"""
        # Clear database
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create test players
        player1_data = {"name": "Game Test 1", "email": "game1@test.com"}
        player2_data = {"name": "Game Test 2", "email": "game2@test.com"}

        player1_response = client.post("/api/v1/players/", json=player1_data)
        player2_response = client.post("/api/v1/players/", json=player2_data)
        player1 = player1_response.json()
        player2 = player2_response.json()

        # Create a game
        game_data = {
            "player1_id": player1["id"],
            "player2_id": player2["id"],
            "winner_id": player2["id"],
        }

        game_response = client.post("/api/v1/games/", json=game_data)
        assert game_response.status_code == 201
        created_game = game_response.json()

        # Retrieve the game by ID
        get_response = client.get(f"/api/v1/games/{created_game['id']}")
        assert get_response.status_code == 200
        retrieved_game = get_response.json()

        # Verify all data matches
        assert retrieved_game["id"] == created_game["id"]
        assert retrieved_game["player1_id"] == player1["id"]
        assert retrieved_game["player2_id"] == player2["id"]
        assert retrieved_game["winner_id"] == player2["id"]
        assert retrieved_game["player1"]["name"] == "Game Test 1"
        assert retrieved_game["player2"]["name"] == "Game Test 2"
        assert retrieved_game["winner"]["name"] == "Game Test 2"

        # Test non-existent game
        response = client.get("/api/v1/games/99999")
        assert response.status_code == 404
        assert "Game not found" in response.json()["detail"]

    def test_concurrent_game_creation(self, clean_db: Session):
        """Test data consistency with concurrent game creation"""
        # Clear database
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create test players
        player1_data = {"name": "Concurrent 1", "email": "concurrent1@test.com"}
        player2_data = {"name": "Concurrent 2", "email": "concurrent2@test.com"}

        player1_response = client.post("/api/v1/players/", json=player1_data)
        player2_response = client.post("/api/v1/players/", json=player2_data)
        player1 = player1_response.json()
        player2 = player2_response.json()

        # Create multiple games rapidly (simulating concurrent requests)
        import threading

        created_games = []
        errors = []

        def create_game(winner_id, game_num):
            try:
                game_data = {
                    "player1_id": player1["id"],
                    "player2_id": player2["id"],
                    "winner_id": winner_id,
                }
                response = client.post("/api/v1/games/", json=game_data)
                if response.status_code == 201:
                    created_games.append(response.json())
                else:
                    errors.append(f"Game {game_num}: {response.status_code}")
            except Exception as e:
                errors.append(f"Game {game_num}: {str(e)}")

        # Create 10 games concurrently
        threads = []
        for i in range(10):
            winner_id = player1["id"] if i % 2 == 0 else player2["id"]
            thread = threading.Thread(target=create_game, args=(winner_id, i))
            threads.append(thread)

        # Start all threads
        for thread in threads:
            thread.start()

        # Wait for all threads to complete
        for thread in threads:
            thread.join()

        # Verify results
        assert len(errors) == 0, f"Errors occurred: {errors}"
        assert len(created_games) == 10

        # Verify all games were created successfully
        response = client.get("/api/v1/games/")
        assert response.status_code == 200
        games_data = response.json()
        assert games_data["total"] == 10

        # Verify all games have unique IDs
        game_ids = [game["id"] for game in created_games]
        assert len(set(game_ids)) == 10
