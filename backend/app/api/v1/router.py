# ABOUTME: Main API v1 router that combines all endpoint routers
# ABOUTME: Central router registration for version 1 of the API

from fastapi import APIRouter

from app.api.v1.players import router as players_router

# Create the main v1 router
router = APIRouter(prefix="/api/v1")

# Include all sub-routers
router.include_router(players_router)
