# ABOUTME: Integration tests for team API endpoints
# ABOUTME: Tests full API workflow with database operations and TrueSkill integration

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.player import Player
from app.models.team import Team
from app.models.teamgame import TeamGame


@pytest.fixture
def test_players(clean_db: Session):
    """Create test players for team testing"""
    # Clear team-related data first
    clean_db.query(TeamGame).delete()
    clean_db.query(Team).delete()
    clean_db.query(Player).delete()
    clean_db.commit()

    players = []
    import time

    timestamp = int(time.time() * 1000)  # Use timestamp to ensure unique names

    for i in range(1, 7):  # Create 6 test players
        player = Player(
            name=f"TeamPlayer{timestamp}_{i}",
            email=f"teamplayer{timestamp}_{i}@test.com",
            trueskill_mu=25.0,
            trueskill_sigma=8.3333,
            is_active=True,
        )
        clean_db.add(player)
        players.append(player)

    clean_db.commit()
    for player in players:
        clean_db.refresh(player)

    return players


class TestTeamEndpoints:
    """Test team CRUD endpoints"""

    def test_create_team_success(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test successful team creation"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        response = client.post(
            "/api/v1/teams/",
            json={"player1_id": test_players[0].id, "player2_id": test_players[1].id},
        )

        assert response.status_code == 201
        data = response.json()

        assert data["player1_id"] == min(test_players[0].id, test_players[1].id)
        assert data["player2_id"] == max(test_players[0].id, test_players[1].id)
        assert data["trueskill_mu"] == 50.0  # 25 + 25
        assert abs(data["trueskill_sigma"] - 11.785) < 0.01  # sqrt(8.3333^2 + 8.3333^2)
        assert data["games_played"] == 0
        assert data["wins"] == 0
        assert data["losses"] == 0
        assert data["is_active"] is True
        assert "&" in data["player_names"]

    def test_create_team_get_existing(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test that creating same team returns existing team"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        # Create team first time
        response1 = client.post(
            "/api/v1/teams/",
            json={"player1_id": test_players[0].id, "player2_id": test_players[1].id},
        )
        assert response1.status_code == 201
        team_id = response1.json()["id"]

        # Create same team again (different order)
        response2 = client.post(
            "/api/v1/teams/",
            json={"player1_id": test_players[1].id, "player2_id": test_players[0].id},
        )
        assert response2.status_code == 201
        assert response2.json()["id"] == team_id  # Same team returned

    def test_create_team_same_players_error(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test error when creating team with same player twice"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        response = client.post(
            "/api/v1/teams/",
            json={"player1_id": test_players[0].id, "player2_id": test_players[0].id},
        )

        assert response.status_code == 400
        assert "Players must be different" in response.json()["detail"]

    def test_create_team_nonexistent_player(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test error when creating team with nonexistent player"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        response = client.post(
            "/api/v1/teams/",
            json={"player1_id": test_players[0].id, "player2_id": 9999},
        )

        assert response.status_code == 404
        assert "not found or inactive" in response.json()["detail"]

    def test_list_teams_empty(self, client: TestClient, clean_db: Session):
        """Test listing teams when none exist"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        response = client.get("/api/v1/teams/")

        assert response.status_code == 200
        data = response.json()
        assert data["teams"] == []
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["page_size"] == 20
        assert data["total_pages"] == 0

    def test_list_teams_with_data(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test listing teams with existing data"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        # Create a few teams
        team_data = [
            {"player1_id": test_players[0].id, "player2_id": test_players[1].id},
            {"player1_id": test_players[2].id, "player2_id": test_players[3].id},
            {"player1_id": test_players[4].id, "player2_id": test_players[5].id},
        ]

        created_teams = []
        for team_json in team_data:
            response = client.post("/api/v1/teams/", json=team_json)
            assert response.status_code == 201
            created_teams.append(response.json())

        # List teams
        response = client.get("/api/v1/teams/")
        assert response.status_code == 200

        data = response.json()
        assert len(data["teams"]) == 3
        assert data["total"] == 3
        assert data["page"] == 1
        assert data["total_pages"] == 1

        # Teams should be ordered by conservative rating (all equal initially)
        # Conservative rating = mu - 3*sigma = 50.0 - 3*11.785 = 14.645
        for team in data["teams"]:
            assert abs(team["conservative_rating"] - 14.645) < 0.01

    def test_list_teams_pagination(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test team list pagination"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        # Create 3 teams
        for i in range(0, 6, 2):
            client.post(
                "/api/v1/teams/",
                json={
                    "player1_id": test_players[i].id,
                    "player2_id": test_players[i + 1].id,
                },
            )

        # Test page size limit
        response = client.get("/api/v1/teams/?page_size=2")
        assert response.status_code == 200

        data = response.json()
        assert len(data["teams"]) == 2
        assert data["total"] == 3
        assert data["page"] == 1
        assert data["page_size"] == 2
        assert data["total_pages"] == 2

        # Test second page
        response = client.get("/api/v1/teams/?page=2&page_size=2")
        assert response.status_code == 200

        data = response.json()
        assert len(data["teams"]) == 1  # Last team on page 2
        assert data["page"] == 2

    def test_get_team_by_id(self, client: TestClient, test_players, clean_db: Session):
        """Test getting specific team by ID"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        # Create team
        response = client.post(
            "/api/v1/teams/",
            json={"player1_id": test_players[0].id, "player2_id": test_players[1].id},
        )
        team_id = response.json()["id"]

        # Get team by ID
        response = client.get(f"/api/v1/teams/{team_id}")
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == team_id
        assert "&" in data["player_names"]

    def test_get_team_by_id_not_found(self, client: TestClient, clean_db: Session):
        """Test getting nonexistent team by ID"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        response = client.get("/api/v1/teams/9999")
        assert response.status_code == 404
        assert "Team not found" in response.json()["detail"]

    def test_delete_team(self, client: TestClient, test_players, clean_db: Session):
        """Test soft deleting a team"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        # Create team
        response = client.post(
            "/api/v1/teams/",
            json={"player1_id": test_players[0].id, "player2_id": test_players[1].id},
        )
        team_id = response.json()["id"]

        # Delete team
        response = client.delete(f"/api/v1/teams/{team_id}")
        assert response.status_code == 204

        # Team should not appear in active list
        response = client.get("/api/v1/teams/")
        assert response.status_code == 200
        assert len(response.json()["teams"]) == 0

        # But should still exist when including inactive
        response = client.get("/api/v1/teams/?active_only=false")
        assert response.status_code == 200
        teams = response.json()["teams"]
        assert len(teams) == 1
        assert teams[0]["id"] == team_id
        assert teams[0]["is_active"] is False

    def test_delete_team_not_found(self, client: TestClient, clean_db: Session):
        """Test deleting nonexistent team"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        response = client.delete("/api/v1/teams/9999")
        assert response.status_code == 404
        assert "Team not found" in response.json()["detail"]

    def test_delete_team_already_inactive(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test deleting already inactive team"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        # Create and delete team
        response = client.post(
            "/api/v1/teams/",
            json={"player1_id": test_players[0].id, "player2_id": test_players[1].id},
        )
        team_id = response.json()["id"]

        client.delete(f"/api/v1/teams/{team_id}")

        # Try to delete again
        response = client.delete(f"/api/v1/teams/{team_id}")
        assert response.status_code == 400
        assert "already inactive" in response.json()["detail"]

    def test_find_team_by_players(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test finding team by player IDs"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        # Create team
        response = client.post(
            "/api/v1/teams/",
            json={"player1_id": test_players[0].id, "player2_id": test_players[1].id},
        )
        team_id = response.json()["id"]

        # Find team by players (order 1)
        response = client.get(
            f"/api/v1/teams/search/by-players?player1_id={test_players[0].id}&player2_id={test_players[1].id}"
        )
        assert response.status_code == 200
        assert response.json()["id"] == team_id

        # Find team by players (order 2 - should find same team)
        response = client.get(
            f"/api/v1/teams/search/by-players?player1_id={test_players[1].id}&player2_id={test_players[0].id}"
        )
        assert response.status_code == 200
        assert response.json()["id"] == team_id

    def test_find_team_by_players_not_found(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test finding nonexistent team by player IDs"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        response = client.get(
            f"/api/v1/teams/search/by-players?player1_id={test_players[0].id}&player2_id={test_players[1].id}"
        )
        assert response.status_code == 404
        assert "Team not found" in response.json()["detail"]

    def test_find_team_by_same_players_error(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test finding team with same player twice"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        response = client.get(
            f"/api/v1/teams/search/by-players?player1_id={test_players[0].id}&player2_id={test_players[0].id}"
        )
        assert response.status_code == 400
        assert "Players must be different" in response.json()["detail"]


class TestTeamGameEndpoints:
    """Test team game CRUD endpoints"""

    @pytest.fixture
    def test_teams(self, client: TestClient, test_players, clean_db: Session):
        """Create test teams for team game testing"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        teams = []
        for i in range(0, 4, 2):
            response = client.post(
                "/api/v1/teams/",
                json={
                    "player1_id": test_players[i].id,
                    "player2_id": test_players[i + 1].id,
                },
            )
            assert response.status_code == 201
            teams.append(response.json())
        return teams

    def test_create_team_game_success(
        self, client: TestClient, test_teams, clean_db: Session
    ):
        """Test successful team game creation"""
        # Clear existing team games
        clean_db.query(TeamGame).delete()
        clean_db.commit()

        response = client.post(
            "/api/v1/team-games/",
            json={
                "team1_id": test_teams[0]["id"],
                "team2_id": test_teams[1]["id"],
                "winner_team_id": test_teams[0]["id"],
            },
        )

        assert response.status_code == 201
        data = response.json()

        assert data["team1_id"] == test_teams[0]["id"]
        assert data["team2_id"] == test_teams[1]["id"]
        assert data["winner_team_id"] == test_teams[0]["id"]
        assert "created_at" in data

        # Verify team ratings were updated
        winning_team = data["team1"]
        losing_team = data["team2"]

        assert winning_team["trueskill_mu"] > 50.0  # Winner gains rating
        assert losing_team["trueskill_mu"] < 50.0  # Loser loses rating
        assert winning_team["games_played"] == 1
        assert losing_team["games_played"] == 1
        assert winning_team["wins"] == 1
        assert losing_team["losses"] == 1

    def test_create_team_game_same_teams_error(
        self, client: TestClient, test_teams, clean_db: Session
    ):
        """Test error when creating game with same team twice"""
        # Clear existing team games
        clean_db.query(TeamGame).delete()
        clean_db.commit()

        response = client.post(
            "/api/v1/team-games/",
            json={
                "team1_id": test_teams[0]["id"],
                "team2_id": test_teams[0]["id"],
                "winner_team_id": test_teams[0]["id"],
            },
        )

        assert response.status_code == 400
        assert "Team 1 and Team 2 must be different" in response.json()["detail"]

    def test_create_team_game_invalid_winner(
        self, client: TestClient, test_teams, clean_db: Session
    ):
        """Test error when winner is not one of the competing teams"""
        # Clear existing team games
        clean_db.query(TeamGame).delete()
        clean_db.commit()

        # Create third team for invalid winner
        response = client.post(
            "/api/v1/team-games/",
            json={
                "team1_id": test_teams[0]["id"],
                "team2_id": test_teams[1]["id"],
                "winner_team_id": 9999,  # Invalid winner
            },
        )

        assert response.status_code == 400
        assert (
            "Winner team must be one of the competing teams"
            in response.json()["detail"]
        )

    def test_create_team_game_nonexistent_team(
        self, client: TestClient, test_teams, clean_db: Session
    ):
        """Test error when team doesn't exist"""
        # Clear existing team games
        clean_db.query(TeamGame).delete()
        clean_db.commit()

        response = client.post(
            "/api/v1/team-games/",
            json={
                "team1_id": 9999,  # Nonexistent team
                "team2_id": test_teams[1]["id"],
                "winner_team_id": test_teams[1]["id"],
            },
        )

        assert response.status_code == 404
        assert "not found or inactive" in response.json()["detail"]

    def test_create_team_game_quick_success(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test quick team game creation from 4 player IDs"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        response = client.post(
            "/api/v1/team-games/quick",
            json={
                "team1_player1_id": test_players[0].id,
                "team1_player2_id": test_players[1].id,
                "team2_player1_id": test_players[2].id,
                "team2_player2_id": test_players[3].id,
                "winner_team": 1,
            },
        )

        assert response.status_code == 201
        data = response.json()

        # Should have created teams and game
        assert "team1" in data
        assert "team2" in data
        assert "winner_team" in data
        assert data["winner_team_id"] == data["team1"]["id"]

    def test_create_team_game_quick_same_players_error(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test error when quick game has duplicate players"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        response = client.post(
            "/api/v1/team-games/quick",
            json={
                "team1_player1_id": test_players[0].id,
                "team1_player2_id": test_players[0].id,  # Same player
                "team2_player1_id": test_players[2].id,
                "team2_player2_id": test_players[3].id,
                "winner_team": 1,
            },
        )

        assert response.status_code == 400
        assert "All four players must be different" in response.json()["detail"]

    def test_list_team_games_empty(self, client: TestClient, clean_db: Session):
        """Test listing team games when none exist"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        response = client.get("/api/v1/team-games/")

        assert response.status_code == 200
        data = response.json()
        assert data["team_games"] == []
        assert data["total"] == 0

    def test_list_team_games_with_data(
        self, client: TestClient, test_teams, clean_db: Session
    ):
        """Test listing team games with existing data"""
        # Clear existing team games
        clean_db.query(TeamGame).delete()
        clean_db.commit()

        # Create a few games
        for i in range(3):
            winner_id = test_teams[i % 2]["id"]
            client.post(
                "/api/v1/team-games/",
                json={
                    "team1_id": test_teams[0]["id"],
                    "team2_id": test_teams[1]["id"],
                    "winner_team_id": winner_id,
                },
            )

        # List games
        response = client.get("/api/v1/team-games/")
        assert response.status_code == 200

        data = response.json()
        assert len(data["team_games"]) == 3
        assert data["total"] == 3

        # Games should be ordered by creation date (newest first)
        games = data["team_games"]
        for game in games:
            assert "created_at" in game
            assert "team1" in game
            assert "team2" in game

    def test_list_team_games_filtered_by_team(
        self, client: TestClient, test_teams, clean_db: Session
    ):
        """Test listing team games filtered by specific team"""
        # Clear existing team games
        clean_db.query(TeamGame).delete()
        clean_db.commit()

        # Create games involving different teams
        client.post(
            "/api/v1/team-games/",
            json={
                "team1_id": test_teams[0]["id"],
                "team2_id": test_teams[1]["id"],
                "winner_team_id": test_teams[0]["id"],
            },
        )

        # Filter by team 0
        response = client.get(f"/api/v1/team-games/?team_id={test_teams[0]['id']}")
        assert response.status_code == 200

        data = response.json()
        assert len(data["team_games"]) == 1
        game = data["team_games"][0]
        assert (
            game["team1_id"] == test_teams[0]["id"]
            or game["team2_id"] == test_teams[0]["id"]
        )

    def test_get_team_game_by_id(
        self, client: TestClient, test_teams, clean_db: Session
    ):
        """Test getting specific team game by ID"""
        # Clear existing team games
        clean_db.query(TeamGame).delete()
        clean_db.commit()

        # Create game
        response = client.post(
            "/api/v1/team-games/",
            json={
                "team1_id": test_teams[0]["id"],
                "team2_id": test_teams[1]["id"],
                "winner_team_id": test_teams[0]["id"],
            },
        )
        game_id = response.json()["id"]

        # Get game by ID
        response = client.get(f"/api/v1/team-games/{game_id}")
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == game_id
        assert data["team1_id"] == test_teams[0]["id"]
        assert data["team2_id"] == test_teams[1]["id"]

    def test_get_team_game_by_id_not_found(self, client: TestClient, clean_db: Session):
        """Test getting nonexistent team game by ID"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        response = client.get("/api/v1/team-games/9999")
        assert response.status_code == 404
        assert "Team game not found" in response.json()["detail"]


class TestTeamTrueSkillIntegration:
    """Test TrueSkill integration with team operations"""

    def test_team_rating_updates_from_games(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test that team ratings update correctly after multiple games"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        # Create teams
        team1_response = client.post(
            "/api/v1/teams/",
            json={"player1_id": test_players[0].id, "player2_id": test_players[1].id},
        )
        team2_response = client.post(
            "/api/v1/teams/",
            json={"player1_id": test_players[2].id, "player2_id": test_players[3].id},
        )

        team1_id = team1_response.json()["id"]
        team2_id = team2_response.json()["id"]

        # Initial ratings should be equal
        initial_team1 = client.get(f"/api/v1/teams/{team1_id}").json()
        initial_team2 = client.get(f"/api/v1/teams/{team2_id}").json()

        assert initial_team1["trueskill_mu"] == 50.0
        assert initial_team2["trueskill_mu"] == 50.0

        # Team 1 wins multiple games
        for _ in range(3):
            client.post(
                "/api/v1/team-games/",
                json={
                    "team1_id": team1_id,
                    "team2_id": team2_id,
                    "winner_team_id": team1_id,
                },
            )

        # Check updated ratings
        updated_team1 = client.get(f"/api/v1/teams/{team1_id}").json()
        updated_team2 = client.get(f"/api/v1/teams/{team2_id}").json()

        # Team 1 (winner) should have higher rating
        assert updated_team1["trueskill_mu"] > initial_team1["trueskill_mu"]
        assert updated_team2["trueskill_mu"] < initial_team2["trueskill_mu"]

        # Both teams should have played 3 games
        assert updated_team1["games_played"] == 3
        assert updated_team2["games_played"] == 3

        # Team 1 should have 3 wins, team 2 should have 3 losses
        assert updated_team1["wins"] == 3
        assert updated_team1["losses"] == 0
        assert updated_team2["wins"] == 0
        assert updated_team2["losses"] == 3

    def test_individual_player_rating_updates_from_team_games(
        self, client: TestClient, test_players, clean_db: Session
    ):
        """Test that individual player ratings update from team games"""
        # Clear database
        clean_db.query(TeamGame).delete()
        clean_db.query(Team).delete()
        clean_db.commit()

        # Get initial player ratings
        initial_players = []
        for i in range(4):
            response = client.get(f"/api/v1/players/{test_players[i].id}")
            initial_players.append(response.json())

        # All should start with default ratings
        for player in initial_players:
            assert player["trueskill_mu"] == 25.0
            assert player["games_played"] == 0

        # Create team game
        client.post(
            "/api/v1/team-games/quick",
            json={
                "team1_player1_id": test_players[0].id,
                "team1_player2_id": test_players[1].id,
                "team2_player1_id": test_players[2].id,
                "team2_player2_id": test_players[3].id,
                "winner_team": 1,  # Team 1 wins
            },
        )

        # Check updated player ratings
        updated_players = []
        for i in range(4):
            response = client.get(f"/api/v1/players/{test_players[i].id}")
            updated_players.append(response.json())

        # Winners (players 0 and 1) should gain rating
        assert updated_players[0]["trueskill_mu"] > 25.0
        assert updated_players[1]["trueskill_mu"] > 25.0

        # Losers (players 2 and 3) should lose rating
        assert updated_players[2]["trueskill_mu"] < 25.0
        assert updated_players[3]["trueskill_mu"] < 25.0

        # All players should have games_played incremented
        for player in updated_players:
            assert player["games_played"] == 1

        # Winners should have 1 win, losers should have 1 loss
        assert updated_players[0]["wins"] == 1
        assert updated_players[1]["wins"] == 1
        assert updated_players[2]["losses"] == 1
        assert updated_players[3]["losses"] == 1
