# ABOUTME: Database configuration and session management
# ABOUTME: Contains SQLAlchemy setup, database connections, and utilities

# Import all models so they are registered with SQLAlchemy
from app.models import *  # noqa: F401, F403

from .database import Base, SessionLocal, engine, get_db

__all__ = ["Base", "engine", "SessionLocal", "get_db"]
