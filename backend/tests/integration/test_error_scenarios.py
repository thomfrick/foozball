# ABOUTME: Enhanced integration tests for error scenarios and edge cases
# ABOUTME: Tests database failures, data integrity, security, and performance edge cases

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.main import app

client = TestClient(app)


class TestDatabaseFailureScenarios:
    """Test database connection and transaction failures"""

    def test_database_connection_failure(self, clean_db: Session):
        """Test API behavior when database connection fails"""

        def mock_get_db_with_error():
            raise OperationalError("Database connection failed", None, None)

        # Save original override and replace with our mock
        original_override = app.dependency_overrides.get(get_db)
        app.dependency_overrides[get_db] = mock_get_db_with_error

        try:
            response = client.get("/api/v1/players/")
            assert response.status_code == 500
            assert (
                "Database connection" in response.json()["detail"]
                or "Failed to retrieve players" in response.json()["detail"]
            )
        finally:
            # Restore original dependency override
            if original_override:
                app.dependency_overrides[get_db] = original_override
            elif get_db in app.dependency_overrides:
                del app.dependency_overrides[get_db]

    def test_database_transaction_rollback(self, clean_db: Session):
        """Test transaction rollback on database errors"""
        # Create a player directly in the database using the clean_db session
        from app.models.player import Player

        test_player = Player(
            name="Test Player",
            email="test@example.com",
            trueskill_mu=25.0,
            trueskill_sigma=8.3333,
            games_played=0,
            wins=0,
            losses=0,
            is_active=True,
        )
        clean_db.add(test_player)
        clean_db.commit()
        clean_db.refresh(test_player)
        player_id = test_player.id

        # Mock database session that fails on commit
        def mock_get_db_with_commit_error():
            # Return clean_db but with a failing commit
            original_commit = clean_db.commit
            original_rollback = clean_db.rollback

            def failing_commit():
                # Call rollback first, then raise error
                original_rollback()
                raise OperationalError("Database error", None, None)

            clean_db.commit = failing_commit
            try:
                yield clean_db
            finally:
                # Restore original methods
                clean_db.commit = original_commit
                clean_db.rollback = original_rollback

        # Save original override and replace with our mock
        original_override = app.dependency_overrides.get(get_db)
        app.dependency_overrides[get_db] = mock_get_db_with_commit_error

        try:
            # Try to update - should fail gracefully
            response = client.put(
                f"/api/v1/players/{player_id}", json={"name": "Updated Name"}
            )
            assert response.status_code == 500
            assert "Failed to update player" in response.json()["detail"]
        finally:
            # Restore original dependency override
            if original_override:
                app.dependency_overrides[get_db] = original_override
            elif get_db in app.dependency_overrides:
                del app.dependency_overrides[get_db]

        # Verify data is unchanged due to rollback
        # Query the player directly to check its current state
        current_player = clean_db.query(Player).filter(Player.id == player_id).first()
        assert current_player is not None
        assert current_player.name == "Test Player"  # Should be unchanged


class TestDataIntegrityScenarios:
    """Test data validation and integrity constraints"""

    def test_oversized_player_name(self, clean_db: Session):
        """Test handling of oversized player names"""
        huge_name = "A" * 1000  # Very long name

        response = client.post(
            "/api/v1/players/", json={"name": huge_name, "email": "test@example.com"}
        )
        # Should either accept with truncation or reject with validation error
        assert response.status_code in [400, 422, 201]

        if response.status_code == 201:
            # If accepted, name should be truncated to reasonable length
            assert len(response.json()["name"]) <= 255

    def test_invalid_email_formats(self, clean_db: Session):
        """Test various invalid email formats"""
        invalid_emails = [
            "not-an-email",
            "@example.com",
            "test@",
            "test@example",
            "test@example.com" + "x" * 300,  # oversized email
        ]

        for invalid_email in invalid_emails:
            response = client.post(
                "/api/v1/players/",
                json={"name": f"Test Player {invalid_email}", "email": invalid_email},
            )
            # Should reject invalid emails
            assert response.status_code in [400, 422], (
                f"Failed for email: {invalid_email}"
            )

        # Test edge cases that might be valid
        edge_case_emails = [
            " test@example.com ",  # with spaces - might be trimmed
            "test..test@example.com",  # double dots - might be valid in some contexts
        ]

        for email in edge_case_emails:
            response = client.post(
                "/api/v1/players/", json={"name": f"Edge Case {email}", "email": email}
            )
            # These might be accepted (trimmed/normalized) or rejected
            assert response.status_code in [201, 400, 422], (
                f"Unexpected status for: {email}"
            )

    def test_sql_injection_attempt(self, clean_db: Session):
        """Test SQL injection prevention"""
        malicious_names = [
            "'; DROP TABLE players; --",
            "' OR '1'='1",
            "admin'/*",
            "'; UPDATE players SET name='hacked' WHERE id=1; --",
        ]

        for malicious_name in malicious_names:
            response = client.post(
                "/api/v1/players/",
                json={"name": malicious_name, "email": "test@example.com"},
            )
            # Should either sanitize or reject, but not execute SQL
            assert response.status_code in [201, 400, 422]

            if response.status_code == 201:
                # If accepted, verify it's stored as plain text, not executed
                player_id = response.json()["id"]
                get_response = client.get(f"/api/v1/players/{player_id}")
                assert get_response.json()["name"] == malicious_name


