# ABOUTME: Analytics and data visualization API endpoints
# ABOUTME: Provides endpoints for charts, comparisons, and statistics

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.player import Player
from app.models.rating_history import RatingHistory
from app.schemas.rating_history import (
    MultiPlayerRatingProgression,
    PlayerRatingProgression,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/multi-player-progression", response_model=MultiPlayerRatingProgression)
async def get_multi_player_rating_progression(
    player_ids: str = Query(..., description="Comma-separated player IDs"),
    limit: int = Query(
        100, ge=1, le=500, description="Maximum number of rating entries per player"
    ),
    db: Session = Depends(get_db),
):
    """Get rating progression data for multiple players for comparison charts"""
    try:
        # Parse player IDs
        try:
            player_id_list = [int(pid.strip()) for pid in player_ids.split(",")]
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid player IDs format. Use comma-separated integers.",
            )

        if len(player_id_list) > 10:
            raise HTTPException(
                status_code=400, detail="Maximum 10 players allowed for comparison"
            )

        players_data = []
        total_games_count = 0

        for player_id in player_id_list:
            # Check if player exists
            player = db.query(Player).filter(Player.id == player_id).first()
            if not player:
                raise HTTPException(
                    status_code=404, detail=f"Player with ID {player_id} not found"
                )

            # Get rating history ordered by creation time
            rating_history = (
                db.query(RatingHistory)
                .filter(RatingHistory.player_id == player_id)
                .order_by(RatingHistory.created_at.asc())
                .limit(limit)
                .all()
            )

            players_data.append(
                PlayerRatingProgression(
                    player_id=player.id,
                    player_name=player.name,
                    ratings=rating_history,
                )
            )

            total_games_count += len(rating_history)

        return MultiPlayerRatingProgression(
            players=players_data,
            total_games=total_games_count,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve multi-player rating progression: {str(e)}",
        )
