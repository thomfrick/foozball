# ABOUTME: Integration tests for API endpoints
# ABOUTME: Tests API endpoints with database interactions

from fastapi.testclient import TestClient


class TestHealthEndpoints:
    """Test health check endpoints"""

    def test_root_endpoint(self, client: TestClient):
        """Test root endpoint returns correct information"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()

        assert data["name"] == "Foosball TrueSkill Tracker"
        assert data["version"] == "1.0.0"
        assert data["status"] == "healthy"
        assert "environment" in data

    def test_health_endpoint(self, client: TestClient):
        """Test health check endpoint"""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "healthy"
        assert data["service"] == "foosball-api"
        assert data["version"] == "1.0.0"
        assert "environment" in data

    def test_readiness_endpoint(self, client: TestClient):
        """Test readiness endpoint with database check"""
        response = client.get("/ready")

        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "ready"
        assert data["service"] == "foosball-api"
        assert data["version"] == "1.0.0"
        assert "environment" in data
        assert "checks" in data
        assert data["checks"]["database"] == "healthy"


class TestAPIDocumentation:
    """Test API documentation endpoints"""

    def test_openapi_schema(self, client: TestClient):
        """Test OpenAPI schema is accessible"""
        response = client.get("/openapi.json")

        assert response.status_code == 200
        schema = response.json()

        assert "openapi" in schema
        assert "info" in schema
        assert schema["info"]["title"] == "Foosball TrueSkill Tracker API"

    def test_docs_endpoint(self, client: TestClient):
        """Test Swagger UI docs endpoint"""
        response = client.get("/docs")

        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]

    def test_redoc_endpoint(self, client: TestClient):
        """Test ReDoc documentation endpoint"""
        response = client.get("/redoc")

        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]


class TestCORSHeaders:
    """Test CORS configuration"""

    def test_cors_headers_with_origin(self, client: TestClient):
        """Test that CORS headers are present when origin is provided"""
        response = client.get("/health", headers={"Origin": "http://localhost:3000"})

        assert response.status_code == 200
        # CORS headers should be present when origin is provided
        assert "access-control-allow-origin" in response.headers

    def test_preflight_request(self, client: TestClient):
        """Test CORS preflight request"""
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )

        # Should not return an error
        assert response.status_code in [200, 204]
