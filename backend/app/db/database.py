# ABOUTME: SQLAlchemy database configuration and session management
# ABOUTME: Sets up engine, sessions, and database connection utilities

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import config

# Create database engine
engine = create_engine(
    config.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=config.debug,
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


def get_db():
    """
    Dependency function to get database session.
    Yields a database session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
