# ABOUTME: Enhanced statistics API endpoints
# ABOUTME: Provides comprehensive player statistics, head-to-head records, and performance analysis

from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, desc, func, or_
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.game import Game
from app.models.player import Player
from app.models.rating_history import RatingHistory
from app.schemas.statistics import (
    EnhancedLeaderboardResponse,
    GameForm,
    HeadToHeadRecord,
    HeadToHeadResponse,
    LeaderboardEntry,
    PerformanceTrend,
    PlayerStatistics,
    RecentForm,
    StatisticsSummary,
)

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("/summary", response_model=StatisticsSummary)
async def get_statistics_summary(db: Session = Depends(get_db)):
    """Get overall statistics summary for the application"""
    try:
        now = datetime.now(UTC)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)
        month_start = now - timedelta(days=30)

        # Basic counts
        total_players = db.query(Player).count()
        active_players = db.query(Player).filter(Player.is_active).count()
        total_games = db.query(Game).count()

        games_today = db.query(Game).filter(Game.created_at >= today_start).count()
        games_this_week = db.query(Game).filter(Game.created_at >= week_start).count()
        games_this_month = db.query(Game).filter(Game.created_at >= month_start).count()

        # Top performers
        top_rated = (
            db.query(Player)
            .filter(Player.is_active, Player.games_played >= 5)
            .order_by(desc(Player.trueskill_mu - 3 * Player.trueskill_sigma))
            .first()
        )

        most_active = (
            db.query(Player)
            .filter(Player.is_active)
            .order_by(desc(Player.games_played))
            .first()
        )

        best_win_rate = (
            db.query(Player)
            .filter(Player.is_active, Player.games_played >= 10)
            .order_by(desc(Player.wins / Player.games_played))
            .first()
        )

        # System averages
        avg_games_per_player = total_games / max(total_players, 1)
        avg_rating = (
            db.query(func.avg(Player.trueskill_mu - 3 * Player.trueskill_sigma))
            .filter(Player.is_active)
            .scalar()
            or 0.0
        )

        # Most common matchup
        most_common_matchup_query = (
            db.query(
                func.least(Game.player1_id, Game.player2_id).label("p1"),
                func.greatest(Game.player1_id, Game.player2_id).label("p2"),
                func.count().label("count"),
            )
            .group_by(
                func.least(Game.player1_id, Game.player2_id),
                func.greatest(Game.player1_id, Game.player2_id),
            )
            .order_by(desc(func.count()))
            .first()
        )

        most_common_matchup = None
        if most_common_matchup_query:
            p1 = (
                db.query(Player)
                .filter(Player.id == most_common_matchup_query.p1)
                .first()
            )
            p2 = (
                db.query(Player)
                .filter(Player.id == most_common_matchup_query.p2)
                .first()
            )
            if p1 and p2:
                most_common_matchup = (
                    f"{p1.name} vs {p2.name} ({most_common_matchup_query.count} games)"
                )

        def _player_to_leaderboard_entry(
            player: Player, rank: int = 1
        ) -> LeaderboardEntry | None:
            if not player:
                return None

            # Get recent form (last 5 games)
            recent_games = (
                db.query(Game)
                .filter(or_(Game.player1_id == player.id, Game.player2_id == player.id))
                .order_by(desc(Game.created_at))
                .limit(5)
                .all()
            )

            recent_form = ""
            for game in recent_games:
                if game.winner_id == player.id:
                    recent_form += "W"
                else:
                    recent_form += "L"

            # Get last game date
            last_game = (
                db.query(Game)
                .filter(or_(Game.player1_id == player.id, Game.player2_id == player.id))
                .order_by(desc(Game.created_at))
                .first()
            )

            # Count games this week
            games_this_week_count = (
                db.query(Game)
                .filter(
                    or_(Game.player1_id == player.id, Game.player2_id == player.id),
                    Game.created_at >= week_start,
                )
                .count()
            )

            return LeaderboardEntry(
                rank=rank,
                player_id=player.id,
                player_name=player.name,
                games_played=player.games_played,
                wins=player.wins,
                losses=player.losses,
                win_percentage=player.win_percentage,
                conservative_rating=player.trueskill_mu - 3 * player.trueskill_sigma,
                trueskill_mu=player.trueskill_mu,
                trueskill_sigma=player.trueskill_sigma,
                recent_form=recent_form,
                trend_7d="stable",  # Simplified for now
                rating_change_7d=0.0,  # Simplified for now
                last_game_date=last_game.created_at if last_game else None,
                games_this_week=games_this_week_count,
            )

        return StatisticsSummary(
            total_players=total_players,
            active_players=active_players,
            total_games=total_games,
            games_today=games_today,
            games_this_week=games_this_week,
            games_this_month=games_this_month,
            highest_rated_player=_player_to_leaderboard_entry(top_rated),
            most_active_player=_player_to_leaderboard_entry(most_active),
            best_win_rate_player=_player_to_leaderboard_entry(best_win_rate),
            avg_games_per_player=round(avg_games_per_player, 2),
            avg_rating=round(avg_rating, 2),
            most_common_matchup=most_common_matchup,
            last_updated=now,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve statistics summary: {str(e)}"
        )


