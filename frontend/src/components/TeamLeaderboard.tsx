// ABOUTME: Team leaderboard component displaying teams ranked by TrueSkill rating
// ABOUTME: Shows team rankings with TrueSkill mu, sigma, conservative rating, and team composition

import { useState } from 'react'
import { useTeams } from '../hooks/useApi'
import { LoadingSkeleton } from './LoadingSpinner'
import { OutlineButton, PrimaryButton } from './ui/Button'

interface TeamLeaderboardProps {
  limit?: number
  showRankings?: boolean
  showPagination?: boolean
}

export default function TeamLeaderboard({
  limit = 10,
  showRankings = true,
  showPagination = true,
}: TeamLeaderboardProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = showPagination ? limit : 100

  const {
    data: teamsData,
    isLoading,
    error,
  } = useTeams({
    page: currentPage,
    page_size: pageSize,
  })

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-4">
          Team Leaderboard
        </h2>
        <LoadingSkeleton rows={Math.min(limit, 5)} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-4">
          Team Leaderboard
        </h2>
        <div className="text-red-600 text-center py-4">
          Failed to load team leaderboard. Please try again.
        </div>
      </div>
    )
  }

  if (!teamsData?.teams?.length) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-4">
          Team Leaderboard
        </h2>
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          No teams found. Record team games to see the leaderboard!
        </div>
      </div>
    )
  }

  // Teams come pre-sorted by conservative rating from backend
  const teams = teamsData.teams

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${rank}`
    }
  }

  const getCertaintyLevel = (sigma: number) => {
    if (sigma > 6) return 'High'
    if (sigma > 4) return 'Medium'
    return 'Low'
  }

  const getUncertaintyColor = (sigma: number) => {
    if (sigma > 6) return 'text-amber-600 dark:text-amber-400'
    if (sigma > 4) return 'text-blue-600 dark:text-blue-400'
    return 'text-success-600 dark:text-success-400'
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    if (teamsData && currentPage < teamsData.total_pages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text">
          Team Leaderboard
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Ranked by TrueSkill conservative rating (μ - 3σ) for team play
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {teams.map((team, index) => {
            const rank = (currentPage - 1) * pageSize + index + 1
            const certaintyLevel = getCertaintyLevel(team.trueskill_sigma)
            const uncertaintyColor = getUncertaintyColor(team.trueskill_sigma)

            return (
              <div
                key={team.id}
                onClick={() => (window.location.href = `/teams/${team.id}`)}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer hover:scale-[1.02] ${
                  rank <= 3 && currentPage === 1
                    ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10 hover:border-amber-300 dark:hover:border-amber-700'
                    : 'border-gray-200 bg-gray-50 dark:border-dark-border dark:bg-dark-background hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {showRankings && (
                    <div className="text-2xl font-bold w-12 text-center">
                      {getRankIcon(rank)}
                    </div>
                  )}

                  {/* Team Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      👥
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text">
                      {team.player1.name} & {team.player2.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{team.games_played} games</span>
                      <span>
                        {team.wins}W - {team.losses}L
                      </span>
                      <span>{team.win_percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900 dark:text-dark-text">
                    {team.conservative_rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span
                      title={`Team skill estimate: ${team.trueskill_mu.toFixed(1)} ± ${(team.trueskill_sigma * 2).toFixed(1)}`}
                    >
                      μ {team.trueskill_mu.toFixed(1)}
                    </span>
                    <span className={`ml-2 ${uncertaintyColor}`}>
                      σ {team.trueskill_sigma.toFixed(1)}
                    </span>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 ${uncertaintyColor}`}
                    title={`Uncertainty: ${team.trueskill_sigma.toFixed(1)} (${certaintyLevel})`}
                  >
                    {certaintyLevel} certainty
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {showPagination && teamsData && teamsData.total_pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, teamsData.total)} of{' '}
              {teamsData.total} teams
            </div>

            <div className="flex items-center space-x-3">
              <OutlineButton
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                size="sm"
              >
                Previous
              </OutlineButton>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {teamsData.total_pages}
              </span>

              <PrimaryButton
                onClick={handleNextPage}
                disabled={currentPage >= teamsData.total_pages}
                size="sm"
              >
                Next
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* Show total count for non-paginated view */}
        {!showPagination && teamsData && teamsData.total > teams.length && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing top {teams.length} of {teamsData.total} teams
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
