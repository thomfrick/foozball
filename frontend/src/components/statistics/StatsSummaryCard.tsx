// ABOUTME: Statistics summary card component displaying system-wide metrics
// ABOUTME: Shows player counts, game activity, and overall system health indicators

import React from 'react'
import type { StatisticsSummary } from '../../types/statistics'
import Card from '../ui/Card'

interface StatsSummaryCardProps {
  summary?: StatisticsSummary
  loading?: boolean
  error?: Error | null
}

const StatsSummaryCard: React.FC<StatsSummaryCardProps> = ({
  summary,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          🎯 System Overview
        </h3>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
          🎯 System Overview
        </h3>
        <div className="text-center py-8">
          <div className="text-red-500 dark:text-red-400 mb-2">⚠️</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Failed to load statistics summary
          </p>
        </div>
      </Card>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        🎯 System Overview
      </h3>

      <div className="space-y-4">
        {/* Player Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {summary.total_players}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total Players
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {summary.active_players}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Active Players
            </div>
          </div>
        </div>

        {/* Game Statistics */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="text-center mb-3">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {summary.total_games}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Games Played
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {summary.games_today}
              </div>
              <div className="text-xs text-gray-500">Today</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {summary.games_this_week}
              </div>
              <div className="text-xs text-gray-500">This Week</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {summary.games_this_month}
              </div>
              <div className="text-xs text-gray-500">This Month</div>
            </div>
          </div>
        </div>

        {/* System Averages */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {summary.avg_games_per_player.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Avg Games/Player
            </div>
          </div>
          <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {summary.avg_rating.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Avg Rating
            </div>
          </div>
        </div>

        {/* Most Common Matchup */}
        {summary.most_common_matchup && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              🔥 Most Common Matchup
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400 font-semibold">
              {summary.most_common_matchup}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
          Last updated: {new Date(summary.last_updated).toLocaleString()}
        </div>
      </div>
    </Card>
  )
}

export { StatsSummaryCard }
export default StatsSummaryCard
