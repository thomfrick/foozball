# ABOUTME: Team game management API endpoints for CRUD operations
# ABOUTME: Handles creating, reading, and managing foosball team games

import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.player import Player
from app.models.team import Team
from app.models.teamgame import TeamGame
from app.schemas.team import (
    TeamFormationRequest,
    TeamGameCreate,
    TeamGameListResponse,
    TeamGameResponse,
)
from app.services.trueskill_service import trueskill_service

router = APIRouter(prefix="/team-games", tags=["team-games"])


@router.post("/", response_model=TeamGameResponse, status_code=201)
async def create_team_game(game_data: TeamGameCreate, db: Session = Depends(get_db)):
    """Record a new team game"""
    try:
        # Validate that team1 and team2 are different
        if game_data.team1_id == game_data.team2_id:
            raise HTTPException(
                status_code=400, detail="Team 1 and Team 2 must be different"
            )

        # Validate that all teams exist and are active
        team1 = (
            db.query(Team)
            .filter(Team.id == game_data.team1_id, Team.is_active)
            .options(joinedload(Team.player1), joinedload(Team.player2))
            .first()
        )
        if not team1:
            raise HTTPException(
                status_code=404,
                detail=f"Team with ID {game_data.team1_id} not found or inactive",
            )

        team2 = (
            db.query(Team)
            .filter(Team.id == game_data.team2_id, Team.is_active)
            .options(joinedload(Team.player1), joinedload(Team.player2))
            .first()
        )
        if not team2:
            raise HTTPException(
                status_code=404,
                detail=f"Team with ID {game_data.team2_id} not found or inactive",
            )

        # Validate that winner is one of the teams
        if game_data.winner_team_id not in [game_data.team1_id, game_data.team2_id]:
            raise HTTPException(
                status_code=400,
                detail="Winner team must be one of the competing teams",
            )

        # Create the team game record
        new_game = TeamGame(
            team1_id=game_data.team1_id,
            team2_id=game_data.team2_id,
            winner_team_id=game_data.winner_team_id,
        )

        db.add(new_game)
        db.flush()  # Get the game ID without committing

        # Update team ratings using TrueSkill
        updated_team1, updated_team2 = trueskill_service.update_team_ratings(
            team1, team2, game_data.winner_team_id
        )

        # Update individual player ratings from team game
        (t1_players, t2_players) = trueskill_service.update_players_from_team_game(
            team1, team2, game_data.winner_team_id
        )

        # Commit all changes
        db.commit()
        db.refresh(new_game)

        return new_game

    except HTTPException:
        raise  # Re-raise HTTPExceptions as-is
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to create team game: {str(e)}"
        )


