// ABOUTME: Comprehensive statistics dashboard page with tabbed interface
// ABOUTME: Displays system overview, player rankings, and advanced analytics

import React, { useState } from 'react'
import { EnhancedLeaderboard } from '../components/statistics/EnhancedLeaderboard'
import { HeadToHeadComparison } from '../components/statistics/HeadToHeadComparison'
import { PlayerStatisticsPanel } from '../components/statistics/PlayerStatisticsPanel'
import { StatsSummaryCard } from '../components/statistics/StatsSummaryCard'
import { Card } from '../components/ui/Card'
import {
  useEnhancedLeaderboard,
  useStatisticsSummary,
} from '../hooks/useStatistics'
import type { StatsDashboardTab } from '../types/statistics'

const DASHBOARD_TABS: StatsDashboardTab[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'leaderboard', label: 'Enhanced Leaderboard', icon: '🏆' },
  { id: 'player-stats', label: 'Player Statistics', icon: '👤' },
  { id: 'comparisons', label: 'Head-to-Head', icon: '⚔️' },
]

export const StatisticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useStatisticsSummary()

  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    error: leaderboardError,
  } = useEnhancedLeaderboard({ page: 1, page_size: 20 })

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Statistics Summary */}
              <StatsSummaryCard
                summary={summary}
                loading={summaryLoading}
                error={summaryError}
              />

              {/* Top Performers Quick View */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  🌟 Top Performers
                </h3>
                {summary && (
                  <div className="space-y-4">
                    {summary.highest_rated_player && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Highest Rated
                        </span>
                        <div className="text-right">
                          <div className="font-semibold text-blue-600 dark:text-blue-400">
                            {summary.highest_rated_player.player_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {summary.highest_rated_player.conservative_rating.toFixed(
                              1
                            )}{' '}
                            rating
                          </div>
                        </div>
                      </div>
                    )}

                    {summary.most_active_player && (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Most Active
                        </span>
                        <div className="text-right">
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            {summary.most_active_player.player_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {summary.most_active_player.games_played} games
                          </div>
                        </div>
                      </div>
                    )}

                    {summary.best_win_rate_player && (
                      <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Best Win Rate
                        </span>
                        <div className="text-right">
                          <div className="font-semibold text-yellow-600 dark:text-yellow-400">
                            {summary.best_win_rate_player.player_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {summary.best_win_rate_player.win_percentage.toFixed(
                              1
                            )}
                            % wins
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Recent Activity Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                📈 Recent Activity
              </h3>
              {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {summary.games_today}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Games Today
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {summary.games_this_week}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      This Week
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {summary.games_this_month}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      This Month
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {summary.avg_games_per_player.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Avg/Player
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )

      case 'leaderboard':
        return (
          <EnhancedLeaderboard
            data={leaderboardData}
            loading={leaderboardLoading}
            error={leaderboardError}
            onPlayerSelect={setSelectedPlayerId}
          />
        )

      case 'player-stats':
        return (
          <PlayerStatisticsPanel
            selectedPlayerId={selectedPlayerId}
            onPlayerSelect={setSelectedPlayerId}
            leaderboardData={leaderboardData}
          />
        )

      case 'comparisons':
        return <HeadToHeadComparison leaderboardData={leaderboardData} />

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Statistics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive player performance analytics and insights
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {DASHBOARD_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">{renderTabContent()}</div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Statistics updated in real-time • Last refresh:{' '}
          {summary
            ? new Date(summary.last_updated).toLocaleString()
            : 'Loading...'}
        </p>
      </div>
    </div>
  )
}
