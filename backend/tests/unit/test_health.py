# ABOUTME: Unit tests for health and readiness check endpoints
# ABOUTME: Tests basic health checks, database connectivity, and error handling scenarios

from unittest.mock import Mock, patch

from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import config
from app.main import app


class TestHealthEndpoints:
    def setup_method(self):
        """Set up test client"""
        self.client = TestClient(app)

    def test_health_check_success(self):
        """Test basic health check endpoint returns correct response"""
        response = self.client.get("/health")

        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "foosball-api"
        assert data["version"] == config.version
        assert data["environment"] == config.environment

    def test_health_check_response_structure(self):
        """Test health check response has all required fields"""
        response = self.client.get("/health")

        assert response.status_code == 200

        data = response.json()
        expected_keys = {"status", "service", "version", "environment"}
        assert set(data.keys()) == expected_keys

    def test_health_check_no_database_dependency(self):
        """Test health check works without database connection"""
        # Health check should not depend on database
        response = self.client.get("/health")

        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_health_check_content_type(self):
        """Test health check returns JSON content type"""
        response = self.client.get("/health")

        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"

    @patch("app.core.config.config.version", "v1.2.3")
    @patch("app.core.config.config.environment", "test")
    def test_health_check_config_values(self):
        """Test health check returns correct config values"""
        response = self.client.get("/health")

        assert response.status_code == 200

        data = response.json()
        assert data["version"] == "v1.2.3"
        assert data["environment"] == "test"

    def test_readiness_check_success(self):
        """Test readiness check with healthy database connection"""
        response = self.client.get("/ready")

        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "ready"
        assert data["service"] == "foosball-api"
        assert data["version"] == config.version
        assert data["environment"] == config.environment
        assert data["checks"]["database"] == "healthy"

    def test_readiness_check_response_structure(self):
        """Test readiness check response has all required fields"""
        response = self.client.get("/ready")

        assert response.status_code == 200

        data = response.json()
        expected_keys = {"status", "service", "version", "environment", "checks"}
        assert set(data.keys()) == expected_keys

        # Check the nested checks structure
        assert "database" in data["checks"]

    def test_readiness_check_database_connection(self):
        """Test readiness check actually tests database connection"""
        from app.db.database import get_db

        with patch("app.db.database.get_db") as mock_get_db:
            mock_db = Mock(spec=Session)
            mock_get_db.return_value = mock_db

            # Mock the override dependency in the test client
            def override_get_db():
                return mock_db

            app.dependency_overrides[get_db] = override_get_db

            try:
                response = self.client.get("/ready")

                assert response.status_code == 200
                # Verify that execute was called with SELECT 1
                mock_db.execute.assert_called_once()
                call_args = mock_db.execute.call_args[0][0]
                assert str(call_args) == "SELECT 1"
            finally:
                app.dependency_overrides.clear()

    def test_readiness_check_database_failure(self):
        """Test readiness check handles database connection failure"""
        from app.db.database import get_db

        with patch("app.db.database.get_db") as mock_get_db:
            mock_db = Mock(spec=Session)
            mock_db.execute.side_effect = SQLAlchemyError("Database connection failed")
            mock_get_db.return_value = mock_db

            # Mock the override dependency in the test client
            def override_get_db():
                return mock_db

            app.dependency_overrides[get_db] = override_get_db

            try:
                response = self.client.get("/ready")

                assert response.status_code == 503

                data = response.json()["detail"]
                assert data["status"] == "not_ready"
                assert "Database connection failed" in data["error"]
                assert data["checks"]["database"] == "unhealthy"
            finally:
                app.dependency_overrides.clear()

    def test_readiness_check_generic_exception(self):
        """Test readiness check handles generic exceptions"""
        from app.db.database import get_db

        with patch("app.db.database.get_db") as mock_get_db:
            mock_db = Mock(spec=Session)
            mock_db.execute.side_effect = Exception("Unexpected error")
            mock_get_db.return_value = mock_db

            # Mock the override dependency in the test client
            def override_get_db():
                return mock_db

            app.dependency_overrides[get_db] = override_get_db

            try:
                response = self.client.get("/ready")

                assert response.status_code == 503

                data = response.json()["detail"]
                assert data["status"] == "not_ready"
                assert "Unexpected error" in data["error"]
                assert data["checks"]["database"] == "unhealthy"
            finally:
                app.dependency_overrides.clear()

    @patch("app.core.config.config.version", "v2.0.0")
    @patch("app.core.config.config.environment", "production")
    def test_readiness_check_config_values(self):
        """Test readiness check returns correct config values"""
        response = self.client.get("/ready")

        assert response.status_code == 200

        data = response.json()
        assert data["version"] == "v2.0.0"
        assert data["environment"] == "production"

    def test_readiness_check_content_type_success(self):
        """Test readiness check returns JSON content type on success"""
        response = self.client.get("/ready")

        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"

    def test_readiness_check_content_type_failure(self):
        """Test readiness check returns JSON content type on failure"""
        from app.db.database import get_db

        with patch("app.db.database.get_db") as mock_get_db:
            mock_db = Mock(spec=Session)
            mock_db.execute.side_effect = Exception("Database error")
            mock_get_db.return_value = mock_db

            def override_get_db():
                return mock_db

            app.dependency_overrides[get_db] = override_get_db

            try:
                response = self.client.get("/ready")

                assert response.status_code == 503
                assert response.headers["content-type"] == "application/json"
            finally:
                app.dependency_overrides.clear()

    def test_health_endpoint_tags(self):
        """Test health endpoints have correct OpenAPI tags"""
        # This tests the router configuration
        from app.api.v1.health import router

        assert router.tags == ["health"]

    def test_health_endpoint_no_auth_required(self):
        """Test health endpoints don't require authentication"""
        # Health endpoints should be publicly accessible
        health_response = self.client.get("/health")
        ready_response = self.client.get("/ready")

        # Should not return 401 Unauthorized
        assert health_response.status_code != 401
        assert ready_response.status_code in [200, 503]  # 503 if DB is down

    def test_concurrent_health_checks(self):
        """Test multiple concurrent health check requests"""
        import concurrent.futures

        def make_request():
            return self.client.get("/health")

        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            responses = [future.result() for future in futures]

        # All requests should succeed
        for response in responses:
            assert response.status_code == 200
            assert response.json()["status"] == "healthy"

    def test_concurrent_readiness_checks(self):
        """Test multiple concurrent readiness check requests"""
        import concurrent.futures

        def make_request():
            return self.client.get("/ready")

        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(make_request) for _ in range(5)]
            responses = [future.result() for future in futures]

        # All requests should succeed (assuming healthy DB)
        for response in responses:
            assert response.status_code == 200
            assert response.json()["status"] == "ready"

    def test_health_endpoint_method_not_allowed(self):
        """Test health endpoint only accepts GET requests"""
        post_response = self.client.post("/health")
        put_response = self.client.put("/health")
        delete_response = self.client.delete("/health")

        assert post_response.status_code == 405
        assert put_response.status_code == 405
        assert delete_response.status_code == 405

    def test_ready_endpoint_method_not_allowed(self):
        """Test ready endpoint only accepts GET requests"""
        post_response = self.client.post("/ready")
        put_response = self.client.put("/ready")
        delete_response = self.client.delete("/ready")

        assert post_response.status_code == 405
        assert put_response.status_code == 405
        assert delete_response.status_code == 405

    def test_health_check_performance(self):
        """Test health check responds quickly"""
        import time

        start_time = time.time()
        response = self.client.get("/health")
        end_time = time.time()

        assert response.status_code == 200
        # Health check should be very fast (under 100ms)
        assert (end_time - start_time) < 0.1

    def test_readiness_check_error_details(self):
        """Test readiness check provides detailed error information"""
        from app.db.database import get_db

        with patch("app.db.database.get_db") as mock_get_db:
            mock_db = Mock(spec=Session)
            specific_error = SQLAlchemyError("Connection timeout after 30 seconds")
            mock_db.execute.side_effect = specific_error
            mock_get_db.return_value = mock_db

            def override_get_db():
                return mock_db

            app.dependency_overrides[get_db] = override_get_db

            try:
                response = self.client.get("/ready")

                assert response.status_code == 503

                data = response.json()["detail"]
                assert "Connection timeout after 30 seconds" in data["error"]
                assert data["status"] == "not_ready"
                assert data["checks"]["database"] == "unhealthy"
            finally:
                app.dependency_overrides.clear()
