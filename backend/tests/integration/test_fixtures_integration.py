# ABOUTME: Integration tests demonstrating comprehensive test fixture usage
# ABOUTME: Validates that fixtures work correctly with real API endpoints

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from tests.fixtures import PlayerFactory, clear_all_players

client = TestClient(app)


class TestFixturesIntegration:
    """Test suite validating fixture functionality with real API"""

    def test_player_factory_basic_creation(self, clean_db: Session):
        """Test basic player factory functionality"""
        clear_all_players(clean_db)

        # Create player using factory
        player = PlayerFactory.create_player_model(
            db=clean_db, name="Factory Player", email="factory@example.com"
        )

        assert player.id is not None
        assert player.name == "Factory Player"
        assert player.email == "factory@example.com"
        assert player.trueskill_mu == 25.0
        assert player.is_active is True

    def test_diverse_players_fixture(self, clean_db: Session, diverse_players_data):
        """Test that diverse players fixture provides varied data"""
        clear_all_players(clean_db)

        # Validate we have expected variety
        assert len(diverse_players_data) == 5

        # Check we have different player types
        names = [p["name"] for p in diverse_players_data]
        assert "Rookie Player" in names
        assert "Pro Player" in names
        assert "Learning Player" in names

        # Verify skill variation
        mus = [p["trueskill_mu"] for p in diverse_players_data]
        assert min(mus) < 20.0  # Low skill player
        assert max(mus) > 30.0  # High skill player

    def test_multiple_players_factory(self, clean_db: Session):
        """Test creating multiple players with factory"""
        clear_all_players(clean_db)

        players = PlayerFactory.create_multiple_players(db=clean_db, count=5)

        assert len(players) == 5
        assert all(p.id is not None for p in players)
        assert all("Player" in p.name for p in players)

        # Verify unique names and emails
        names = [p.name for p in players]
        emails = [p.email for p in players]
        assert len(set(names)) == 5
        assert len(set(emails)) == 5

    def test_pagination_test_data_fixture(self, pagination_test_data):
        """Test pagination fixture provides correct data structure"""
        assert len(pagination_test_data) == 25

        # Test via API
        response = client.get("/api/v1/players/?page=1&page_size=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data["players"]) == 10
        assert data["total"] == 25
        assert data["total_pages"] == 3

    def test_search_test_data_fixture(self, search_test_data):
        """Test search fixture enables proper search testing"""
        assert len(search_test_data) == 7

        # Test searching for "John"
        response = client.get("/api/v1/players/?search=John")
        assert response.status_code == 200
        data = response.json()

        john_players = [p for p in data["players"] if "John" in p["name"]]
        assert len(john_players) >= 2  # Should find multiple Johns

    def test_performance_test_players_fixture(self, performance_test_players):
        """Test performance fixture creates many players efficiently"""
        assert len(performance_test_players) == 100

        # Verify API can handle large dataset
        response = client.get("/api/v1/players/?page_size=50")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 100
        assert len(data["players"]) == 50

    def test_duplicate_test_scenarios_fixture(
        self, clean_db: Session, duplicate_test_scenarios
    ):
        """Test duplicate scenarios fixture enables validation testing"""
        clear_all_players(clean_db)

        # Test duplicate names
        duplicate_names = duplicate_test_scenarios["duplicate_names"]

        # Create first player
        response = client.post("/api/v1/players/", json=duplicate_names[0])
        assert response.status_code == 201

        # Try to create duplicate
        response = client.post("/api/v1/players/", json=duplicate_names[1])
        assert response.status_code == 400
        assert "name already exists" in response.json()["detail"]

    def test_edge_case_players_fixture(self, clean_db: Session, edge_case_players_data):
        """Test edge case fixture provides boundary condition data"""
        clear_all_players(clean_db)

        # Find long name player
        long_name_player = next(
            p for p in edge_case_players_data if len(p["name"]) > 50
        )

        # Test API handles long name
        response = client.post("/api/v1/players/", json=long_name_player)
        # Should either accept or reject gracefully
        assert response.status_code in [201, 422]

    def test_api_error_scenarios_fixture(self, api_error_scenarios):
        """Test error scenarios fixture enables comprehensive error testing"""
        invalid_requests = api_error_scenarios["invalid_requests"]

        # Test empty name
        empty_name_request = next(r for r in invalid_requests if r.get("name") == "")
        response = client.post("/api/v1/players/", json=empty_name_request)
        assert response.status_code == 422

    def test_rating_calculation_scenarios_fixture(self, rating_calculation_scenarios):
        """Test rating scenarios fixture provides TrueSkill test cases"""
        scenarios = rating_calculation_scenarios

        # Verify we have different scenario types
        scenario_names = [s["name"] for s in scenarios]
        assert "Equal Skill Match" in scenario_names
        assert "Upset Victory" in scenario_names
        assert "Expected Victory" in scenario_names

        # Verify scenario structure
        for scenario in scenarios:
            assert "player1" in scenario
            assert "player2" in scenario
            assert "expected_change" in scenario
            assert "mu" in scenario["player1"]
            assert "sigma" in scenario["player1"]

    def test_leaderboard_creation_utility(self, clean_db: Session):
        """Test leaderboard creation utility function"""
        from tests.fixtures import create_test_leaderboard

        clear_all_players(clean_db)
        leaderboard = create_test_leaderboard(clean_db, size=5)

        assert len(leaderboard) == 5

        # Verify rankings (should be in descending mu order)
        mus = [p.trueskill_mu for p in leaderboard]
        assert mus == sorted(mus, reverse=True)

        # Test via API
        response = client.get("/api/v1/players/")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 5

    def test_high_uncertainty_players_fixture(self, high_uncertainty_players_data):
        """Test high uncertainty players have expected characteristics"""
        for player_data in high_uncertainty_players_data:
            assert player_data["trueskill_sigma"] >= 8.0
            assert player_data["games_played"] == 0  # New players

    def test_low_uncertainty_players_fixture(self, low_uncertainty_players_data):
        """Test low uncertainty players have expected characteristics"""
        for player_data in low_uncertainty_players_data:
            assert player_data["trueskill_sigma"] <= 4.0
            assert player_data["games_played"] >= 100  # Experienced players
