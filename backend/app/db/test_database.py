# ABOUTME: Test database configuration and utilities
# ABOUTME: Handles test database creation, cleanup, and session management

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.test_config import test_config
from app.db.database import Base


class TestDatabase:
    """Test database manager for creating isolated test environments"""

    def __init__(self):
        self.config = test_config

        # Use connection pooling for tests
        self.engine = create_engine(
            self.config.database_url,
            poolclass=StaticPool,
            connect_args={"check_same_thread": False} if "sqlite" in self.config.database_url else {},
            echo=False,  # Reduce noise in tests
        )

        self.TestingSessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )

    def create_database(self):
        """Create test database if it doesn't exist"""
        # Connect to postgres database to create test database
        postgres_url = self.config.database_url.replace("foosball_test", "postgres")
        postgres_engine = create_engine(postgres_url)

        with postgres_engine.connect() as conn:
            # Set autocommit for database creation
            conn = conn.execution_options(autocommit=True)

            # Check if test database exists
            result = conn.execute(text(
                "SELECT 1 FROM pg_database WHERE datname = 'foosball_test'"
            ))

            if not result.fetchone():
                conn.execute(text("CREATE DATABASE foosball_test"))

        postgres_engine.dispose()

    def create_tables(self):
        """Create all tables in test database"""
        Base.metadata.create_all(bind=self.engine)

    def drop_tables(self):
        """Drop all tables in test database"""
        Base.metadata.drop_all(bind=self.engine)

    def get_session(self):
        """Get a test database session"""
        return self.TestingSessionLocal()

    def cleanup(self):
        """Clean up test database"""
        self.engine.dispose()


# Global test database instance
test_db = TestDatabase()
