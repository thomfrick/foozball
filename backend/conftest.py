# ABOUTME: Pytest configuration and global fixtures
# ABOUTME: Sets up test database, sessions, and common test utilities

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.test_database import test_db
from app.db.database import get_db


def override_get_db():
    """Override database dependency for tests"""
    try:
        db = test_db.get_session()
        yield db
    finally:
        db.close()


# Override the database dependency
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Set up test database for the entire test session"""
    # Create test database
    test_db.create_database()
    
    # Create tables
    test_db.create_tables()
    
    yield
    
    # Cleanup after all tests
    test_db.cleanup()


@pytest.fixture(scope="function")
def db_session():
    """Get a fresh database session for each test"""
    session = test_db.get_session()
    
    yield session
    
    # Rollback any changes made during the test
    session.rollback()
    session.close()


@pytest.fixture(scope="function")
def client():
    """Get a test client for FastAPI app"""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="function")
def clean_db(db_session):
    """Clean database before each test"""
    # Delete all data from tables (but keep tables)
    from app.db.database import Base
    
    for table in reversed(Base.metadata.sorted_tables):
        db_session.execute(table.delete())
    db_session.commit()
    
    yield db_session