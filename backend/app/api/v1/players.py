# ABOUTME: Player management API endpoints for CRUD operations
# ABOUTME: Handles creating, reading, updating, and deleting players

import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.player import Player
from app.schemas.player import (
    PlayerCreate,
    PlayerListResponse,
    PlayerResponse,
    PlayerUpdate,
)

router = APIRouter(prefix="/players", tags=["players"])


@router.post("/", response_model=PlayerResponse, status_code=201)
async def create_player(
    player_data: PlayerCreate,
    db: Session = Depends(get_db)
):
    """Create a new player"""
    try:
        # Create new player with default ratings
        db_player = Player(
            name=player_data.name,
            email=player_data.email,
            elo_rating=1500.0,  # Default ELO rating
            trueskill_mu=25.0,  # Default TrueSkill mu
            trueskill_sigma=8.3333,  # Default TrueSkill sigma
            games_played=0,
            wins=0,
            losses=0,
            is_active=True
        )

        db.add(db_player)
        db.commit()
        db.refresh(db_player)

        return db_player

    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
        if "players_name_key" in error_msg or "name" in error_msg:
            raise HTTPException(
                status_code=400,
                detail="A player with this name already exists"
            )
        elif "players_email_key" in error_msg or "email" in error_msg:
            raise HTTPException(
                status_code=400,
                detail="A player with this email already exists"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Failed to create player due to data conflict"
            )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create player: {str(e)}"
        )


@router.get("/", response_model=PlayerListResponse)
async def list_players(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Number of players per page"),
    active_only: bool = Query(True, description="Only return active players"),
    search: str | None = Query(None, description="Search by player name"),
    db: Session = Depends(get_db)
):
    """List all players with pagination and filtering"""
    try:
        # Build query
        query = db.query(Player)

        # Filter by active status
        if active_only:
            query = query.filter(Player.is_active)

        # Search by name
        if search:
            query = query.filter(Player.name.ilike(f"%{search}%"))

        # Order by ELO rating (highest first)
        query = query.order_by(Player.elo_rating.desc())

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (page - 1) * page_size
        players = query.offset(offset).limit(page_size).all()

        # Calculate pagination metadata
        total_pages = math.ceil(total / page_size)

        return PlayerListResponse(
            players=players,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve players: {str(e)}"
        )


@router.get("/{player_id}", response_model=PlayerResponse)
async def get_player(
    player_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific player by ID"""
    try:
        player = db.query(Player).filter(Player.id == player_id).first()

        if not player:
            raise HTTPException(
                status_code=404,
                detail="Player not found"
            )

        return player

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve player: {str(e)}"
        )


@router.put("/{player_id}", response_model=PlayerResponse)
async def update_player(
    player_id: int,
    player_data: PlayerUpdate,
    db: Session = Depends(get_db)
):
    """Update a player's information"""
    try:
        player = db.query(Player).filter(Player.id == player_id).first()

        if not player:
            raise HTTPException(
                status_code=404,
                detail="Player not found"
            )

        # Update only provided fields
        update_data = player_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(player, field, value)

        db.commit()
        db.refresh(player)

        return player

    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
        if "players_name_key" in error_msg or "name" in error_msg:
            raise HTTPException(
                status_code=400,
                detail="A player with this name already exists"
            )
        elif "players_email_key" in error_msg or "email" in error_msg:
            raise HTTPException(
                status_code=400,
                detail="A player with this email already exists"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Failed to update player due to data conflict"
            )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update player: {str(e)}"
        )


@router.delete("/{player_id}", status_code=204)
async def delete_player(
    player_id: int,
    db: Session = Depends(get_db)
):
    """Delete a player (soft delete by setting is_active=False)"""
    try:
        player = db.query(Player).filter(Player.id == player_id).first()

        if not player:
            raise HTTPException(
                status_code=404,
                detail="Player not found"
            )

        # Soft delete - set is_active to False
        player.is_active = False
        db.commit()

        return None

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete player: {str(e)}"
        )
