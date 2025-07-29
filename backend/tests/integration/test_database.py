# ABOUTME: Integration tests for database operations
# ABOUTME: Tests database connectivity, models, and CRUD operations

import pytest
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.player import Player


class TestDatabaseConnection:
    """Test database connectivity and setup"""

    def test_database_connection(self, db_session: Session):
        """Test that database connection works"""
        result = db_session.execute(text("SELECT 1 as test"))
        assert result.fetchone()[0] == 1

    def test_database_is_test_database(self, db_session: Session):
        """Test that we're using the test database (or dev database in Docker)"""
        result = db_session.execute(text("SELECT current_database()"))
        db_name = result.fetchone()[0]
        # In Docker environment, we use foosball_dev for tests
        assert db_name in ["foosball_test", "foosball_dev"]

    def test_tables_exist(self, db_session: Session):
        """Test that required tables exist"""
        # Check if players table exists
        result = db_session.execute(
            text(
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'players')"
            )
        )
        assert result.fetchone()[0] is True

        # Note: alembic_version table only exists when using migrations
        # In tests, we use create_all() so it's normal that it doesn't exist


class TestPlayerCRUD:
    """Test Player model CRUD operations"""

    def test_create_player(self, clean_db: Session):
        """Test creating a player in the database"""
        player = Player(name="Test Player", email="test@example.com")

        clean_db.add(player)
        clean_db.commit()
        clean_db.refresh(player)

        assert player.id is not None
        assert player.name == "Test Player"
        assert player.email == "test@example.com"
        assert player.created_at is not None

    def test_read_player(self, clean_db: Session):
        """Test reading a player from the database"""
        # Create player
        player = Player(name="Read Test Player")
        clean_db.add(player)
        clean_db.commit()

        # Read player back
        found_player = (
            clean_db.query(Player).filter(Player.name == "Read Test Player").first()
        )

        assert found_player is not None
        assert found_player.name == "Read Test Player"
        assert found_player.id == player.id

    def test_update_player(self, clean_db: Session):
        """Test updating a player in the database"""
        # Create player
        player = Player(name="Update Test Player")
        clean_db.add(player)
        clean_db.commit()

        # Update player
        player.trueskill_mu = 30.0
        player.wins = 5
        player.games_played = 8
        clean_db.commit()

        # Verify update
        clean_db.refresh(player)
        assert player.trueskill_mu == 30.0
        assert player.wins == 5
        assert player.games_played == 8

    def test_delete_player(self, clean_db: Session):
        """Test deleting a player from the database"""
        # Create player
        player = Player(name="Delete Test Player")
        clean_db.add(player)
        clean_db.commit()
        player_id = player.id

        # Delete player
        clean_db.delete(player)
        clean_db.commit()

        # Verify deletion
        found_player = clean_db.query(Player).filter(Player.id == player_id).first()
        assert found_player is None

    def test_unique_constraints(self, clean_db: Session):
        """Test that unique constraints are enforced"""
        # Create first player
        player1 = Player(name="Unique Test Player", email="unique@example.com")
        clean_db.add(player1)
        clean_db.commit()

        # Try to create player with same name
        player2 = Player(name="Unique Test Player")
        clean_db.add(player2)

        with pytest.raises(Exception):  # Should raise integrity error
            clean_db.commit()

        clean_db.rollback()

        # Try to create player with same email
        player3 = Player(name="Different Name", email="unique@example.com")
        clean_db.add(player3)

        with pytest.raises(Exception):  # Should raise integrity error
            clean_db.commit()

    def test_multiple_players(self, clean_db: Session):
        """Test operations with multiple players"""
        # Create multiple players
        players = [
            Player(name="Player 1", trueskill_mu=20.0),
            Player(name="Player 2", trueskill_mu=30.0),
            Player(name="Player 3", trueskill_mu=25.0),
        ]

        for player in players:
            clean_db.add(player)
        clean_db.commit()

        # Query all players
        all_players = clean_db.query(Player).all()
        assert len(all_players) == 3

        # Query players by rating
        high_rated = clean_db.query(Player).filter(Player.trueskill_mu > 25.0).all()
        assert len(high_rated) == 1
        assert high_rated[0].name == "Player 2"

        # Order by rating
        ordered_players = (
            clean_db.query(Player).order_by(Player.trueskill_mu.desc()).all()
        )
        assert ordered_players[0].name == "Player 2"  # Highest rated
        assert ordered_players[-1].name == "Player 1"  # Lowest rated
