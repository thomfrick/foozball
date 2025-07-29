// ABOUTME: Interactive rating progression chart with zoom and filter controls
// ABOUTME: Enhanced version with date range filtering and chart interaction

import React, { useMemo, useState } from 'react'
import {
  Brush,
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
import Button from './ui/Button'
import Card from './ui/Card'

interface InteractiveRatingChartProps {
  playerId: number
  playerName?: string
  height?: number
  limit?: number
}

type TimeRange = 'all' | '30d' | '90d' | '6m' | '1y'
type ChartType = 'both' | 'mu' | 'conservative'

const InteractiveRatingChart: React.FC<InteractiveRatingChartProps> = ({
  playerId,
  playerName,
  height = 500,
  limit = 200,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [chartType, setChartType] = useState<ChartType>('both')
  const [showUncertainty, setShowUncertainty] = useState(false)

  const {
    data: progression,
    isLoading,
    error,
  } = usePlayerRatingProgression(playerId, limit)

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!progression || progression.ratings.length === 0) return []

    const now = new Date().getTime()
    const timeRangeMs = {
      all: 0,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '6m': 6 * 30 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
    }

    const cutoffTime = timeRange === 'all' ? 0 : now - timeRangeMs[timeRange]

    const filtered = progression.ratings.filter(
      (entry: RatingHistoryEntry) =>
        timeRange === 'all' ||
        new Date(entry.created_at).getTime() >= cutoffTime
    )

    return filtered.map((entry: RatingHistoryEntry, index: number) => ({
      gameNumber: index + 1,
      date: new Date(entry.created_at).toLocaleDateString(),
      timestamp: new Date(entry.created_at).getTime(),
      mu: Math.round(entry.trueskill_mu_after * 100) / 100,
      sigma: Math.round(entry.trueskill_sigma_after * 100) / 100,
      conservative: Math.round(entry.conservative_rating_after * 100) / 100,
      muBefore: Math.round(entry.trueskill_mu_before * 100) / 100,
      sigmaBefore: Math.round(entry.trueskill_sigma_before * 100) / 100,
      conservativeBefore:
        Math.round(entry.conservative_rating_before * 100) / 100,
    }))
  }, [progression, timeRange])

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

  if (filteredData.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No rating data for selected time range
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Try selecting a different time range or play more games
            </p>
          </div>
        </div>
      </Card>
    )
  }

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

  const timeRangeOptions = [
    { value: 'all' as TimeRange, label: 'All Time' },
    { value: '30d' as TimeRange, label: 'Last 30 Days' },
    { value: '90d' as TimeRange, label: 'Last 3 Months' },
    { value: '6m' as TimeRange, label: 'Last 6 Months' },
    { value: '1y' as TimeRange, label: 'Last Year' },
  ]

  const chartTypeOptions = [
    { value: 'both' as ChartType, label: 'Both Ratings' },
    { value: 'conservative' as ChartType, label: 'Conservative Only' },
    { value: 'mu' as ChartType, label: 'Skill (μ) Only' },
  ]

  const title = playerName
    ? `${playerName}'s Interactive Rating Chart`
    : 'Interactive Rating Chart'

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Time Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Range
            </label>
            <div className="flex gap-1">
              {timeRangeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={timeRange === option.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Chart Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating Type
            </label>
            <div className="flex gap-1">
              {chartTypeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={chartType === option.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setChartType(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Uncertainty Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Options
            </label>
            <Button
              variant={showUncertainty ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowUncertainty(!showUncertainty)}
            >
              {showUncertainty ? 'Hide' : 'Show'} Uncertainty
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredData.length} games shown • Drag to zoom • Double-click to
          reset zoom
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={filteredData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 60, // Extra space for brush
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
          {(chartType === 'both' || chartType === 'mu') && (
            <Line
              type="monotone"
              dataKey="mu"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Skill (μ)"
              connectNulls={false}
            />
          )}

          {/* Conservative rating (mu - 3*sigma) */}
          {(chartType === 'both' || chartType === 'conservative') && (
            <Line
              type="monotone"
              dataKey="conservative"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 2 }}
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
              dot={{ r: 2 }}
              name="Uncertainty (σ)"
              connectNulls={false}
            />
          )}

          {/* Brush for zooming */}
          <Brush dataKey="gameNumber" height={30} stroke="#3b82f6" />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
        {(chartType === 'both' || chartType === 'mu') && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Skill Rating (μ) - Raw skill level</span>
          </div>
        )}
        {(chartType === 'both' || chartType === 'conservative') && (
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

export default InteractiveRatingChart
