// ABOUTME: Head-to-head player comparison component with matchup analysis
// ABOUTME: Displays detailed comparison statistics between two selected players

import React, { useState } from 'react'
import { useHeadToHeadStatistics } from '../../hooks/useStatistics'
import type { EnhancedLeaderboardResponse } from '../../types/statistics'
import { Card } from '../ui/Card'

interface HeadToHeadComparisonProps {
  leaderboardData?: EnhancedLeaderboardResponse
}

export const HeadToHeadComparison: React.FC<HeadToHeadComparisonProps> = ({
  leaderboardData,
}) => {
  const [player1Id, setPlayer1Id] = useState<number | null>(null)
  const [player2Id, setPlayer2Id] = useState<number | null>(null)
  const [searchQuery1, setSearchQuery1] = useState('')
  const [searchQuery2, setSearchQuery2] = useState('')

  const {
    data: headToHeadData,
    isLoading,
    error,
  } = useHeadToHeadStatistics(player1Id || 0, player2Id || 0, {
    enabled: !!player1Id && !!player2Id && player1Id !== player2Id,
  })

  const filteredPlayers1 =
    leaderboardData?.leaderboard.filter(
      (player) =>
        player.player_name.toLowerCase().includes(searchQuery1.toLowerCase()) &&
        player.player_id !== player2Id
    ) || []

  const filteredPlayers2 =
    leaderboardData?.leaderboard.filter(
      (player) =>
        player.player_name.toLowerCase().includes(searchQuery2.toLowerCase()) &&
        player.player_id !== player1Id
    ) || []

  const getPlayer1Name = () => {
    return (
      leaderboardData?.leaderboard.find((p) => p.player_id === player1Id)
        ?.player_name || 'Player 1'
    )
  }

  const getPlayer2Name = () => {
    return (
      leaderboardData?.leaderboard.find((p) => p.player_id === player2Id)
        ?.player_name || 'Player 2'
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const PlayerSelector = ({
    title,
    selectedId,
    onSelect,
    searchQuery,
    onSearchChange,
    filteredPlayers,
    placeholder,
  }: {
    title: string
    selectedId: number | null
    onSelect: (id: number) => void
    searchQuery: string
    onSearchChange: (query: string) => void
    filteredPlayers: EnhancedLeaderboardResponse['leaderboard']
    placeholder: string
  }) => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        {title}
      </h3>

      <div className="mb-4">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredPlayers.map((player) => (
          <button
            key={player.player_id}
            onClick={() => onSelect(player.player_id)}
            className={`
              w-full p-3 text-left rounded-lg border transition-colors
              ${
                selectedId === player.player_id
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
                  #{player.rank} • {player.conservative_rating.toFixed(1)}{' '}
                  rating
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
  )

  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlayerSelector
          title="🥊 Select First Player"
          selectedId={player1Id}
          onSelect={setPlayer1Id}
          searchQuery={searchQuery1}
          onSearchChange={setSearchQuery1}
          filteredPlayers={filteredPlayers1}
          placeholder="Search for first player..."
        />

        <PlayerSelector
          title="🥊 Select Second Player"
          selectedId={player2Id}
          onSelect={setPlayer2Id}
          searchQuery={searchQuery2}
          onSearchChange={setSearchQuery2}
          filteredPlayers={filteredPlayers2}
          placeholder="Search for second player..."
        />
      </div>

      {/* Comparison Results */}
      {!player1Id || !player2Id ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 dark:text-gray-600 text-4xl mb-4">
            ⚔️
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Select Two Players
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose two players to compare their head-to-head record
          </p>
        </Card>
      ) : player1Id === player2Id ? (
        <Card className="p-12 text-center">
          <div className="text-yellow-400 dark:text-yellow-600 text-4xl mb-4">
            ⚠️
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Select Different Players
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please select two different players to compare
          </p>
        </Card>
      ) : isLoading ? (
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <div className="text-red-500 dark:text-red-400 mb-2">⚠️</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Failed to load head-to-head statistics
            </p>
          </div>
        </Card>
      ) : headToHeadData ? (
        <div className="space-y-6">
          {/* Head-to-Head Header */}
          <Card className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {getPlayer1Name()} vs {getPlayer2Name()}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Head-to-Head Matchup Analysis
              </p>
            </div>

            {/* Overall Record */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Player 1 Stats */}
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {headToHeadData.head_to_head.player1_wins}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {headToHeadData.head_to_head.player1_name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {headToHeadData.head_to_head.player1_win_percentage.toFixed(
                    1
                  )}
                  % win rate
                </div>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center justify-center p-6">
                <div className="text-4xl mb-2">⚔️</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {headToHeadData.head_to_head.total_games} Games
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Played
                </div>
              </div>

              {/* Player 2 Stats */}
              <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {headToHeadData.head_to_head.player2_wins}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {headToHeadData.head_to_head.player2_name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {headToHeadData.head_to_head.player2_win_percentage.toFixed(
                    1
                  )}
                  % win rate
                </div>
              </div>
            </div>

            {/* Current Streak & Last Game */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {headToHeadData.head_to_head.current_streak && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    🔥 Current Streak
                  </div>
                  <div className="font-semibold text-yellow-600 dark:text-yellow-400">
                    {headToHeadData.head_to_head.current_streak}
                  </div>
                </div>
              )}

              {headToHeadData.head_to_head.last_game_date && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    📅 Last Game
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(headToHeadData.head_to_head.last_game_date)}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Games History */}
          {headToHeadData.recent_games.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                📋 Recent Games ({headToHeadData.recent_games.length})
              </h3>

              <div className="space-y-3">
                {headToHeadData.recent_games.map((game, index) => (
                  <div
                    key={game.game_id}
                    className={`
                      flex items-center justify-between p-4 rounded-lg border
                      ${
                        game.result === 'W'
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                        ${game.result === 'W' ? 'bg-green-500' : 'bg-red-500'}
                      `}
                      >
                        {game.result}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Game #{headToHeadData.recent_games.length - index}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          vs {game.opponent_name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(game.date)}
                      </div>
                      {game.rating_change !== 0 && (
                        <div
                          className={`text-xs ${
                            game.rating_change > 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {game.rating_change > 0 ? '+' : ''}
                          {game.rating_change.toFixed(2)} rating
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* No Games Played */}
          {headToHeadData.head_to_head.total_games === 0 && (
            <Card className="p-12 text-center">
              <div className="text-gray-400 dark:text-gray-600 text-4xl mb-4">
                🤷‍♂️
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Games Played
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                These players haven't played against each other yet
              </p>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  )
}