@router.get("/players/{player_id}", response_model=PlayerStatistics)
async def get_player_statistics(player_id: int, db: Session = Depends(get_db)):
    """Get comprehensive statistics for a specific player"""
    try:
        player = db.query(Player).filter(Player.id == player_id).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")

        now = datetime.now(UTC)

        # Get all games for this player
        all_games = (
            db.query(Game)
            .options(
                joinedload(Game.player1),
                joinedload(Game.player2),
                joinedload(Game.winner),
            )
            .filter(or_(Game.player1_id == player_id, Game.player2_id == player_id))
            .order_by(desc(Game.created_at))
            .all()
        )

        # Calculate basic stats
        total_games = len(all_games)
        wins = len([g for g in all_games if g.winner_id == player_id])
        losses = total_games - wins
        win_percentage = (wins / total_games * 100) if total_games > 0 else 0.0

        # Get rating history for trends
        rating_history = (
            db.query(RatingHistory)
            .filter(RatingHistory.player_id == player_id)
            .order_by(RatingHistory.created_at)
            .all()
        )

        # Find peak rating
        peak_rating = player.trueskill_mu - 3 * player.trueskill_sigma
        peak_rating_date = None
        if rating_history:
            peak_entry = max(rating_history, key=lambda r: r.conservative_rating_after)
            peak_rating = peak_entry.conservative_rating_after
            peak_rating_date = peak_entry.created_at

        # Calculate current streak
        current_streak = "No games played"
        if all_games:
            streak_count = 0
            streak_type = "W" if all_games[0].winner_id == player_id else "L"

            for game in all_games:
                if (game.winner_id == player_id and streak_type == "W") or (
                    game.winner_id != player_id and streak_type == "L"
                ):
                    streak_count += 1
                else:
                    break

            streak_word = "win" if streak_type == "W" else "loss"
            current_streak = f"{streak_count} game {streak_word} streak"

        # Calculate longest streaks
        longest_win_streak = 0
        longest_loss_streak = 0
        current_win_streak = 0
        current_loss_streak = 0

        for game in reversed(all_games):  # Process chronologically
            if game.winner_id == player_id:
                current_win_streak += 1
                current_loss_streak = 0
                longest_win_streak = max(longest_win_streak, current_win_streak)
            else:
                current_loss_streak += 1
                current_win_streak = 0
                longest_loss_streak = max(longest_loss_streak, current_loss_streak)

        # Performance trends
        def _calculate_trend(days: int, period_name: str) -> PerformanceTrend:
            cutoff_date = (
                now - timedelta(days=days)
                if days > 0
                else datetime(1900, 1, 1, tzinfo=UTC)
            )
            period_games = [g for g in all_games if g.created_at >= cutoff_date]

            games_played = len(period_games)
            period_wins = len([g for g in period_games if g.winner_id == player_id])
            period_losses = games_played - period_wins
            period_win_percentage = (
                (period_wins / games_played * 100) if games_played > 0 else 0.0
            )

            # Get rating from this period
            period_rating_history = [
                r for r in rating_history if r.created_at >= cutoff_date
            ]
            avg_rating = 0.0
            rating_change = 0.0

            if period_rating_history:
                avg_rating = sum(
                    r.conservative_rating_after for r in period_rating_history
                ) / len(period_rating_history)
                if len(period_rating_history) >= 2:
                    rating_change = (
                        period_rating_history[-1].conservative_rating_after
                        - period_rating_history[0].conservative_rating_before
                    )

            # Determine trend direction
            trend_direction = "stable"
            if rating_change > 2.0:
                trend_direction = "up"
            elif rating_change < -2.0:
                trend_direction = "down"

            return PerformanceTrend(
                period=period_name,
                games_played=games_played,
                wins=period_wins,
                losses=period_losses,
                win_percentage=round(period_win_percentage, 2),
                avg_rating=round(avg_rating, 2),
                rating_change=round(rating_change, 2),
                trend_direction=trend_direction,
            )

        performance_trends = [
            _calculate_trend(7, "7d"),
            _calculate_trend(30, "30d"),
            _calculate_trend(90, "90d"),
            _calculate_trend(0, "all"),  # All time
        ]

        # Recent form (last 10 games)
        recent_games = all_games[:10]
        recent_form_games = []

        for game in recent_games:
            opponent = game.player1 if game.player1_id != player_id else game.player2
            result = "W" if game.winner_id == player_id else "L"

            # Get rating change from this game
            rating_entry = next(
                (r for r in rating_history if r.game_id == game.id), None
            )

            rating_change = 0.0
            conservative_rating_change = 0.0
            if rating_entry:
                rating_change = (
                    rating_entry.trueskill_mu_after - rating_entry.trueskill_mu_before
                )
                conservative_rating_change = (
                    rating_entry.conservative_rating_after
                    - rating_entry.conservative_rating_before
                )

            recent_form_games.append(
                GameForm(
                    game_id=game.id,
                    date=game.created_at,
                    opponent_id=opponent.id,
                    opponent_name=opponent.name,
                    result=result,
                    rating_change=round(rating_change, 3),
                    conservative_rating_change=round(conservative_rating_change, 3),
                )
            )

        # Create form string and analyze trend
        form_string = "".join([g.result for g in recent_form_games])

        # Analyze form trend (last 5 vs previous 5)
        form_trend = "stable"
        if len(recent_form_games) >= 10:
            recent_5 = recent_form_games[:5]
            previous_5 = recent_form_games[5:10]

            recent_wins = len([g for g in recent_5 if g.result == "W"])
            previous_wins = len([g for g in previous_5 if g.result == "W"])

            if recent_wins > previous_wins:
                form_trend = "improving"
            elif recent_wins < previous_wins:
                form_trend = "declining"

        recent_form = RecentForm(
            player_id=player_id,
            player_name=player.name,
            games_analyzed=len(recent_form_games),
            wins=len([g for g in recent_form_games if g.result == "W"]),
            losses=len([g for g in recent_form_games if g.result == "L"]),
            win_percentage=round(
                len([g for g in recent_form_games if g.result == "W"])
                / max(len(recent_form_games), 1)
                * 100,
                2,
            ),
            avg_rating_change=round(
                sum(g.conservative_rating_change for g in recent_form_games)
                / max(len(recent_form_games), 1),
                3,
            ),
            current_form=form_string,
            form_trend=form_trend,
            games=recent_form_games,
        )

        # Activity stats
        first_game_date = all_games[-1].created_at if all_games else None
        last_game_date = all_games[0].created_at if all_games else None

        week_start = now - timedelta(days=7)
        month_start = now - timedelta(days=30)

        games_this_week = len([g for g in all_games if g.created_at >= week_start])
        games_this_month = len([g for g in all_games if g.created_at >= month_start])

        return PlayerStatistics(
            player_id=player_id,
            player_name=player.name,
            total_games=total_games,
            wins=wins,
            losses=losses,
            win_percentage=round(win_percentage, 2),
            current_mu=round(player.trueskill_mu, 3),
            current_sigma=round(player.trueskill_sigma, 3),
            conservative_rating=round(
                player.trueskill_mu - 3 * player.trueskill_sigma, 2
            ),
            peak_rating=round(peak_rating, 2),
            peak_rating_date=peak_rating_date,
            current_streak=current_streak,
            longest_win_streak=longest_win_streak,
            longest_loss_streak=longest_loss_streak,
            performance_trends=performance_trends,
            recent_form=recent_form,
            first_game_date=first_game_date,
            last_game_date=last_game_date,
            games_this_week=games_this_week,
            games_this_month=games_this_month,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve player statistics: {str(e)}"
        )


