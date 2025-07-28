# ABOUTME: FastAPI application entry point and configuration
# ABOUTME: Sets up the main app instance, middleware, and route registration

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, OperationalError

from app.api.v1.health import router as health_router
from app.api.v1.router import router as api_v1_router
from app.core.config import config

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

# Include health endpoints at root level for monitoring
app.include_router(health_router)


@app.get("/")
async def root():
    """Root endpoint returning basic API information"""
    return {
        "name": config.name,
        "version": config.version,
        "status": "healthy",
        "environment": config.environment,
    }
