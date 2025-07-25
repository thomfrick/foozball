# ABOUTME: Database configuration and session management
# ABOUTME: Contains SQLAlchemy setup, database connections, and utilities

from .database import Base, engine, SessionLocal, get_db

# Import all models so they are registered with SQLAlchemy
from app.models import *  # noqa: F401, F403

__all__ = ["Base", "engine", "SessionLocal", "get_db"]