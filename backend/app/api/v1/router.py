# ABOUTME: Main API v1 router that combines all endpoint routers
# ABOUTME: Central router registration for version 1 of the API

from fastapi import APIRouter

from app.api.v1.analytics import router as analytics_router
from app.api.v1.games import router as games_router
from app.api.v1.health import router as health_router
from app.api.v1.players import router as players_router
from app.api.v1.statistics import router as statistics_router
from app.api.v1.teamgames import router as teamgames_router
from app.api.v1.teams import router as teams_router

# Create the main v1 router
router = APIRouter(prefix="/api/v1")

# Include all sub-routers
router.include_router(analytics_router)
router.include_router(games_router)
router.include_router(health_router)
router.include_router(players_router)
router.include_router(statistics_router)
router.include_router(teams_router)
router.include_router(teamgames_router)
