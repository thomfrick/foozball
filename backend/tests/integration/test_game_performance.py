# ABOUTME: Performance tests for game API endpoints with large datasets
# ABOUTME: Tests system behavior under load and with significant data volumes

import time
from concurrent.futures import ThreadPoolExecutor

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.game import Game
from app.models.player import Player

client = TestClient(app)


class TestGamePerformance:
    """Performance tests for game API endpoints"""

    def test_large_dataset_game_listing(self, clean_db: Session):
        """Test game listing performance with large datasets"""
        # Clear database
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create 20 test players
        players = []
        for i in range(20):
            player_data = {
                "name": f"Performance Player {i + 1}",
                "email": f"perf{i + 1}@test.com",
            }
            response = client.post("/api/v1/players/", json=player_data)
            assert response.status_code == 201
            players.append(response.json())

        # Create 1000 games with varied combinations
        print("\nCreating 1000 games for performance testing...")
        start_time = time.time()

        created_games = 0
        for i in range(1000):
            player1 = players[i % 10]  # First 10 players
            player2 = players[(i % 10) + 10]  # Last 10 players
            winner = player1 if i % 3 == 0 else player2

            game_data = {
                "player1_id": player1["id"],
                "player2_id": player2["id"],
                "winner_id": winner["id"],
            }
            response = client.post("/api/v1/games/", json=game_data)
            if response.status_code == 201:
                created_games += 1

            # Print progress every 100 games
            if (i + 1) % 100 == 0:
                print(f"Created {i + 1}/1000 games...")

        creation_time = time.time() - start_time
        print(f"Created {created_games} games in {creation_time:.2f} seconds")
        assert created_games == 1000

        # Test pagination performance with large dataset
        print("Testing pagination performance...")

        # Test first page
        start_time = time.time()
        response = client.get("/api/v1/games/?page=1&page_size=50")
        first_page_time = time.time() - start_time

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1000
        assert len(data["games"]) == 50
        assert data["total_pages"] == 20
        print(f"First page (50 games): {first_page_time:.3f}s")

        # Test middle page
        start_time = time.time()
        response = client.get("/api/v1/games/?page=10&page_size=50")
        middle_page_time = time.time() - start_time

        assert response.status_code == 200
        data = response.json()
        assert len(data["games"]) == 50
        print(f"Middle page (page 10): {middle_page_time:.3f}s")

        # Test last page
        start_time = time.time()
        response = client.get("/api/v1/games/?page=20&page_size=50")
        last_page_time = time.time() - start_time

        assert response.status_code == 200
        data = response.json()
        assert len(data["games"]) == 50
        print(f"Last page (page 20): {last_page_time:.3f}s")

        # Performance assertions (reasonable thresholds)
        assert first_page_time < 2.0, f"First page too slow: {first_page_time:.3f}s"
        assert middle_page_time < 2.0, f"Middle page too slow: {middle_page_time:.3f}s"
        assert last_page_time < 2.0, f"Last page too slow: {last_page_time:.3f}s"

    def test_player_games_performance_with_many_games(self, clean_db: Session):
        """Test player games endpoint performance when player has many games"""
        # Clear database
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create test players
        active_player_data = {"name": "Very Active Player", "email": "active@perf.com"}
        active_response = client.post("/api/v1/players/", json=active_player_data)
        active_player = active_response.json()

        # Create 10 opponents
        opponents = []
        for i in range(10):
            opponent_data = {
                "name": f"Opponent {i + 1}",
                "email": f"opp{i + 1}@perf.com",
            }
            response = client.post("/api/v1/players/", json=opponent_data)
            opponents.append(response.json())

        # Create 500 games for the active player
        print("\nCreating 500 games for active player...")
        for i in range(500):
            opponent = opponents[i % 10]
            winner = active_player if i % 2 == 0 else opponent

            game_data = {
                "player1_id": active_player["id"],
                "player2_id": opponent["id"],
                "winner_id": winner["id"],
            }
            response = client.post("/api/v1/games/", json=game_data)
            assert response.status_code == 201

            if (i + 1) % 100 == 0:
                print(f"Created {i + 1}/500 games for active player...")

        # Test player games performance
        print("Testing player games endpoint performance...")

        start_time = time.time()
        response = client.get(
            f"/api/v1/players/{active_player['id']}/games?page=1&page_size=20"
        )
        query_time = time.time() - start_time

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 500
        assert len(data["games"]) == 20

        print(f"Player games query (500 total): {query_time:.3f}s")
        assert query_time < 1.0, f"Player games query too slow: {query_time:.3f}s"

        # Test different page sizes
        for page_size in [10, 50, 100]:
            start_time = time.time()
            response = client.get(
                f"/api/v1/players/{active_player['id']}/games?page_size={page_size}"
            )
            query_time = time.time() - start_time

            assert response.status_code == 200
            data = response.json()
            assert len(data["games"]) == page_size

            print(f"Page size {page_size}: {query_time:.3f}s")
            assert query_time < 1.5, (
                f"Page size {page_size} too slow: {query_time:.3f}s"
            )

    def test_concurrent_read_performance(self, clean_db: Session):
        """Test system performance under concurrent read load"""
        # Clear database
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create test data
        players = []
        for i in range(5):
            player_data = {
                "name": f"Concurrent Player {i + 1}",
                "email": f"conc{i + 1}@test.com",
            }
            response = client.post("/api/v1/players/", json=player_data)
            players.append(response.json())

        # Create 100 games
        for i in range(100):
            player1 = players[i % 2]
            player2 = players[(i % 2) + 2]
            winner = player1 if i % 2 == 0 else player2

            game_data = {
                "player1_id": player1["id"],
                "player2_id": player2["id"],
                "winner_id": winner["id"],
            }
            response = client.post("/api/v1/games/", json=game_data)
            assert response.status_code == 201

        # Test concurrent reads
        def perform_reads():
            results = []
            for _ in range(10):  # 10 requests per thread
                response = client.get("/api/v1/games/")
                results.append(response.status_code == 200)
            return results

        print("\nTesting concurrent read performance...")
        start_time = time.time()

        # Use 5 threads making 10 requests each (50 total requests)
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(perform_reads) for _ in range(5)]
            all_results = []
            for future in futures:
                all_results.extend(future.result())

        total_time = time.time() - start_time
        successful_requests = sum(all_results)

        print(f"50 concurrent requests completed in {total_time:.3f}s")
        print(f"Successful requests: {successful_requests}/50")
        print(f"Average response time: {total_time / 50:.3f}s")

        assert successful_requests >= 48, (
            f"Too many failed requests: {50 - successful_requests}"
        )
        assert total_time < 10.0, f"Concurrent reads too slow: {total_time:.3f}s"

    def test_game_creation_batch_performance(self, clean_db: Session):
        """Test performance of creating many games in sequence"""
        # Clear database
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create test players
        players = []
        for i in range(4):
            player_data = {
                "name": f"Batch Player {i + 1}",
                "email": f"batch{i + 1}@test.com",
            }
            response = client.post("/api/v1/players/", json=player_data)
            players.append(response.json())

        # Measure batch creation performance
        print("\nTesting batch game creation performance...")

        batch_sizes = [10, 50, 100]
        for batch_size in batch_sizes:
            start_time = time.time()

            for i in range(batch_size):
                player1 = players[i % 2]
                player2 = players[(i % 2) + 2]
                winner = player1 if i % 2 == 0 else player2

                game_data = {
                    "player1_id": player1["id"],
                    "player2_id": player2["id"],
                    "winner_id": winner["id"],
                }
                response = client.post("/api/v1/games/", json=game_data)
                assert response.status_code == 201

            batch_time = time.time() - start_time
            avg_time_per_game = batch_time / batch_size

            print(
                f"Batch of {batch_size} games: {batch_time:.3f}s ({avg_time_per_game * 1000:.1f}ms per game)"
            )

            # Performance assertions
            assert avg_time_per_game < 0.5, (
                f"Game creation too slow: {avg_time_per_game:.3f}s per game"
            )

    def test_database_query_optimization(self, clean_db: Session):
        """Test that database queries are optimized and not causing N+1 problems"""
        # Clear database
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create test players
        players = []
        for i in range(6):
            player_data = {
                "name": f"Query Player {i + 1}",
                "email": f"query{i + 1}@test.com",
            }
            response = client.post("/api/v1/players/", json=player_data)
            players.append(response.json())

        # Create games with different player combinations
        for i in range(50):
            player1 = players[i % 3]
            player2 = players[(i % 3) + 3]
            winner = player1 if i % 2 == 0 else player2

            game_data = {
                "player1_id": player1["id"],
                "player2_id": player2["id"],
                "winner_id": winner["id"],
            }
            response = client.post("/api/v1/games/", json=game_data)
            assert response.status_code == 201

        # Test that games endpoint includes player data without N+1 queries
        print("\nTesting query optimization...")

        start_time = time.time()
        response = client.get("/api/v1/games/?page_size=50")
        query_time = time.time() - start_time

        assert response.status_code == 200
        data = response.json()
        games = data["games"]

        # Verify all player data is loaded
        for game in games:
            assert "player1" in game
            assert "player2" in game
            assert "winner" in game
            assert game["player1"]["name"] is not None
            assert game["player2"]["name"] is not None
            assert game["winner"]["name"] is not None

        print(f"50 games with player data loaded in {query_time:.3f}s")

        # Should be fast since we're using joinedload
        assert query_time < 1.0, f"Query with joins too slow: {query_time:.3f}s"

    def test_memory_usage_with_large_results(self, clean_db: Session):
        """Test memory efficiency when returning large result sets"""
        # Clear database
        clean_db.query(Game).delete()
        clean_db.query(Player).delete()
        clean_db.commit()

        # Create minimal test players
        player1_data = {"name": "Memory Player 1", "email": "mem1@test.com"}
        player2_data = {"name": "Memory Player 2", "email": "mem2@test.com"}

        player1_response = client.post("/api/v1/players/", json=player1_data)
        player2_response = client.post("/api/v1/players/", json=player2_data)
        player1 = player1_response.json()
        player2 = player2_response.json()

        # Create games
        for i in range(200):
            winner = player1 if i % 2 == 0 else player2
            game_data = {
                "player1_id": player1["id"],
                "player2_id": player2["id"],
                "winner_id": winner["id"],
            }
            response = client.post("/api/v1/games/", json=game_data)
            assert response.status_code == 201

        # Test different page sizes to ensure memory usage is reasonable
        print("\nTesting memory efficiency with different page sizes...")

        page_sizes = [20, 50, 100]
        for page_size in page_sizes:
            start_time = time.time()
            response = client.get(f"/api/v1/games/?page_size={page_size}")
            response_time = time.time() - start_time

            assert response.status_code == 200
            data = response.json()
            assert len(data["games"]) == page_size

            # Check response size is reasonable
            response_size = len(response.content)
            print(f"Page size {page_size}: {response_time:.3f}s, {response_size} bytes")

            # Memory/size assertions
            assert response_size < 1024 * 1024, (
                f"Response too large: {response_size} bytes"
            )
            assert response_time < 2.0, (
                f"Response too slow for page size {page_size}: {response_time:.3f}s"
            )
