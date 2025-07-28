# ABOUTME: Team management API endpoints for CRUD operations
# ABOUTME: Handles creating, reading, and managing foosball teams

import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.player import Player
from app.models.team import Team
from app.schemas.team import TeamCreate, TeamListResponse, TeamResponse
from app.services.trueskill_service import trueskill_service

router = APIRouter(prefix="/teams", tags=["teams"])


@router.post("/", response_model=TeamResponse, status_code=201)
async def create_or_get_team(team_data: TeamCreate, db: Session = Depends(get_db)):
    """Create a new team or return existing team for the player pair"""
    try:
        # Validate that player1 and player2 are different
        if team_data.player1_id == team_data.player2_id:
            raise HTTPException(status_code=400, detail="Players must be different")

        # Validate that both players exist and are active
        player1 = (
            db.query(Player)
            .filter(Player.id == team_data.player1_id, Player.is_active)
            .first()
        )
        if not player1:
            raise HTTPException(
                status_code=404,
                detail=f"Player with ID {team_data.player1_id} not found or inactive",
            )

        player2 = (
            db.query(Player)
            .filter(Player.id == team_data.player2_id, Player.is_active)
            .first()
        )
        if not player2:
            raise HTTPException(
                status_code=404,
                detail=f"Player with ID {team_data.player2_id} not found or inactive",
            )

        # Create ordered team key to ensure consistent team identification
        player1_id, player2_id = Team.create_team_key(
            team_data.player1_id, team_data.player2_id
        )

        # Check if team already exists
        existing_team = (
            db.query(Team)
            .filter(
                Team.player1_id == player1_id,
                Team.player2_id == player2_id,
                Team.is_active,
            )
            .options(joinedload(Team.player1), joinedload(Team.player2))
            .first()
        )

        if existing_team:
            return existing_team

        # Create new team
        # Calculate initial team rating based on individual player ratings
        initial_mu, initial_sigma = trueskill_service.calculate_initial_team_rating(
            player1, player2
        )

        new_team = Team(
            player1_id=player1_id,
            player2_id=player2_id,
            trueskill_mu=initial_mu,
            trueskill_sigma=initial_sigma,
        )

        db.add(new_team)
        db.commit()
        db.refresh(new_team)

        # Load relationships for response
        db.refresh(new_team)
        return new_team

    except HTTPException:
        raise  # Re-raise HTTPExceptions as-is
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create team: {str(e)}")


@router.get("/", response_model=TeamListResponse)
async def list_teams(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Number of teams per page"),
    active_only: bool = Query(True, description="Only return active teams"),
    db: Session = Depends(get_db),
):
    """Get paginated list of teams ordered by rating"""
    try:
        # Build query with filters
        query = db.query(Team)

        if active_only:
            query = query.filter(Team.is_active)

        # Order by conservative rating (descending)
        query = query.order_by((Team.trueskill_mu - 3 * Team.trueskill_sigma).desc())

        # Add eager loading for player relationships
        query = query.options(joinedload(Team.player1), joinedload(Team.player2))

        # Calculate pagination
        total = query.count()
        total_pages = math.ceil(total / page_size)
        offset = (page - 1) * page_size

        # Get paginated results
        teams = query.offset(offset).limit(page_size).all()

        return TeamListResponse(
            teams=teams,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve teams: {str(e)}"
        )


@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(team_id: int, db: Session = Depends(get_db)):
    """Get a specific team by ID"""
    try:
        team = (
            db.query(Team)
            .filter(Team.id == team_id)
            .options(joinedload(Team.player1), joinedload(Team.player2))
            .first()
        )

        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

        return team

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve team: {str(e)}"
        )


@router.delete("/{team_id}", status_code=204)
async def delete_team(team_id: int, db: Session = Depends(get_db)):
    """Soft delete a team (mark as inactive)"""
    try:
        team = db.query(Team).filter(Team.id == team_id).first()

        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

        if not team.is_active:
            raise HTTPException(status_code=400, detail="Team is already inactive")

        # Soft delete by marking as inactive
        team.is_active = False
        db.commit()

        return None

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete team: {str(e)}")


@router.get("/search/by-players")
async def find_team_by_players(
    player1_id: int = Query(..., description="First player ID"),
    player2_id: int = Query(..., description="Second player ID"),
    db: Session = Depends(get_db),
):
    """Find a team by player IDs (order independent)"""
    try:
        # Create ordered team key
        p1_id, p2_id = Team.create_team_key(player1_id, player2_id)

        team = (
            db.query(Team)
            .filter(
                Team.player1_id == p1_id,
                Team.player2_id == p2_id,
                Team.is_active,
            )
            .options(joinedload(Team.player1), joinedload(Team.player2))
            .first()
        )

        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

        return team

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to find team: {str(e)}")
