# ABOUTME: FastAPI application entry point and configuration
# ABOUTME: Sets up the main app instance, middleware, and route registration

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.orm import Session

from app.api.v1.router import router as api_v1_router
from app.core.config import config
from app.db.database import get_db

app = FastAPI(
    title="Foosball TrueSkill Tracker API",
    description="API for tracking foosball games and player ratings",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# Global exception handlers
@app.exception_handler(OperationalError)
async def operational_error_handler(request: Request, exc: OperationalError):
    """Handle database operational errors"""
    return JSONResponse(
        status_code=500, content={"detail": f"Database operation failed: {str(exc)}"}
    )


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    """Handle database integrity constraint errors"""
    return JSONResponse(
        status_code=400, content={"detail": f"Data integrity error: {str(exc)}"}
    )


# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(api_v1_router)


@app.get("/")
async def root():
    """Root endpoint returning basic API information"""
    return {
        "name": config.name,
        "version": config.version,
        "status": "healthy",
        "environment": config.environment,
    }


@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "service": "foosball-api",
        "version": config.version,
        "environment": config.environment,
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
