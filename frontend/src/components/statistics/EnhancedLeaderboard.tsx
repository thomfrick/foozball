// ABOUTME: Enhanced leaderboard component with filtering, sorting, and detailed statistics
// ABOUTME: Displays comprehensive player rankings with performance indicators and trends

import React, { useState } from 'react'
import type {
  EnhancedLeaderboardResponse,
  LeaderboardParams,
} from '../../types/statistics'
import Button from '../ui/Button'
import Card from '../ui/Card'

interface EnhancedLeaderboardProps {
  data?: EnhancedLeaderboardResponse
  loading?: boolean
  error?: Error | null
  onPlayerSelect?: (playerId: number) => void
}

export const EnhancedLeaderboard: React.FC<EnhancedLeaderboardProps> = ({
  data,
  loading,
  error,
  onPlayerSelect,
}) => {
  const [filters, setFilters] = useState<LeaderboardParams>({
    page: 1,
    page_size: 20,
    min_games: 0,
    sort_by: 'rating',
  })

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈'
      case 'down':
        return '📉'
      default:
        return '➖'
    }
  }

  const getFormDisplay = (form: string) => {
    return form.split('').map((result, index) => (
      <span
        key={index}
        className={`
          inline-block w-5 h-5 text-xs font-bold rounded-full text-white text-center leading-5
          ${result === 'W' ? 'bg-green-500' : 'bg-red-500'}
        `}
      >
        {result}
      </span>
    ))
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          🏆 Enhanced Leaderboard
        </h3>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          🏆 Enhanced Leaderboard
        </h3>
        <div className="text-center py-8">
          <div className="text-red-500 dark:text-red-400 mb-2">⚠️</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Failed to load leaderboard
          </p>
        </div>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 lg:mb-0">
          🏆 Enhanced Leaderboard
        </h3>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.sort_by}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFilters((prev) => ({
                ...prev,
                sort_by: e.target.value as LeaderboardParams['sort_by'],
              }))
            }
            className="px-3 py-1 text-sm border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="rating">Sort by Rating</option>
            <option value="wins">Sort by Wins</option>
            <option value="games">Sort by Games</option>
            <option value="win_rate">Sort by Win Rate</option>
          </select>

          <select
            value={filters.min_games}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                min_games: parseInt(e.target.value),
              }))
            }
            className="px-3 py-1 text-sm border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value={0}>All Players</option>
            <option value={5}>Min 5 Games</option>
            <option value={10}>Min 10 Games</option>
            <option value={20}>Min 20 Games</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {data.total_players}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Total Players
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {data.active_players}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Active Players
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {data.total_games}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Total Games
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {data.leaderboard.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Shown</div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Rank
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Player
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Rating
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Record
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Form
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Trend
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Activity
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.leaderboard.map((player) => (
              <tr
                key={player.player_id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-4 px-2">
                  <div className="flex items-center">
                    <span
                      className={`
                      inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                      ${
                        player.rank === 1
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : player.rank === 2
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            : player.rank === 3
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }
                    `}
                    >
                      {player.rank <= 3
                        ? player.rank === 1
                          ? '🥇'
                          : player.rank === 2
                            ? '🥈'
                            : '🥉'
                        : player.rank}
                    </span>
                  </div>
                </td>

                <td className="py-4 px-2">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {player.player_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      μ: {player.trueskill_mu.toFixed(1)}, σ:{' '}
                      {player.trueskill_sigma.toFixed(1)}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-2">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {player.conservative_rating.toFixed(1)}
                  </div>
                </td>

                <td className="py-4 px-2">
                  <div>
                    <div className="font-semibold">
                      {player.wins}W - {player.losses}L
                    </div>
                    <div className="text-sm text-gray-500">
                      {player.win_percentage.toFixed(1)}% ({player.games_played}{' '}
                      games)
                    </div>
                  </div>
                </td>

                <td className="py-4 px-2">
                  <div className="flex space-x-1">
                    {getFormDisplay(player.recent_form)}
                  </div>
                </td>

                <td className="py-4 px-2">
                  <div className="flex items-center space-x-1">
                    <span>{getTrendIcon(player.trend_7d)}</span>
                    <span
                      className={`text-sm font-medium ${
                        player.rating_change_7d > 0
                          ? 'text-green-600 dark:text-green-400'
                          : player.rating_change_7d < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {player.rating_change_7d > 0 ? '+' : ''}
                      {player.rating_change_7d.toFixed(1)}
                    </span>
                  </div>
                </td>

                <td className="py-4 px-2">
                  <div className="text-sm">
                    <div>{player.games_this_week} games this week</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      Last: {formatDate(player.last_game_date)}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPlayerSelect?.(player.player_id)}
                    className="text-xs"
                  >
                    View Stats
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {data.leaderboard.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-2">📊</div>
          <p className="text-gray-500 dark:text-gray-400">
            No players found with the current filters
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
        Last updated: {new Date(data.last_updated).toLocaleString()}
      </div>
    </Card>
  )
}