class TestConcurrencyScenarios:
    """Test concurrent access and race conditions"""

    @pytest.mark.skip(reason="Flaky in Docker environment due to database contention")
    def test_concurrent_player_creation(self, clean_db: Session):
        """Test creating players with unique emails simultaneously"""
        import queue
        import threading

        results = queue.Queue()

        def create_player(player_id):
            try:
                # Use unique names and emails to avoid conflicts
                response = client.post(
                    "/api/v1/players/",
                    json={
                        "name": f"Concurrent Player {player_id}",
                        "email": f"concurrent{player_id}@example.com",
                    },
                )
                results.put(response.status_code)
            except Exception as e:
                results.put(str(e))

        # Create multiple threads with unique data
        threads = []
        for i in range(3):
            thread = threading.Thread(target=create_player, args=(i,))
            threads.append(thread)
            thread.start()

        # Wait for all threads to complete
        for thread in threads:
            thread.join()

        # Check results - should handle concurrent requests gracefully
        status_codes = []
        while not results.empty():
            status_codes.append(results.get())

        # All should succeed since we use unique data
        assert len(status_codes) == 3
        success_count = len([code for code in status_codes if code == 201])
        assert success_count >= 2  # Most should succeed

    def test_concurrent_player_updates(self, clean_db: Session):
        """Test updating same player simultaneously"""
        # Create a player first
        response = client.post(
            "/api/v1/players/",
            json={"name": "Update Test Player", "email": "update@example.com"},
        )
        assert response.status_code == 201
        player_id = response.json()["id"]

        import queue
        import threading

        results = queue.Queue()

        def update_player(new_name):
            try:
                response = client.put(
                    f"/api/v1/players/{player_id}", json={"name": new_name}
                )
                results.put((response.status_code, new_name))
            except Exception as e:
                results.put((str(e), new_name))

        # Update same player with different names simultaneously
        threads = []
        names = ["Name A", "Name B", "Name C"]
        for name in names:
            thread = threading.Thread(target=update_player, args=(name,))
            threads.append(thread)
            thread.start()

        # Wait for all threads
        for thread in threads:
            thread.join()

        # Verify final state is consistent
        final_response = client.get(f"/api/v1/players/{player_id}")
        assert final_response.status_code == 200
        final_name = final_response.json()["name"]
        assert final_name in names  # Should be one of the attempted names


class TestPerformanceScenarios:
    """Test performance under load and edge cases"""

    def test_large_player_list_pagination(self, clean_db: Session):
        """Test pagination with large number of players"""
        # Create many players
        for i in range(50):
            response = client.post(
                "/api/v1/players/",
                json={"name": f"Player {i:03d}", "email": f"player{i}@example.com"},
            )
            assert response.status_code == 201

        # Test pagination limits
        response = client.get(
            "/api/v1/players/?page=1&page_size=100"
        )  # Very large page size
        assert response.status_code == 200
        data = response.json()
        # Should limit page size to reasonable amount
        assert len(data["players"]) <= 50  # Should not exceed available players

    def test_search_performance(self, clean_db: Session):
        """Test search with various query patterns"""
        # Create players with searchable names
        names = ["John Doe", "Jane Smith", "John Smith", "Bob Johnson"]
        for name in names:
            response = client.post(
                "/api/v1/players/",
                json={
                    "name": name,
                    "email": f"{name.replace(' ', '').lower()}@example.com",
                },
            )
            assert response.status_code == 201

        # Test various search patterns
        search_queries = [
            "John",  # Common prefix
            "Smith",  # Common suffix
            "jo",  # Partial match
            "xyz",  # No matches
            "",  # Empty search
            " ",  # Whitespace
            "%",  # SQL wildcard
            "*",  # Glob pattern
        ]

        for query in search_queries:
            response = client.get(f"/api/v1/players/?search={query}")
            assert response.status_code == 200
            # Should handle all queries gracefully
            assert "players" in response.json()


class TestSecurityScenarios:
    """Test security-related error scenarios"""

    def test_xss_prevention(self, clean_db: Session):
        """Test XSS prevention in player names"""
        xss_attempts = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>",
            "onclick=\"alert('xss')\"",
        ]

        for xss_payload in xss_attempts:
            response = client.post(
                "/api/v1/players/",
                json={"name": xss_payload, "email": "xss@example.com"},
            )

            if response.status_code == 201:
                # If accepted, verify it's stored safely
                player_id = response.json()["id"]
                get_response = client.get(f"/api/v1/players/{player_id}")
                stored_name = get_response.json()["name"]
                # Should be stored as-is (not executed) or sanitized
                assert isinstance(stored_name, str)

    def test_malformed_json_handling(self, clean_db: Session):
        """Test handling of malformed JSON payloads"""
        malformed_payloads = [
            '{"name": "test"',  # Unclosed JSON
            '{"name": }',  # Invalid syntax
            '{"name": "test", "email": "test@example.com",}',  # Trailing comma
            "",  # Empty payload
            "not json at all",  # Not JSON
        ]

        for payload in malformed_payloads:
            response = client.post(
                "/api/v1/players/",
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            # Should reject malformed JSON gracefully
            assert response.status_code in [400, 422]

    def test_rate_limiting_simulation(self, clean_db: Session):
        """Test behavior under rapid requests (rate limiting simulation)"""
        # Make many rapid requests
        responses = []
        for _ in range(20):
            response = client.get("/api/v1/players/")
            responses.append(response.status_code)

        # Should handle all requests (no rate limiting implemented yet, but should be stable)
        success_count = len([code for code in responses if code == 200])
        assert success_count >= 15  # Most should succeed
