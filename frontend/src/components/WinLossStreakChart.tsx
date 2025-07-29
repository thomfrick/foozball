// ABOUTME: Win/loss streak visualization using Recharts bar chart
// ABOUTME: Shows winning and losing streaks over time for a player

import React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { usePlayerGames } from '../hooks/useApi'
import type { Game } from '../types/game'
import LoadingSpinner from './LoadingSpinner'
import Card from './ui/Card'

interface WinLossStreakChartProps {
  playerId: number
  playerName?: string
  height?: number
  maxGames?: number
}

interface StreakDataPoint {
  gameNumber: number
  date: string
  result: 'W' | 'L'
  streak: number // Positive for wins, negative for losses
  streakType: 'win' | 'loss'
  opponent: string
}

const WinLossStreakChart: React.FC<WinLossStreakChartProps> = ({
  playerId,
  playerName,
  height = 300,
  maxGames = 50,
}) => {
  const {
    data: gamesData,
    isLoading,
    error,
  } = usePlayerGames(playerId, { page_size: maxGames })

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center" style={{ height }}>
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    )
  }

  if (error || !gamesData) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Failed to load game history
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (gamesData.games.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">No games found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Play some games to see win/loss streaks
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // Process games to calculate streaks
  const games = gamesData.games.slice().reverse() // Reverse to get chronological order
  const streakData: StreakDataPoint[] = []
  let currentStreak = 0
  let currentStreakType: 'win' | 'loss' | null = null

  games.forEach((game: Game, index: number) => {
    const isWin = game.winner_id === playerId
    const opponent =
      game.player1_id === playerId
        ? game.player2?.name || 'Unknown'
        : game.player1?.name || 'Unknown'

    // Calculate streak
    if (isWin) {
      if (currentStreakType === 'win') {
        currentStreak += 1
      } else {
        currentStreak = 1
        currentStreakType = 'win'
      }
    } else {
      if (currentStreakType === 'loss') {
        currentStreak += 1
      } else {
        currentStreak = 1
        currentStreakType = 'loss'
      }
    }

    streakData.push({
      gameNumber: index + 1,
      date: new Date(game.created_at).toLocaleDateString(),
      result: isWin ? 'W' : 'L',
      streak: currentStreakType === 'win' ? currentStreak : -currentStreak,
      streakType: currentStreakType!,
      opponent,
    })
  })

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
      const streakText =
        (data.streak as number) > 0
          ? `${data.streak} game win streak`
          : `${Math.abs(data.streak as number)} game loss streak`

      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            Game #{label}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.date}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            vs {data.opponent}
          </p>
          <p
            className="text-sm font-medium"
            style={{
              color: data.streak > 0 ? '#10b981' : '#ef4444',
            }}
          >
            {data.result} - {streakText}
          </p>
        </div>
      )
    }
    return null
  }

  // Find current streak info
  const currentStreakInfo = streakData[streakData.length - 1]
  const currentStreakText = currentStreakInfo
    ? currentStreakInfo.streak > 0
      ? `${currentStreakInfo.streak} game win streak`
      : `${Math.abs(currentStreakInfo.streak)} game loss streak`
    : 'No games played'

  // Find longest streaks
  const maxWinStreak = Math.max(
    ...streakData.filter((d) => d.streak > 0).map((d) => d.streak),
    0
  )
  const maxLossStreak = Math.max(
    ...streakData.filter((d) => d.streak < 0).map((d) => Math.abs(d.streak)),
    0
  )

  const title = playerName
    ? `${playerName}'s Win/Loss Streaks`
    : 'Win/Loss Streaks'

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span>
            Current: <strong>{currentStreakText}</strong>
          </span>
          <span>
            Best win streak: <strong>{maxWinStreak}</strong>
          </span>
          <span>
            Worst loss streak: <strong>{maxLossStreak}</strong>
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={streakData}
          margin={{
            top: 20,
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
            tickFormatter={(value) => Math.abs(value).toString()}
          />
          <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="streak" radius={[2, 2, 0, 0]}>
            {streakData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.streak > 0 ? '#10b981' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Win streaks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Loss streaks</span>
        </div>
        <span className="text-gray-500">
          Showing last {streakData.length} games
        </span>
      </div>
    </Card>
  )
}

export default WinLossStreakChart
