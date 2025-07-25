# ABOUTME: FastAPI application entry point and configuration
# ABOUTME: Sets up the main app instance, middleware, and route registration

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import config
from app.db.database import get_db

app = FastAPI(
    title="Foosball ELO Tracker API",
    description="API for tracking foosball games and player ratings",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint returning basic API information"""
    return {
        "name": config.name,
        "version": config.version,
        "status": "healthy",
        "environment": config.environment
    }


@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy", 
        "service": "foosball-api",
        "version": config.version,
        "environment": config.environment
    }


@app.get("/ready")
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
            "checks": {
                "database": "healthy"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "error": str(e),
                "checks": {
                    "database": "unhealthy"
                }
            }
        )