// ABOUTME: Multi-player rating comparison chart using Recharts
// ABOUTME: Displays rating progression for multiple players side-by-side

import React, { useState } from 'react'
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
import { useMultiPlayerRatingProgression } from '../hooks/useApi'
import type {
  PlayerRatingProgression,
  RatingHistoryEntry,
} from '../types/player'
import LoadingSpinner from './LoadingSpinner'
import Button from './ui/Button'
import Card from './ui/Card'

interface MultiPlayerComparisonChartProps {
  playerIds: number[]
  showConservativeRating?: boolean
  height?: number
  limit?: number
}

interface ChartDataPoint {
  gameNumber: number
  date: string
  [key: string]: number | string // Dynamic player rating fields
}

// Color palette for different players
const PLAYER_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
]

const MultiPlayerComparisonChart: React.FC<MultiPlayerComparisonChartProps> = ({
  playerIds,
  showConservativeRating: _showConservativeRating = true, // eslint-disable-line @typescript-eslint/no-unused-vars
  height = 400,
  limit = 100,
}) => {
  const [ratingType, setRatingType] = useState<'mu' | 'conservative'>(
    'conservative'
  )

  const {
    data: progression,
    isLoading,
    error,
  } = useMultiPlayerRatingProgression(playerIds, limit)

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
              Failed to load player comparison data
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (progression.players.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No players selected for comparison
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Select players to compare their rating progression
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // Find the maximum number of games among all players to normalize x-axis
  const maxGames = Math.max(
    ...progression.players.map((player) => player.ratings.length)
  )

  // Transform data for the chart - create a unified dataset
  const chartData: ChartDataPoint[] = []
  for (let gameIndex = 0; gameIndex < maxGames; gameIndex++) {
    const dataPoint: ChartDataPoint = {
      gameNumber: gameIndex + 1,
      date: '',
    }

    progression.players.forEach((player: PlayerRatingProgression) => {
      if (gameIndex < player.ratings.length) {
        const entry: RatingHistoryEntry = player.ratings[gameIndex]
        const muKey = `${player.player_name}_mu`
        const conservativeKey = `${player.player_name}_conservative`

        dataPoint[muKey] = Math.round(entry.trueskill_mu_after * 100) / 100
        dataPoint[conservativeKey] =
          Math.round(entry.conservative_rating_after * 100) / 100

        // Use the most recent date for this game number
        if (
          !dataPoint.date ||
          new Date(entry.created_at) > new Date(dataPoint.date)
        ) {
          dataPoint.date = new Date(entry.created_at).toLocaleDateString()
        }
      }
    })

    chartData.push(dataPoint)
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

  const ratingTypeDisplay =
    ratingType === 'mu' ? 'Skill Rating (μ)' : 'Conservative Rating'

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Player Rating Comparison
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {progression.players.length} players compared •{' '}
            {progression.total_games} total game entries
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={ratingType === 'conservative' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setRatingType('conservative')}
          >
            Conservative
          </Button>
          <Button
            variant={ratingType === 'mu' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setRatingType('mu')}
          >
            Skill (μ)
          </Button>
        </div>
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

          {/* Draw lines for each player */}
          {progression.players.map(
            (player: PlayerRatingProgression, index: number) => {
              const color = PLAYER_COLORS[index % PLAYER_COLORS.length]
              const dataKey =
                ratingType === 'mu'
                  ? `${player.player_name}_mu`
                  : `${player.player_name}_conservative`

              return (
                <Line
                  key={player.player_id}
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={player.player_name}
                  connectNulls={false}
                  activeDot={{ r: 5 }}
                />
              )
            }
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          Currently showing: <strong>{ratingTypeDisplay}</strong>
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
          {progression.players.map(
            (player: PlayerRatingProgression, index: number) => (
              <div key={player.player_id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      PLAYER_COLORS[index % PLAYER_COLORS.length],
                  }}
                />
                <span>
                  {player.player_name} ({player.ratings.length} games)
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </Card>
  )
}

export default MultiPlayerComparisonChart
