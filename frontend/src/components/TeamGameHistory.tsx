// ABOUTME: Component for displaying comprehensive team game history with filtering and pagination
// ABOUTME: Handles team game browsing, team filtering, and advanced game details

import { useEffect, useState } from 'react'
import { useTeamGames, useTeams } from '../hooks/useApi'
import type { TeamGame } from '../types/team'
import { LoadingSkeleton } from './LoadingSpinner'
import { OutlineButton, PrimaryButton } from './ui/Button'
import { TeamGameCard } from './ui/Card'

interface TeamGameHistoryProps {
  teamId?: number // If provided, shows games for specific team
  onGameSelect?: (game: TeamGame) => void
  limit?: number
}

export default function TeamGameHistory({
  teamId,
  onGameSelect,
  limit,
}: TeamGameHistoryProps) {
  const [page, setPage] = useState(1)
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(
    teamId
  )
  const pageSize = limit || 20

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [selectedTeamId])

  // Fetch team games with optional team filter
  const {
    data: teamGamesData,
    isLoading,
    error,
    refetch,
  } = useTeamGames({
    page,
    page_size: pageSize,
    team_id: selectedTeamId,
  })

  // Fetch teams for filter dropdown (only if not locked to specific team)
  const { data: teamsResponse } = useTeams({
    page: 1,
    page_size: 100,
  })

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleTeamFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedTeamId(value ? parseInt(value, 10) : undefined)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getGameResult = (game: TeamGame, forTeamId?: number) => {
    if (!forTeamId) {
      return `${game.winner_team.player1.name} & ${game.winner_team.player2.name} defeated ${
        game.winner_team.id === game.team1.id
          ? `${game.team2.player1.name} & ${game.team2.player2.name}`
          : `${game.team1.player1.name} & ${game.team1.player2.name}`
      }`
    }

    const isWinner = game.winner_team.id === forTeamId
    const opponent = game.team1.id === forTeamId ? game.team2 : game.team1

    return isWinner
      ? `Won vs ${opponent.player1.name} & ${opponent.player2.name}`
      : `Lost to ${opponent.player1.name} & ${opponent.player2.name}`
  }

  const getRatingChange = (game: TeamGame, forTeamId?: number) => {
    // This would need backend support to show before/after ratings
    // For now, simulate rating changes based on win/loss and team ratings
    if (!forTeamId) return { before: 0, after: 0, change: 0 }

    const isWinner = game.winner_team.id === forTeamId
    const team = game.team1.id === forTeamId ? game.team1 : game.team2
    const opponent = game.team1.id === forTeamId ? game.team2 : game.team1

    // Simulate rating change based on win/loss and opponent strength
    const ratingDiff = team.conservative_rating - opponent.conservative_rating
    const baseChange = isWinner ? 3.5 : -3.5
    const diffModifier = isWinner
      ? Math.max(0.5, 1 - ratingDiff / 50)
      : Math.min(-0.5, -1 + ratingDiff / 50)
    const estimatedChange = baseChange * diffModifier

    return {
      before: team.conservative_rating - estimatedChange,
      after: team.conservative_rating,
      change: estimatedChange,
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-6">
          Team Game History
        </h2>
        {!teamId && (
          <div className="mb-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
        )}
        <LoadingSkeleton rows={Math.min(pageSize, 8)} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">
            Team Game History
          </h2>
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400 mb-2">
              Failed to load team game history
            </p>
            <button
              onClick={() => refetch()}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const games = teamGamesData?.team_games || []
  const totalPages = teamGamesData?.total_pages || 1
  const teams = teamsResponse?.teams || []

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
          {selectedTeamId && !teamId
            ? 'Team Game History'
            : 'Team Game History'}
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {teamGamesData?.total || 0} team games total
        </span>
      </div>

      {/* Filters - only show if not locked to specific team */}
      {!teamId && (
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1 max-w-xs">
              <label
                htmlFor="teamFilter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Filter by Team
              </label>
              <select
                id="teamFilter"
                value={selectedTeamId || ''}
                onChange={handleTeamFilter}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-background dark:text-dark-text"
              >
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.player1.name} & {team.player2.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Games List */}
      {games.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
            No team games found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {selectedTeamId
              ? "This team hasn't played any games yet."
              : 'No team games have been recorded yet.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <PrimaryButton
              onClick={() => (window.location.href = '/team-games')}
            >
              Record Team Game
            </PrimaryButton>
            {selectedTeamId && (
              <OutlineButton onClick={() => setSelectedTeamId(undefined)}>
                View All Teams
              </OutlineButton>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <div key={game.id} className="group">
              <TeamGameCard
                teamGame={game}
                onClick={onGameSelect ? () => onGameSelect(game) : undefined}
                className={onGameSelect ? 'cursor-pointer' : ''}
              />

              {/* Additional game details */}
              <div className="mt-2 px-4 text-xs text-gray-500 dark:text-gray-400 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="font-medium">Date:</span>{' '}
                  {formatDate(game.created_at)}
                </div>
                <div>
                  <span className="font-medium">Game ID:</span> #{game.id}
                </div>
                <div>
                  <span className="font-medium">Result:</span>{' '}
                  {getGameResult(game, selectedTeamId)}
                </div>
                {selectedTeamId &&
                  (() => {
                    const ratingChange = getRatingChange(game, selectedTeamId)
                    return (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Rating:</span>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-gray-500">
                            {ratingChange.before.toFixed(1)}
                          </span>
                          <span
                            className={`font-bold ${ratingChange.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                          >
                            {ratingChange.change >= 0 ? '↗' : '↘'}
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {ratingChange.after.toFixed(1)}
                          </span>
                          <span
                            className={`font-medium ${ratingChange.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                          >
                            ({ratingChange.change >= 0 ? '+' : ''}
                            {ratingChange.change.toFixed(1)})
                          </span>
                        </div>
                      </div>
                    )
                  })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-dark-border">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing page {page} of {totalPages}
          </div>

          <div className="flex items-center space-x-3">
            <OutlineButton
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              size="sm"
            >
              Previous
            </OutlineButton>

            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              {page} / {totalPages}
            </span>

            <PrimaryButton
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              size="sm"
            >
              Next
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Results summary */}
      {games.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Showing {games.length} of {teamGamesData?.total || 0} team games
            {selectedTeamId && <span className="ml-2">• Filtered by team</span>}
          </div>
        </div>
      )}
    </div>
  )
}