@router.get(
    "/head-to-head/{player1_id}/{player2_id}", response_model=HeadToHeadResponse
)
async def get_head_to_head_statistics(
    player1_id: int, player2_id: int, db: Session = Depends(get_db)
):
    """Get head-to-head statistics between two players"""
    try:
        # Verify both players exist
        player1 = db.query(Player).filter(Player.id == player1_id).first()
        player2 = db.query(Player).filter(Player.id == player2_id).first()

        if not player1:
            raise HTTPException(
                status_code=404, detail=f"Player with ID {player1_id} not found"
            )
        if not player2:
            raise HTTPException(
                status_code=404, detail=f"Player with ID {player2_id} not found"
            )

        if player1_id == player2_id:
            raise HTTPException(
                status_code=400, detail="Cannot compare player with themselves"
            )

        # Get all games between these players
        head_to_head_games = (
            db.query(Game)
            .options(
                joinedload(Game.player1),
                joinedload(Game.player2),
                joinedload(Game.winner),
            )
            .filter(
                or_(
                    and_(Game.player1_id == player1_id, Game.player2_id == player2_id),
                    and_(Game.player1_id == player2_id, Game.player2_id == player1_id),
                )
            )
            .order_by(desc(Game.created_at))
            .all()
        )

        total_games = len(head_to_head_games)
        player1_wins = len([g for g in head_to_head_games if g.winner_id == player1_id])
        player2_wins = total_games - player1_wins

        player1_win_percentage = (
            (player1_wins / total_games * 100) if total_games > 0 else 0.0
        )
        player2_win_percentage = (
            (player2_wins / total_games * 100) if total_games > 0 else 0.0
        )

        # Find current streak
        current_streak = None
        if head_to_head_games:
            streak_count = 0
            streak_winner_id = head_to_head_games[0].winner_id
            streak_player_name = (
                player1.name if streak_winner_id == player1_id else player2.name
            )

            for game in head_to_head_games:
                if game.winner_id == streak_winner_id:
                    streak_count += 1
                else:
                    break

            current_streak = f"{streak_player_name} - {streak_count} game win streak"

        # Last game date
        last_game_date = (
            head_to_head_games[0].created_at if head_to_head_games else None
        )

        head_to_head_record = HeadToHeadRecord(
            player1_id=player1_id,
            player1_name=player1.name,
            player2_id=player2_id,
            player2_name=player2.name,
            total_games=total_games,
            player1_wins=player1_wins,
            player2_wins=player2_wins,
            player1_win_percentage=round(player1_win_percentage, 2),
            player2_win_percentage=round(player2_win_percentage, 2),
            last_game_date=last_game_date,
            current_streak=current_streak,
        )

        # Get recent games (last 10)
        recent_games = head_to_head_games[:10]
        recent_game_forms = []

        for game in recent_games:
            # From player1's perspective
            opponent_id = player2_id
            opponent_name = player2.name
            result = "W" if game.winner_id == player1_id else "L"

            recent_game_forms.append(
                GameForm(
                    game_id=game.id,
                    date=game.created_at,
                    opponent_id=opponent_id,
                    opponent_name=opponent_name,
                    result=result,
                    rating_change=0.0,  # Simplified for now
                    conservative_rating_change=0.0,  # Simplified for now
                )
            )

        return HeadToHeadResponse(
            head_to_head=head_to_head_record, recent_games=recent_game_forms
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve head-to-head statistics: {str(e)}",
        )


