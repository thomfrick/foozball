# ABOUTME: Health and readiness check endpoints for monitoring
# ABOUTME: Provides basic health status and database connectivity checks

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import config
from app.db.database import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "service": "foosball-api",
        "version": config.version,
        "environment": config.environment,
    }


@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """Detailed readiness check including database connectivity"""
    try:
        # Test database connection
        db.execute(text("SELECT 1"))

        return {
            "status": "ready",
            "service": "foosball-api",
            "version": config.version,
            "environment": config.environment,
            "checks": {"database": "healthy"},
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "error": str(e),
                "checks": {"database": "unhealthy"},
            },
        )
