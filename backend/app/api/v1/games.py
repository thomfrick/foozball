# ABOUTME: Game management API endpoints for CRUD operations
# ABOUTME: Handles creating, reading, and managing foosball games

import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.game import Game
from app.models.player import Player
from app.schemas.game import GameCreate, GameListResponse, GameResponse

router = APIRouter(prefix="/games", tags=["games"])


@router.post("/", response_model=GameResponse, status_code=201)
async def create_game(game_data: GameCreate, db: Session = Depends(get_db)):
    """Record a new game"""
    try:
        # Validate that player1 and player2 are different
        if game_data.player1_id == game_data.player2_id:
            raise HTTPException(
                status_code=400, detail="Player 1 and Player 2 must be different"
            )

        # Validate that all players exist and are active
        player1 = (
            db.query(Player)
            .filter(Player.id == game_data.player1_id, Player.is_active)
            .first()
        )
        if not player1:
            raise HTTPException(
                status_code=404,
                detail=f"Player with ID {game_data.player1_id} not found or inactive",
            )

        player2 = (
            db.query(Player)
            .filter(Player.id == game_data.player2_id, Player.is_active)
            .first()
        )
        if not player2:
            raise HTTPException(
                status_code=404,
                detail=f"Player with ID {game_data.player2_id} not found or inactive",
            )

        # Validate that winner is one of the players
        if game_data.winner_id not in [game_data.player1_id, game_data.player2_id]:
            raise HTTPException(
                status_code=400, detail="Winner must be one of the players in the game"
            )

        # Create the game
        db_game = Game(
            player1_id=game_data.player1_id,
            player2_id=game_data.player2_id,
            winner_id=game_data.winner_id,
        )

        db.add(db_game)
        db.commit()
        db.refresh(db_game)

        # Load the game with relationships for the response
        game_with_players = (
            db.query(Game)
            .options(
                joinedload(Game.player1),
                joinedload(Game.player2),
                joinedload(Game.winner),
            )
            .filter(Game.id == db_game.id)
            .first()
        )

        return game_with_players

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create game: {str(e)}")


@router.get("/", response_model=GameListResponse)
async def list_games(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Number of games per page"),
    db: Session = Depends(get_db),
):
    """List all games with pagination"""
    try:
        # Build query with relationships
        query = db.query(Game).options(
            joinedload(Game.player1), joinedload(Game.player2), joinedload(Game.winner)
        )

        # Order by most recent games first
        query = query.order_by(Game.created_at.desc())

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (page - 1) * page_size
        games = query.offset(offset).limit(page_size).all()

        # Calculate pagination metadata
        total_pages = math.ceil(total / page_size)

        return GameListResponse(
            games=games,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve games: {str(e)}"
        )


@router.get("/{game_id}", response_model=GameResponse)
async def get_game(game_id: int, db: Session = Depends(get_db)):
    """Get a specific game by ID"""
    try:
        game = (
            db.query(Game)
            .options(
                joinedload(Game.player1),
                joinedload(Game.player2),
                joinedload(Game.winner),
            )
            .filter(Game.id == game_id)
            .first()
        )

        if not game:
            raise HTTPException(status_code=404, detail="Game not found")

        return game

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve game: {str(e)}"
        )
