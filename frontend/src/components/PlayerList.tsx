// ABOUTME: Component for displaying a list of players with search and pagination
// ABOUTME: Handles loading states, errors, and provides player management actions

import { useEffect, useState } from 'react'
import { usePlayers } from '../hooks/useApi'
import { useDebounce } from '../hooks/useDebounce'
import type { Player } from '../types/player'
import { LoadingSkeleton } from './LoadingSpinner'
import { CompactTrueSkillRating } from './TrueSkillRating'
import { GhostButton, OutlineButton } from './ui/Button'
import Card, { CardHeader } from './ui/Card'

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
      <Card>
        <CardHeader title="Players" />
        <div className="mb-6">
          <div className="w-full h-12 bg-neutral-200 dark:bg-dark-border rounded-lg animate-pulse"></div>
        </div>
        <LoadingSkeleton rows={pageSize} />
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Players" />
        <div className="text-center py-8">
          <div className="p-6 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
            <p className="text-danger-600 dark:text-danger-400 mb-4 font-medium">
              Failed to load players
            </p>
            <OutlineButton onClick={() => refetch()} size="sm">
              Try Again
            </OutlineButton>
          </div>
        </div>
      </Card>
    )
  }

  const players = playersData?.players || []
  const totalPages = playersData?.total_pages || 1

  return (
    <Card>
      <CardHeader
        title="Players"
        subtitle={`${playersData?.total || 0} total players`}
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search players..."
            className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-dark-border bg-neutral-0 dark:bg-dark-surface text-neutral-900 dark:text-dark-text placeholder-neutral-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
          />
        </div>
      </div>

      {/* Players list */}
      {players.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">
            {search
              ? 'No players found matching your search.'
              : 'No players yet.'}
          </p>
          {search && (
            <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-2">
              Try adjusting your search terms
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.id}
              className="group p-4 border border-neutral-200 dark:border-dark-border rounded-lg hover:bg-neutral-50 dark:hover:bg-dark-border transition-all duration-200 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800"
            >
              {onPlayerSelect ? (
                <button
                  type="button"
                  className="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset rounded-lg"
                  onClick={() => onPlayerSelect(player)}
                  aria-label={`View details for ${player.name}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 transition-colors">
                        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-dark-text group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                          {player.name}
                        </h3>
                        {player.email && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {player.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <CompactTrueSkillRating player={player} />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {player.games_played} games •{' '}
                        {player.win_percentage.toFixed(1)}% wins
                      </p>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-dark-text">
                        {player.name}
                      </h3>
                      {player.email && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {player.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <CompactTrueSkillRating player={player} />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {player.games_played} games •{' '}
                      {player.win_percentage.toFixed(1)}% wins
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {showActions && (
                <div className="ml-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {onPlayerEdit && (
                    <GhostButton
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPlayerEdit(player)
                      }}
                      className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                      Edit
                    </GhostButton>
                  )}
                  {onPlayerDelete && (
                    <GhostButton
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPlayerDelete(player)
                      }}
                      className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                    >
                      Delete
                    </GhostButton>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-neutral-100 dark:border-dark-border">
          <OutlineButton
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            leftIcon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            }
          >
            Previous
          </OutlineButton>

          <div className="flex items-center gap-1">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Page
            </span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-dark-text px-2 py-1 bg-primary-50 dark:bg-primary-900/20 rounded">
              {page}
            </span>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              of {totalPages}
            </span>
          </div>

          <OutlineButton
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            rightIcon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            }
          >
            Next
          </OutlineButton>
        </div>
      )}
    </Card>
  )
}
