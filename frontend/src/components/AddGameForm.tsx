// ABOUTME: Form component for creating new games with player selection and validation
// ABOUTME: Uses TanStack Query mutation for API calls and React state for form handling

import { useState } from 'react'
import { useCreateGame, usePlayers } from '../hooks/useApi'
import type { GameCreate } from '../types/game'

interface AddGameFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AddGameForm({ onSuccess, onCancel }: AddGameFormProps) {
  const [formData, setFormData] = useState<GameCreate>({
    player1_id: 0,
    player2_id: 0,
    winner_id: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch active players for the dropdown
  const { data: playersResponse, isLoading: isLoadingPlayers } = usePlayers({
    page: 1,
    page_size: 100,
    active_only: true,
  })

  const createGameMutation = useCreateGame()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Player 1 validation
    if (!formData.player1_id) {
      newErrors.player1_id = 'Please select Player 1'
    }

    // Player 2 validation
    if (!formData.player2_id) {
      newErrors.player2_id = 'Please select Player 2'
    }

    // Check if players are different
    if (
      formData.player1_id &&
      formData.player2_id &&
      formData.player1_id === formData.player2_id
    ) {
      newErrors.player2_id = 'Player 2 must be different from Player 1'
    }

    // Winner validation
    if (!formData.winner_id) {
      newErrors.winner_id = 'Please select the winner'
    } else if (
      formData.winner_id !== formData.player1_id &&
      formData.winner_id !== formData.player2_id
    ) {
      newErrors.winner_id = 'Winner must be one of the selected players'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await createGameMutation.mutateAsync(formData)

      // Reset form
      setFormData({
        player1_id: 0,
        player2_id: 0,
        winner_id: 0,
      })
      setErrors({})

      // Call success callback
      onSuccess?.()
    } catch (error) {
      // Handle API errors
      if (error && typeof error === 'object' && 'message' in error) {
        setErrors({ submit: error.message as string })
      } else {
        setErrors({ submit: 'Failed to record game. Please try again.' })
      }
    }
  }

  const handleSelectChange =
    (field: keyof GameCreate) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(e.target.value, 10)
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))

      // Clear field error when user makes a selection
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: '',
        }))
      }

      // Auto-clear winner if it's no longer valid
      if (field === 'player1_id' || field === 'player2_id') {
        const updatedData = { ...formData, [field]: value }
        if (
          updatedData.winner_id &&
          updatedData.winner_id !== updatedData.player1_id &&
          updatedData.winner_id !== updatedData.player2_id
        ) {
          setFormData((prev) => ({
            ...prev,
            [field]: value,
            winner_id: 0,
          }))
        }
      }
    }

  const players = playersResponse?.players || []
  const availableWinners = players.filter(
    (player) =>
      player.id === formData.player1_id || player.id === formData.player2_id
  )

  if (isLoadingPlayers) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (players.length < 2) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Game</h2>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            You need at least 2 active players to record a game.{' '}
            <span className="font-medium">
              Current active players: {players.length}
            </span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Game</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Player 1 field */}
        <div>
          <label
            htmlFor="player1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Player 1 *
          </label>
          <select
            id="player1"
            value={formData.player1_id.toString()}
            onChange={handleSelectChange('player1_id')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.player1_id
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
            disabled={createGameMutation.isPending}
          >
            <option value={0}>Select Player 1</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
          {errors.player1_id && (
            <p className="mt-1 text-sm text-red-600">{errors.player1_id}</p>
          )}
        </div>

        {/* Player 2 field */}
        <div>
          <label
            htmlFor="player2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Player 2 *
          </label>
          <select
            id="player2"
            value={formData.player2_id.toString()}
            onChange={handleSelectChange('player2_id')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.player2_id
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
            disabled={createGameMutation.isPending}
          >
            <option value={0}>Select Player 2</option>
            {players
              .filter((player) => player.id !== formData.player1_id)
              .map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
          </select>
          {errors.player2_id && (
            <p className="mt-1 text-sm text-red-600">{errors.player2_id}</p>
          )}
        </div>

        {/* Winner field */}
        <div>
          <label
            htmlFor="winner"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Winner *
          </label>
          <select
            id="winner"
            value={formData.winner_id.toString()}
            onChange={handleSelectChange('winner_id')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.winner_id
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
            disabled={
              createGameMutation.isPending || availableWinners.length === 0
            }
          >
            <option value={0}>
              {availableWinners.length === 0
                ? 'Select both players first'
                : 'Select winner'}
            </option>
            {availableWinners.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
          {errors.winner_id && (
            <p className="mt-1 text-sm text-red-600">{errors.winner_id}</p>
          )}
        </div>

        {/* Submit error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={createGameMutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createGameMutation.isPending ? 'Recording...' : 'Record Game'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={createGameMutation.isPending}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