@router.get("/leaderboard", response_model=EnhancedLeaderboardResponse)
async def get_enhanced_leaderboard(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Number of players per page"),
    min_games: int = Query(0, ge=0, description="Minimum games played filter"),
    sort_by: str = Query(
        "rating", description="Sort by: rating, wins, games, win_rate"
    ),
    db: Session = Depends(get_db),
):
    """Get enhanced leaderboard with comprehensive statistics"""
    try:
        now = datetime.now(UTC)
        week_start = now - timedelta(days=7)

        # Build base query
        query = db.query(Player).filter(Player.is_active)

        if min_games > 0:
            query = query.filter(Player.games_played >= min_games)

        # Apply sorting
        if sort_by == "rating":
            query = query.order_by(
                desc(Player.trueskill_mu - 3 * Player.trueskill_sigma)
            )
        elif sort_by == "wins":
            query = query.order_by(desc(Player.wins))
        elif sort_by == "games":
            query = query.order_by(desc(Player.games_played))
        elif sort_by == "win_rate":
            query = query.order_by(
                desc(Player.wins / func.greatest(Player.games_played, 1))
            )
        else:
            query = query.order_by(
                desc(Player.trueskill_mu - 3 * Player.trueskill_sigma)
            )

        # Get total count
        query.count()

        # Apply pagination
        offset = (page - 1) * page_size
        players = query.offset(offset).limit(page_size).all()

        # Convert to leaderboard entries
        leaderboard_entries = []
        for rank, player in enumerate(players, start=offset + 1):
            # Get recent form (last 5 games)
            recent_games = (
                db.query(Game)
                .filter(or_(Game.player1_id == player.id, Game.player2_id == player.id))
                .order_by(desc(Game.created_at))
                .limit(5)
                .all()
            )

            recent_form = ""
            for game in recent_games:
                if game.winner_id == player.id:
                    recent_form += "W"
                else:
                    recent_form += "L"

            # Get last game date
            last_game = (
                db.query(Game)
                .filter(or_(Game.player1_id == player.id, Game.player2_id == player.id))
                .order_by(desc(Game.created_at))
                .first()
            )

            # Count games this week
            games_this_week_count = (
                db.query(Game)
                .filter(
                    or_(Game.player1_id == player.id, Game.player2_id == player.id),
                    Game.created_at >= week_start,
                )
                .count()
            )

            leaderboard_entries.append(
                LeaderboardEntry(
                    rank=rank,
                    player_id=player.id,
                    player_name=player.name,
                    games_played=player.games_played,
                    wins=player.wins,
                    losses=player.losses,
                    win_percentage=round(player.win_percentage, 2),
                    conservative_rating=round(
                        player.trueskill_mu - 3 * player.trueskill_sigma, 2
                    ),
                    trueskill_mu=round(player.trueskill_mu, 3),
                    trueskill_sigma=round(player.trueskill_sigma, 3),
                    recent_form=recent_form,
                    trend_7d="stable",  # Simplified for now
                    rating_change_7d=0.0,  # Simplified for now
                    last_game_date=last_game.created_at if last_game else None,
                    games_this_week=games_this_week_count,
                )
            )

        # Calculate summary stats
        total_players = db.query(Player).count()
        active_players = db.query(Player).filter(Player.is_active).count()
        total_games = db.query(Game).count()

        return EnhancedLeaderboardResponse(
            leaderboard=leaderboard_entries,
            total_players=total_players,
            active_players=active_players,
            total_games=total_games,
            last_updated=now,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve enhanced leaderboard: {str(e)}"
        )
