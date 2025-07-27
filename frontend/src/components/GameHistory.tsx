// ABOUTME: Component for displaying comprehensive game history with filtering and pagination
// ABOUTME: Handles advanced game browsing, search, and filtering capabilities

import { useEffect, useState } from 'react'
import { useGames, usePlayerGames, usePlayers } from '../hooks/useApi'
import type { Game } from '../types/game'
import { LoadingSkeleton } from './LoadingSpinner'

interface GameHistoryProps {
  playerId?: number // If provided, shows games for specific player
  onGameSelect?: (game: Game) => void
}

export default function GameHistory({
  playerId,
  onGameSelect,
}: GameHistoryProps) {
  const [page, setPage] = useState(1)
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | undefined>(
    playerId
  )
  const pageSize = 20

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [selectedPlayerId])

  // Fetch games based on whether we're filtering by player
  const gamesQuery = useGames({
    page,
    page_size: pageSize,
  })

  const playerGamesQuery = usePlayerGames(selectedPlayerId, {
    page,
    page_size: pageSize,
  })

  // Use player-specific query if playerId is provided
  const {
    data: gamesData,
    isLoading,
    error,
    refetch,
  } = selectedPlayerId ? playerGamesQuery : gamesQuery

  // Fetch players for filter dropdown (only if not locked to specific player)
  const { data: playersResponse } = usePlayers({
    page: 1,
    page_size: 100,
    active_only: true,
  })

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePlayerFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedPlayerId(value ? parseInt(value, 10) : undefined)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getGameResult = (game: Game, forPlayerId?: number) => {
    if (!forPlayerId) {
      return `${game.winner.name} defeated ${
        game.winner_id === game.player1_id
          ? game.player2.name
          : game.player1.name
      }`
    }

    const isWinner = game.winner_id === forPlayerId
    const opponent =
      game.player1_id === forPlayerId ? game.player2 : game.player1

    return isWinner ? `Won vs ${opponent.name}` : `Lost to ${opponent.name}`
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Game History</h2>
        {!playerId && (
          <div className="mb-6">
            <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        )}
        <LoadingSkeleton rows={Math.min(pageSize, 8)} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Game History
          </h2>
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 mb-2">Failed to load game history</p>
            <button
              onClick={() => refetch()}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const games = gamesData?.games || []
  const totalPages = gamesData?.total_pages || 1
  const players = playersResponse?.players || []

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedPlayerId && !playerId
            ? 'Player Game History'
            : 'Game History'}
        </h2>
        <span className="text-sm text-gray-500">
          {gamesData?.total || 0} games total
        </span>
      </div>

      {/* Filters - only show if not locked to specific player */}
      {!playerId && (
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="playerFilter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Filter by Player
              </label>
              <select
                id="playerFilter"
                value={selectedPlayerId || ''}
                onChange={handlePlayerFilter}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Players</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Games list */}
      {games.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {selectedPlayerId
              ? 'No games found for this player.'
              : 'No games recorded yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {games.map((game) => (
            <div
              key={game.id}
              className={`p-4 border border-gray-200 rounded-lg transition-colors ${
                onGameSelect ? 'hover:bg-gray-50 cursor-pointer' : ''
              }`}
            >
              {onGameSelect ? (
                <button
                  type="button"
                  className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded"
                  onClick={() => onGameSelect(game)}
                  aria-label={`View details for game ${game.id}`}
                >
                  <GameHistoryContent
                    game={game}
                    formatDate={formatDate}
                    getGameResult={getGameResult}
                    selectedPlayerId={selectedPlayerId}
                  />
                </button>
              ) : (
                <GameHistoryContent
                  game={game}
                  formatDate={formatDate}
                  getGameResult={getGameResult}
                  selectedPlayerId={selectedPlayerId}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex space-x-1">
            {/* Show first page */}
            {page > 3 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  1
                </button>
                {page > 4 && (
                  <span className="px-2 py-2 text-sm text-gray-500">...</span>
                )}
              </>
            )}

            {/* Show pages around current page */}
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }

              // Skip if page is already shown or out of range
              if (pageNum < 1 || pageNum > totalPages) return null
              if (
                (page > 3 && pageNum <= 1) ||
                (page < totalPages - 2 && pageNum >= totalPages)
              )
                return null

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            {/* Show last page */}
            {page < totalPages - 2 && (
              <>
                {page < totalPages - 3 && (
                  <span className="px-2 py-2 text-sm text-gray-500">...</span>
                )}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

// Helper component for game content
function GameHistoryContent({
  game,
  formatDate,
  getGameResult,
  selectedPlayerId,
}: {
  game: Game
  formatDate: (date: string) => string
  getGameResult: (game: Game, forPlayerId?: number) => string
  selectedPlayerId?: number
}) {
  const isPlayer1Focus = selectedPlayerId === game.player1_id
  const isPlayer2Focus = selectedPlayerId === game.player2_id
  const isWin = selectedPlayerId ? game.winner_id === selectedPlayerId : false

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          {/* Game matchup */}
          <div className="flex items-center space-x-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPlayer1Focus
                  ? isWin
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  : game.winner_id === game.player1_id
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {game.player1.name}
              {game.winner_id === game.player1_id && ' 🏆'}
            </div>

            <span className="text-gray-400 font-medium">VS</span>

            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPlayer2Focus
                  ? isWin
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  : game.winner_id === game.player2_id
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {game.player2.name}
              {game.winner_id === game.player2_id && ' 🏆'}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-2">
          {getGameResult(game, selectedPlayerId)}
        </p>
      </div>

      <div className="text-right ml-6">
        <p className="text-sm font-medium text-gray-900">
          {formatDate(game.created_at)}
        </p>
        <p className="text-xs text-gray-500 mt-1">Game #{game.id}</p>
      </div>
    </div>
  )
}
