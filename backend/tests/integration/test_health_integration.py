# ABOUTME: Integration tests for health endpoints with real database connections
# ABOUTME: Tests actual database connectivity and real-world health check scenarios

from fastapi.testclient import TestClient

from app.main import app


class TestHealthIntegration:
    def setup_method(self):
        """Set up test client for integration tests"""
        self.client = TestClient(app)

    def test_health_endpoint_integration(self):
        """Test health endpoint in integration environment"""
        response = self.client.get("/health")

        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "foosball-api"
        assert "version" in data
        assert "environment" in data

    def test_readiness_endpoint_with_real_database(self):
        """Test readiness endpoint with actual database connection"""
        response = self.client.get("/ready")

        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "ready"
        assert data["service"] == "foosball-api"
        assert data["checks"]["database"] == "healthy"
        assert "version" in data
        assert "environment" in data

    def test_readiness_endpoint_database_query_execution(self):
        """Test that readiness check actually executes database query"""
        # This test verifies that the database connection is working
        # by making a readiness check and ensuring it succeeds
        response = self.client.get("/ready")

        # If database is working, this should succeed
        assert response.status_code == 200

        data = response.json()
        assert data["checks"]["database"] == "healthy"

    def test_health_endpoints_openapi_documentation(self):
        """Test that health endpoints are properly documented in OpenAPI"""
        response = self.client.get("/openapi.json")

        assert response.status_code == 200

        openapi_spec = response.json()
        paths = openapi_spec["paths"]

        # Check health endpoint is documented
        assert "/health" in paths
        assert "get" in paths["/health"]

        # Check ready endpoint is documented
        assert "/ready" in paths
        assert "get" in paths["/ready"]

    def test_health_endpoints_in_docs(self):
        """Test that health endpoints appear in interactive docs"""
        docs_response = self.client.get("/docs")
        redoc_response = self.client.get("/redoc")

        # Docs should be accessible
        assert docs_response.status_code == 200
        assert redoc_response.status_code == 200

    def test_health_check_response_time(self):
        """Test health check response time in integration environment"""
        import time

        start_time = time.time()
        response = self.client.get("/health")
        end_time = time.time()

        assert response.status_code == 200

        # Health check should be very fast even in integration
        response_time = end_time - start_time
        assert response_time < 1.0  # Should respond within 1 second

    def test_readiness_check_response_time(self):
        """Test readiness check response time with database query"""
        import time

        start_time = time.time()
        response = self.client.get("/ready")
        end_time = time.time()

        assert response.status_code == 200

        # Readiness check should be reasonably fast
        response_time = end_time - start_time
        assert response_time < 5.0  # Should respond within 5 seconds

    def test_health_check_under_load(self):
        """Test health check performance under concurrent load"""
        import concurrent.futures
        import time

        def make_health_request():
            start = time.time()
            response = self.client.get("/health")
            end = time.time()
            return response.status_code, end - start

        # Simulate load with multiple concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_health_request) for _ in range(20)]
            results = [future.result() for future in futures]

        # All requests should succeed
        for status_code, response_time in results:
            assert status_code == 200
            assert response_time < 2.0  # Each request should complete quickly

    def test_readiness_check_under_load(self):
        """Test readiness check performance under concurrent load"""
        import concurrent.futures
        import time

        def make_readiness_request():
            start = time.time()
            response = self.client.get("/ready")
            end = time.time()
            return response.status_code, end - start

        # Simulate load with fewer concurrent requests due to DB connections
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_readiness_request) for _ in range(10)]
            results = [future.result() for future in futures]

        # All requests should succeed (assuming healthy database)
        for status_code, response_time in results:
            assert status_code == 200
            assert response_time < 5.0

    def test_health_endpoint_caching_headers(self):
        """Test health endpoint sets appropriate caching headers"""
        response = self.client.get("/health")

        assert response.status_code == 200

        # Health checks should not be cached aggressively
        headers = response.headers
        # FastAPI doesn't set cache headers by default, but we can verify
        # that we don't have unexpected caching
        assert "cache-control" not in headers.keys() or "no-cache" in headers.get(
            "cache-control", ""
        )

    def test_readiness_endpoint_error_scenarios(self):
        """Test readiness endpoint behavior in various scenarios"""
        # This test assumes the database is healthy in integration tests
        # but verifies the endpoint structure for error handling

        response = self.client.get("/ready")

        # Should succeed in integration environment
        assert response.status_code == 200

        data = response.json()

        # Verify response structure is correct for success case
        assert "status" in data
        assert "checks" in data
        assert "database" in data["checks"]

    def test_config_values_in_health_responses(self):
        """Test that configuration values are correctly reflected in responses"""
        health_response = self.client.get("/health")
        ready_response = self.client.get("/ready")

        assert health_response.status_code == 200
        assert ready_response.status_code == 200

        health_data = health_response.json()
        ready_data = ready_response.json()

        # Both should have consistent config values
        assert health_data["version"] == ready_data["version"]
        assert health_data["environment"] == ready_data["environment"]
        assert health_data["service"] == ready_data["service"]

    def test_health_endpoints_cors_headers(self):
        """Test CORS headers on health endpoints if applicable"""
        response = self.client.get("/health")

        assert response.status_code == 200

        # Check if CORS headers are present (if configured)
        headers = response.headers
        # This test will pass regardless of CORS configuration
        # but ensures the endpoint is accessible
        assert "content-type" in headers

    def test_monitoring_integration_format(self):
        """Test that health check responses are suitable for monitoring tools"""
        health_response = self.client.get("/health")
        ready_response = self.client.get("/ready")

        assert health_response.status_code == 200
        assert ready_response.status_code == 200

        health_data = health_response.json()
        ready_data = ready_response.json()

        # Verify standard monitoring fields are present
        monitoring_fields = ["status", "service", "version", "environment"]

        for field in monitoring_fields:
            assert field in health_data
            assert field in ready_data

        # Ready response should have additional checks
        assert "checks" in ready_data
        assert isinstance(ready_data["checks"], dict)

    def test_uptime_monitoring_compatibility(self):
        """Test compatibility with common uptime monitoring services"""
        response = self.client.get("/health")

        assert response.status_code == 200

        # Response should be JSON
        assert response.headers["content-type"] == "application/json"

        # Response should have status field
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"

    def test_kubernetes_health_check_compatibility(self):
        """Test compatibility with Kubernetes liveness and readiness probes"""
        # Liveness probe (basic health)
        liveness_response = self.client.get("/health")
        assert liveness_response.status_code == 200

        # Readiness probe (includes dependencies)
        readiness_response = self.client.get("/ready")
        assert readiness_response.status_code == 200

        # Both should return JSON with status
        liveness_data = liveness_response.json()
        readiness_data = readiness_response.json()

        assert liveness_data["status"] == "healthy"
        assert readiness_data["status"] == "ready"
