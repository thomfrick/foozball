// ABOUTME: Leaderboard component displaying players ranked by TrueSkill rating
// ABOUTME: Shows player rankings with TrueSkill mu, sigma, and conservative rating

import { usePlayers } from '../hooks/useApi'
import type { Player } from '../types/player'
import { LoadingSkeleton } from './LoadingSpinner'

interface LeaderboardProps {
  limit?: number
  showRankings?: boolean
}

export default function Leaderboard({
  limit = 10,
  showRankings = true,
}: LeaderboardProps) {
  const {
    data: playersData,
    isLoading,
    error,
  } = usePlayers({
    page_size: limit,
    active_only: true,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Leaderboard</h2>
        <LoadingSkeleton rows={Math.min(limit, 5)} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Leaderboard</h2>
        <div className="text-red-600 text-center py-4">
          Failed to load leaderboard. Please try again.
        </div>
      </div>
    )
  }

  if (!playersData?.players?.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Leaderboard</h2>
        <div className="text-gray-500 text-center py-8">
          No players found. Add some players to see the leaderboard!
        </div>
      </div>
    )
  }

  // Sort players by conservative TrueSkill rating (mu - 3*sigma)
  const sortedPlayers = [...playersData.players].sort((a, b) => {
    const conservativeA = a.trueskill_mu - 3 * a.trueskill_sigma
    const conservativeB = b.trueskill_mu - 3 * b.trueskill_sigma
    return conservativeB - conservativeA
  })

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

  const getConservativeRating = (player: Player) => {
    return player.trueskill_mu - 3 * player.trueskill_sigma
  }

  const getCertaintyLevel = (sigma: number) => {
    if (sigma > 7) return 'Low'
    if (sigma >= 5) return 'Medium'
    return 'High'
  }

  const getUncertaintyColor = (sigma: number) => {
    if (sigma > 7) return 'text-red-600'
    if (sigma >= 5) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          Ranked by TrueSkill conservative rating (μ - 3σ)
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => {
            const rank = index + 1
            const conservativeRating = getConservativeRating(player)
            const certaintyLevel = getCertaintyLevel(player.trueskill_sigma)

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  rank <= 3
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {showRankings && (
                    <div className="text-2xl font-bold w-12 text-center">
                      {getRankIcon(rank)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {player.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{player.games_played} games</span>
                      <span>
                        {player.wins}W - {player.losses}L
                      </span>
                      <span>{player.win_percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {conservativeRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span
                      title={`Skill estimate: ${player.trueskill_mu.toFixed(1)} ± ${(player.trueskill_sigma * 2).toFixed(1)}`}
                    >
                      μ {player.trueskill_mu.toFixed(1)}
                    </span>
                    <span
                      className={`ml-2 ${getUncertaintyColor(player.trueskill_sigma)}`}
                    >
                      σ {player.trueskill_sigma.toFixed(1)}
                    </span>
                  </div>
                  <div
                    className={`text-xs ${getUncertaintyColor(player.trueskill_sigma)}`}
                  >
                    {certaintyLevel} certainty
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {playersData.players.length === limit && playersData.total > limit && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Showing top {limit} of {playersData.total} players
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
