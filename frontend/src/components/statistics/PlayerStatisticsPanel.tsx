// ABOUTME: Detailed player statistics panel with comprehensive performance analysis
// ABOUTME: Displays individual player metrics, trends, and recent form analysis

import React, { useState } from 'react'
import { usePlayerStatistics } from '../../hooks/useStatistics'
import type { EnhancedLeaderboardResponse } from '../../types/statistics'
import Card from '../ui/Card'

interface PlayerStatisticsPanelProps {
  selectedPlayerId: number | null
  onPlayerSelect: (playerId: number) => void
  leaderboardData?: EnhancedLeaderboardResponse
}

export const PlayerStatisticsPanel: React.FC<PlayerStatisticsPanelProps> = ({
  selectedPlayerId,
  onPlayerSelect,
  leaderboardData,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: playerStats,
    isLoading,
    error,
  } = usePlayerStatistics(selectedPlayerId || 0, {
    enabled: !!selectedPlayerId,
  })

  const filteredPlayers =
    leaderboardData?.leaderboard.filter((player) =>
      player.player_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return '📈'
      case 'down':
        return '📉'
      default:
        return '➖'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Player Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          👤 Select Player
        </h3>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Player List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredPlayers.map((player) => (
            <button
              key={player.player_id}
              onClick={() => onPlayerSelect(player.player_id)}
              className={`
                w-full p-3 text-left rounded-lg border transition-colors
                ${
                  selectedPlayerId === player.player_id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {player.player_name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Rank #{player.rank} •{' '}
                    {player.conservative_rating.toFixed(1)} rating
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {player.wins}W-{player.losses}L
                  </div>
                  <div className="text-xs text-gray-500">
                    {player.win_percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No players found
          </div>
        )}
      </Card>

      {/* Player Statistics */}
      <div className="lg:col-span-2">
        {!selectedPlayerId && (
          <Card className="p-12 text-center">
            <div className="text-gray-400 dark:text-gray-600 text-4xl mb-4">
              👤
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Select a Player
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose a player from the list to view their detailed statistics
            </p>
          </Card>
        )}

        {selectedPlayerId && isLoading && (
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-200 dark:bg-gray-700 rounded"
                  ></div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {selectedPlayerId && error && (
          <Card className="p-6">
            <div className="text-center py-8">
              <div className="text-red-500 dark:text-red-400 mb-2">⚠️</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Failed to load player statistics
              </p>
            </div>
          </Card>
        )}

        {selectedPlayerId && playerStats && (
          <div className="space-y-6">
            {/* Player Header */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {playerStats.player_name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Player Statistics Overview
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {playerStats.conservative_rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Conservative Rating
                  </div>
                </div>
              </div>

              {/* Core Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {playerStats.wins}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Wins
                  </div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {playerStats.losses}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Losses
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {playerStats.win_percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Win Rate
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {playerStats.total_games}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Games
                  </div>
                </div>
              </div>
            </Card>

            {/* TrueSkill Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                🎯 TrueSkill Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {playerStats.current_mu.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Skill (μ)
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                    {playerStats.current_sigma.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Uncertainty (σ)
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {playerStats.peak_rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Peak Rating
                    {playerStats.peak_rating_date && (
                      <div className="text-xs">
                        {formatDate(playerStats.peak_rating_date)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Performance Trends */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                📈 Performance Trends
              </h3>
              <div className="space-y-4">
                {playerStats.performance_trends.map((trend) => (
                  <div
                    key={trend.period}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getTrendIcon(trend.trend_direction)}
                      </span>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {trend.period === 'all'
                            ? 'All Time'
                            : `Last ${trend.period}`}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {trend.games_played} games • {trend.wins}W-
                          {trend.losses}L
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {trend.win_percentage.toFixed(1)}%
                      </div>
                      <div
                        className={`text-sm ${
                          trend.rating_change > 0
                            ? 'text-green-600 dark:text-green-400'
                            : trend.rating_change < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {trend.rating_change > 0 ? '+' : ''}
                        {trend.rating_change.toFixed(1)} rating
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Form */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                🔥 Recent Form
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Current Form:
                      </span>
                      <div className="flex space-x-1">
                        {playerStats.recent_form.current_form
                          .split('')
                          .map((result, index) => (
                            <span
                              key={index}
                              className={`
                              inline-block w-6 h-6 text-xs font-bold rounded-full text-white text-center leading-6
                              ${result === 'W' ? 'bg-green-500' : 'bg-red-500'}
                            `}
                            >
                              {result}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Trend:{' '}
                      <span className="font-medium capitalize">
                        {playerStats.recent_form.form_trend}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Games Analyzed:
                      </span>
                      <span className="font-semibold">
                        {playerStats.recent_form.games_analyzed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Win Percentage:
                      </span>
                      <span className="font-semibold">
                        {playerStats.recent_form.win_percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Avg Rating Change:
                      </span>
                      <span
                        className={`font-semibold ${
                          playerStats.recent_form.avg_rating_change > 0
                            ? 'text-green-600 dark:text-green-400'
                            : playerStats.recent_form.avg_rating_change < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500'
                        }`}
                      >
                        {playerStats.recent_form.avg_rating_change > 0
                          ? '+'
                          : ''}
                        {playerStats.recent_form.avg_rating_change.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Streak Information
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Current Streak
                      </div>
                      <div className="font-semibold text-blue-600 dark:text-blue-400">
                        {playerStats.current_streak}
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Longest Win Streak
                      </div>
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {playerStats.longest_win_streak} games
                      </div>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Longest Loss Streak
                      </div>
                      <div className="font-semibold text-red-600 dark:text-red-400">
                        {playerStats.longest_loss_streak} games
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Activity Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                📅 Activity Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {playerStats.games_this_week}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    This Week
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {playerStats.games_this_month}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    This Month
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    First Game
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(playerStats.first_game_date)}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Last Game
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(playerStats.last_game_date)}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