@router.post("/quick", response_model=TeamGameResponse, status_code=201)
async def create_team_game_from_players(
    game_data: TeamFormationRequest, db: Session = Depends(get_db)
):
    """Create a team game directly from 4 player IDs (auto-creates teams if needed)"""
    try:
        # Validate all players are different
        player_ids = [
            game_data.team1_player1_id,
            game_data.team1_player2_id,
            game_data.team2_player1_id,
            game_data.team2_player2_id,
        ]

        if len(set(player_ids)) != 4:
            raise HTTPException(
                status_code=400, detail="All four players must be different"
            )

        # Validate all players exist and are active
        players = {}
        for pid in player_ids:
            player = db.query(Player).filter(Player.id == pid, Player.is_active).first()
            if not player:
                raise HTTPException(
                    status_code=404,
                    detail=f"Player with ID {pid} not found or inactive",
                )
            players[pid] = player

        # Create or get team1
        team1_p1_id, team1_p2_id = Team.create_team_key(
            game_data.team1_player1_id, game_data.team1_player2_id
        )
        team1 = (
            db.query(Team)
            .filter(
                Team.player1_id == team1_p1_id,
                Team.player2_id == team1_p2_id,
                Team.is_active,
            )
            .options(joinedload(Team.player1), joinedload(Team.player2))
            .first()
        )

        if not team1:
            # Create new team1
            initial_mu, initial_sigma = trueskill_service.calculate_initial_team_rating(
                players[game_data.team1_player1_id], players[game_data.team1_player2_id]
            )
            team1 = Team(
                player1_id=team1_p1_id,
                player2_id=team1_p2_id,
                trueskill_mu=initial_mu,
                trueskill_sigma=initial_sigma,
            )
            db.add(team1)
            db.flush()

        # Create or get team2
        team2_p1_id, team2_p2_id = Team.create_team_key(
            game_data.team2_player1_id, game_data.team2_player2_id
        )
        team2 = (
            db.query(Team)
            .filter(
                Team.player1_id == team2_p1_id,
                Team.player2_id == team2_p2_id,
                Team.is_active,
            )
            .options(joinedload(Team.player1), joinedload(Team.player2))
            .first()
        )

        if not team2:
            # Create new team2
            initial_mu, initial_sigma = trueskill_service.calculate_initial_team_rating(
                players[game_data.team2_player1_id], players[game_data.team2_player2_id]
            )
            team2 = Team(
                player1_id=team2_p1_id,
                player2_id=team2_p2_id,
                trueskill_mu=initial_mu,
                trueskill_sigma=initial_sigma,
            )
            db.add(team2)
            db.flush()

        # Determine winner team ID
        winner_team_id = team1.id if game_data.winner_team == 1 else team2.id

        # Create the team game
        new_game = TeamGame(
            team1_id=team1.id,
            team2_id=team2.id,
            winner_team_id=winner_team_id,
        )

        db.add(new_game)
        db.flush()

        # Update team ratings
        updated_team1, updated_team2 = trueskill_service.update_team_ratings(
            team1, team2, winner_team_id
        )

        # Update individual player ratings
        (t1_players, t2_players) = trueskill_service.update_players_from_team_game(
            team1, team2, winner_team_id
        )

        # Commit all changes
        db.commit()
        db.refresh(new_game)

        return new_game

    except HTTPException:
        raise  # Re-raise HTTPExceptions as-is
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to create team game: {str(e)}"
        )


@router.get("/", response_model=TeamGameListResponse)
async def list_team_games(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Number of games per page"),
    team_id: int | None = Query(None, description="Filter by specific team ID"),
    db: Session = Depends(get_db),
):
    """Get paginated list of team games ordered by creation date (newest first)"""
    try:
        # Build query
        query = db.query(TeamGame)

        # Filter by team if specified
        if team_id:
            query = query.filter(
                (TeamGame.team1_id == team_id) | (TeamGame.team2_id == team_id)
            )

        # Order by creation date (newest first)
        query = query.order_by(TeamGame.created_at.desc())

        # Add eager loading for team relationships
        query = query.options(
            joinedload(TeamGame.team1).joinedload(Team.player1),
            joinedload(TeamGame.team1).joinedload(Team.player2),
            joinedload(TeamGame.team2).joinedload(Team.player1),
            joinedload(TeamGame.team2).joinedload(Team.player2),
            joinedload(TeamGame.winner_team).joinedload(Team.player1),
            joinedload(TeamGame.winner_team).joinedload(Team.player2),
        )

        # Calculate pagination
        total = query.count()
        total_pages = math.ceil(total / page_size)
        offset = (page - 1) * page_size

        # Get paginated results
        team_games = query.offset(offset).limit(page_size).all()

        return TeamGameListResponse(
            team_games=team_games,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve team games: {str(e)}"
        )


@router.get("/{game_id}", response_model=TeamGameResponse)
async def get_team_game(game_id: int, db: Session = Depends(get_db)):
    """Get a specific team game by ID"""
    try:
        team_game = (
            db.query(TeamGame)
            .filter(TeamGame.id == game_id)
            .options(
                joinedload(TeamGame.team1).joinedload(Team.player1),
                joinedload(TeamGame.team1).joinedload(Team.player2),
                joinedload(TeamGame.team2).joinedload(Team.player1),
                joinedload(TeamGame.team2).joinedload(Team.player2),
                joinedload(TeamGame.winner_team).joinedload(Team.player1),
                joinedload(TeamGame.winner_team).joinedload(Team.player2),
            )
            .first()
        )

        if not team_game:
            raise HTTPException(status_code=404, detail="Team game not found")

        return team_game

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve team game: {str(e)}"
        )
