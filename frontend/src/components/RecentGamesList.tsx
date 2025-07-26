// ABOUTME: Component for displaying a list of recent games with player details
// ABOUTME: Handles loading states, errors, and provides game information display

import { useState } from 'react'
import { useGames } from '../hooks/useApi'
import type { Game } from '../types/game'

interface RecentGamesListProps {
  onGameSelect?: (game: Game) => void
  showPagination?: boolean
  limit?: number
}

export default function RecentGamesList({
  onGameSelect,
  showPagination = true,
  limit = 10,
}: RecentGamesListProps) {
  const [page, setPage] = useState(1)
  const pageSize = limit

  const {
    data: gamesData,
    isLoading,
    error,
    refetch,
  } = useGames({
    page,
    page_size: pageSize,
  })

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getGameDescription = (game: Game) => {
    const isPlayer1Winner = game.winner_id === game.player1_id
    return isPlayer1Winner
      ? `${game.player1.name} defeated ${game.player2.name}`
      : `${game.player2.name} defeated ${game.player1.name}`
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Recent Games
          </h2>
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 mb-2">Failed to load games</p>
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Games</h2>
        <span className="text-sm text-gray-500">
          {gamesData?.total || 0} total games
        </span>
      </div>

      {/* Games list */}
      {games.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No games recorded yet.</p>
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
                  <GameContent
                    game={game}
                    formatDate={formatDate}
                    getGameDescription={getGameDescription}
                  />
                </button>
              ) : (
                <GameContent
                  game={game}
                  formatDate={formatDate}
                  getGameDescription={getGameDescription}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

// Helper component to avoid duplication
function GameContent({
  game,
  formatDate,
  getGameDescription,
}: {
  game: Game
  formatDate: (date: string) => string
  getGameDescription: (game: Game) => string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          {/* Player matchup */}
          <div className="flex items-center space-x-2">
            <span
              className={`font-medium ${
                game.winner_id === game.player1_id
                  ? 'text-green-700'
                  : 'text-gray-700'
              }`}
            >
              {game.player1.name}
            </span>
            <span className="text-gray-400">vs</span>
            <span
              className={`font-medium ${
                game.winner_id === game.player2_id
                  ? 'text-green-700'
                  : 'text-gray-700'
              }`}
            >
              {game.player2.name}
            </span>
          </div>

          {/* Winner badge */}
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              🏆 {game.winner.name}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-1">{getGameDescription(game)}</p>
      </div>

      <div className="text-right ml-4">
        <p className="text-sm text-gray-500">{formatDate(game.created_at)}</p>
        <p className="text-xs text-gray-400">Game #{game.id}</p>
      </div>
    </div>
  )
}
