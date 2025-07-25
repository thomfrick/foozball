// ABOUTME: Component for displaying detailed player information and statistics
// ABOUTME: Shows player profile, TrueSkill rating, game statistics, and recent activity

import { usePlayer } from '../hooks/useApi'
import type { Player } from '../types/player'

interface PlayerDetailProps {
  playerId: number
  onEdit?: (player: Player) => void
  onDelete?: (player: Player) => void
  onClose?: () => void
}

export default function PlayerDetail({
  playerId,
  onEdit,
  onDelete,
  onClose,
}: PlayerDetailProps) {
  const { data: player, isLoading, error, refetch } = usePlayer(playerId)

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Player Details
          </h2>
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 mb-2">Failed to load player details</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => refetch()}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Try Again
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatRating = (mu: number, sigma: number) => {
    return `${mu.toFixed(1)} ± ${sigma.toFixed(1)}`
  }

  const getSkillLevel = (mu: number) => {
    if (mu >= 35) return { level: 'Expert', color: 'text-purple-600' }
    if (mu >= 30) return { level: 'Advanced', color: 'text-blue-600' }
    if (mu >= 25) return { level: 'Intermediate', color: 'text-green-600' }
    if (mu >= 20) return { level: 'Beginner', color: 'text-yellow-600' }
    return { level: 'New Player', color: 'text-gray-600' }
  }

  const skillLevel = getSkillLevel(player.trueskill_mu)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{player.name}</h2>
          {player.email && <p className="text-gray-600 mt-1">{player.email}</p>}
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(player)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(player)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Rating Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            TrueSkill Rating
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-2xl font-bold text-blue-600">
                {formatRating(player.trueskill_mu, player.trueskill_sigma)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <span className={`font-medium ${skillLevel.color}`}>
                {skillLevel.level}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Skill: {player.trueskill_mu.toFixed(1)} • Uncertainty:{' '}
              {player.trueskill_sigma.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Game Statistics
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Games Played:</span>
              <span className="font-semibold">{player.games_played}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wins:</span>
              <span className="font-semibold text-green-600">
                {player.wins}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Losses:</span>
              <span className="font-semibold text-red-600">
                {player.losses}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Win Rate:</span>
              <span className="font-semibold">
                {player.win_percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Player Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Player Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Member Since:</span>
            <p className="font-medium">{formatDate(player.created_at)}</p>
          </div>
          {player.updated_at && (
            <div>
              <span className="text-sm text-gray-600">Last Updated:</span>
              <p className="font-medium">{formatDate(player.updated_at)}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-600">Status:</span>
            <p
              className={`font-medium ${player.is_active ? 'text-green-600' : 'text-red-600'}`}
            >
              {player.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Player ID:</span>
            <p className="font-mono text-sm">{player.id}</p>
          </div>
        </div>
      </div>

      {/* TrueSkill Explanation */}
      {player.games_played < 5 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>New Player:</strong> TrueSkill ratings become more accurate
            after playing more games. The uncertainty (±
            {player.trueskill_sigma.toFixed(1)}) will decrease as more games are
            played.
          </p>
        </div>
      )}
    </div>
  )
}
