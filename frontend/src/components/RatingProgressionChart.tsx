// ABOUTME: Rating progression chart component using Recharts
// ABOUTME: Displays TrueSkill rating evolution over time for individual players

import React from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { usePlayerRatingProgression } from '../hooks/useApi'
import type { RatingHistoryEntry } from '../types/player'
import LoadingSpinner from './LoadingSpinner'
import Card from './ui/Card'

interface RatingProgressionChartProps {
  playerId: number
  playerName?: string
  showConservativeRating?: boolean
  showUncertainty?: boolean
  height?: number
  limit?: number
}

interface ChartDataPoint {
  gameNumber: number
  date: string
  mu: number
  sigma: number
  conservative: number
  muBefore: number
  sigmaBefore: number
  conservativeBefore: number
}

const RatingProgressionChart: React.FC<RatingProgressionChartProps> = ({
  playerId,
  playerName,
  showConservativeRating = true,
  showUncertainty = false,
  height = 400,
  limit = 100,
}) => {
  const {
    data: progression,
    isLoading,
    error,
  } = usePlayerRatingProgression(playerId, limit)

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center" style={{ height }}>
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    )
  }

  if (error || !progression) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Failed to load rating progression
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (progression.ratings.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No rating history available
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Play some games to see rating progression
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // Transform data for the chart
  const chartData: ChartDataPoint[] = progression.ratings.map(
    (entry: RatingHistoryEntry, index: number) => ({
      gameNumber: index + 1,
      date: new Date(entry.created_at).toLocaleDateString(),
      mu: Math.round(entry.trueskill_mu_after * 100) / 100,
      sigma: Math.round(entry.trueskill_sigma_after * 100) / 100,
      conservative: Math.round(entry.conservative_rating_after * 100) / 100,
      muBefore: Math.round(entry.trueskill_mu_before * 100) / 100,
      sigmaBefore: Math.round(entry.trueskill_sigma_before * 100) / 100,
      conservativeBefore:
        Math.round(entry.conservative_rating_before * 100) / 100,
    })
  )

  // Custom tooltip component
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: unknown[]
    label?: string | number
  }) => {
    if (active && payload && payload.length) {
      const data = (payload[0] as { payload: Record<string, unknown> }).payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            Game #{label}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {data.date as string}
          </p>
          {(payload as { name: string; value: number; color: string }[]).map(
            (entry, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {entry.name}: {entry.value}
                </span>
              </div>
            )
          )}
        </div>
      )
    }
    return null
  }

  const title = playerName
    ? `${playerName}'s Rating Progression`
    : 'Rating Progression'

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {progression.ratings.length} games tracked
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis
            dataKey="gameNumber"
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* TrueSkill Mu (skill rating) */}
          <Line
            type="monotone"
            dataKey="mu"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Skill (μ)"
            connectNulls={false}
          />

          {/* Conservative rating (mu - 3*sigma) */}
          {showConservativeRating && (
            <Line
              type="monotone"
              dataKey="conservative"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Conservative Rating"
              connectNulls={false}
            />
          )}

          {/* Uncertainty (sigma) */}
          {showUncertainty && (
            <Line
              type="monotone"
              dataKey="sigma"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Uncertainty (σ)"
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Skill Rating (μ) - Raw skill level</span>
        </div>
        {showConservativeRating && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Conservative Rating - μ - 3σ (ranking system)</span>
          </div>
        )}
        {showUncertainty && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Uncertainty (σ) - Rating confidence</span>
          </div>
        )}
      </div>
    </Card>
  )
}

export default RatingProgressionChart
