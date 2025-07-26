// ABOUTME: Component for displaying a list of players with search and pagination
// ABOUTME: Handles loading states, errors, and provides player management actions

import { useEffect, useState } from 'react'
import { usePlayers } from '../hooks/useApi'
import { useDebounce } from '../hooks/useDebounce'
import type { Player } from '../types/player'
import { CompactTrueSkillRating } from './TrueSkillRating'

interface PlayerListProps {
  onPlayerSelect?: (player: Player) => void
  onPlayerEdit?: (player: Player) => void
  onPlayerDelete?: (player: Player) => void
  showActions?: boolean
}

export default function PlayerList({
  onPlayerSelect,
  onPlayerEdit,
  onPlayerDelete,
  showActions = true,
}: PlayerListProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(search.trim(), 300)

  // Reset page to 1 when search term changes (debounced)
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const {
    data: playersData,
    isLoading,
    error,
    refetch,
  } = usePlayers({
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    active_only: true,
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    // Page reset is now handled by useEffect when debouncedSearch changes
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Players</h2>
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 mb-2">Failed to load players</p>
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

  const players = playersData?.players || []
  const totalPages = playersData?.total_pages || 1

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Players</h2>
        <span className="text-sm text-gray-500">
          {playersData?.total || 0} total players
        </span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search players..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Players list */}
      {players.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {search
              ? 'No players found matching your search.'
              : 'No players yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {onPlayerSelect ? (
                <button
                  type="button"
                  className="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded"
                  onClick={() => onPlayerSelect(player)}
                  aria-label={`View details for ${player.name}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {player.name}
                      </h3>
                      {player.email && (
                        <p className="text-sm text-gray-600">{player.email}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <CompactTrueSkillRating player={player} />
                      <p className="text-xs text-gray-500">
                        {player.games_played} games •{' '}
                        {player.win_percentage.toFixed(1)}% wins
                      </p>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {player.name}
                      </h3>
                      {player.email && (
                        <p className="text-sm text-gray-600">{player.email}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <CompactTrueSkillRating player={player} />
                      <p className="text-xs text-gray-500">
                        {player.games_played} games •{' '}
                        {player.win_percentage.toFixed(1)}% wins
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {showActions && (
                <div className="ml-4 flex gap-2">
                  {onPlayerEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onPlayerEdit(player)
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                  )}
                  {onPlayerDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onPlayerDelete(player)
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
