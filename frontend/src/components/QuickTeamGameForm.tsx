// ABOUTME: Form component for quick team game creation with 4-player selection
// ABOUTME: Uses automatic team creation via TeamFormationRequest API endpoint

import { useState } from 'react'
import { useCreateQuickTeamGame, usePlayers } from '../hooks/useApi'
import type { TeamFormationRequest } from '../types/team'
import { LoadingSkeleton } from './LoadingSpinner'
import { OutlineButton, PrimaryButton } from './ui/Button'

interface QuickTeamGameFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function QuickTeamGameForm({
  onSuccess,
  onCancel,
}: QuickTeamGameFormProps) {
  const [formData, setFormData] = useState<TeamFormationRequest>({
    player1_id: 0,
    player2_id: 0,
    player3_id: 0,
    player4_id: 0,
    winner_team: 1,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch active players for the dropdown
  const { data: playersResponse, isLoading: isLoadingPlayers } = usePlayers({
    page: 1,
    page_size: 100,
    active_only: true,
  })

  const createTeamGameMutation = useCreateQuickTeamGame()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    const playerIds = [
      formData.player1_id,
      formData.player2_id,
      formData.player3_id,
      formData.player4_id,
    ]

    // Validate all players are selected
    if (!formData.player1_id)
      newErrors.player1_id = 'Please select Team 1 Player 1'
    if (!formData.player2_id)
      newErrors.player2_id = 'Please select Team 1 Player 2'
    if (!formData.player3_id)
      newErrors.player3_id = 'Please select Team 2 Player 1'
    if (!formData.player4_id)
      newErrors.player4_id = 'Please select Team 2 Player 2'

    // Check for duplicate players
    const uniquePlayerIds = new Set(playerIds.filter((id) => id > 0))
    if (uniquePlayerIds.size !== playerIds.filter((id) => id > 0).length) {
      newErrors.duplicate = 'All players must be different'
    }

    // Winner team validation
    if (!formData.winner_team) {
      newErrors.winner_team = 'Please select the winning team'
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
      await createTeamGameMutation.mutateAsync(formData)

      // Reset form
      setFormData({
        player1_id: 0,
        player2_id: 0,
        player3_id: 0,
        player4_id: 0,
        winner_team: 1,
      })
      setErrors({})

      // Call success callback
      onSuccess?.()
    } catch (error) {
      // Handle API errors
      if (error && typeof error === 'object' && 'message' in error) {
        setErrors({ submit: error.message as string })
      } else {
        setErrors({ submit: 'Failed to record team game. Please try again.' })
      }
    }
  }

  const handleSelectChange =
    (field: keyof TeamFormationRequest) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      const value =
        field === 'winner_team'
          ? (parseInt(e.target.value, 10) as 1 | 2)
          : parseInt(e.target.value, 10)
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

      // Clear duplicate error when any player changes
      if (field.includes('player') && errors.duplicate) {
        setErrors((prev) => ({
          ...prev,
          duplicate: '',
        }))
      }
    }

  const players = playersResponse?.players || []
  const selectedPlayerIds = [
    formData.player1_id,
    formData.player2_id,
    formData.player3_id,
    formData.player4_id,
  ]

  const getAvailablePlayersFor = (currentField: keyof TeamFormationRequest) => {
    return players.filter(
      (player) =>
        !selectedPlayerIds.includes(player.id) ||
        formData[currentField] === player.id
    )
  }

  if (isLoadingPlayers) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Quick Team Game</h2>
        <LoadingSkeleton rows={5} />
      </div>
    )
  }

  if (players.length < 4) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Quick Team Game
        </h2>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            You need at least 4 active players to record a team game.{' '}
            <span className="font-medium">
              Current active players: {players.length}
            </span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-6">
        Quick Team Game
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Select 4 players and the winning team. Teams will be created
        automatically.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Team 1 Section */}
        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Team 1
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team 1 Player 1 */}
            <div>
              <label
                htmlFor="player1"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Player 1 *
              </label>
              <select
                id="player1"
                value={formData.player1_id.toString()}
                onChange={handleSelectChange('player1_id')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-background dark:border-dark-border dark:text-dark-text ${
                  errors.player1_id
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={createTeamGameMutation.isPending}
              >
                <option value={0}>Select Player 1</option>
                {getAvailablePlayersFor('player1_id').map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
              {errors.player1_id && (
                <p className="mt-1 text-sm text-red-600">{errors.player1_id}</p>
              )}
            </div>

            {/* Team 1 Player 2 */}
            <div>
              <label
                htmlFor="player2"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Player 2 *
              </label>
              <select
                id="player2"
                value={formData.player2_id.toString()}
                onChange={handleSelectChange('player2_id')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-background dark:border-dark-border dark:text-dark-text ${
                  errors.player2_id
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={createTeamGameMutation.isPending}
              >
                <option value={0}>Select Player 2</option>
                {getAvailablePlayersFor('player2_id').map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
              {errors.player2_id && (
                <p className="mt-1 text-sm text-red-600">{errors.player2_id}</p>
              )}
            </div>
          </div>
        </div>

        {/* Team 2 Section */}
        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
            Team 2
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team 2 Player 1 */}
            <div>
              <label
                htmlFor="player3"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Player 1 *
              </label>
              <select
                id="player3"
                value={formData.player3_id.toString()}
                onChange={handleSelectChange('player3_id')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-background dark:border-dark-border dark:text-dark-text ${
                  errors.player3_id
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={createTeamGameMutation.isPending}
              >
                <option value={0}>Select Player 1</option>
                {getAvailablePlayersFor('player3_id').map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
              {errors.player3_id && (
                <p className="mt-1 text-sm text-red-600">{errors.player3_id}</p>
              )}
            </div>

            {/* Team 2 Player 2 */}
            <div>
              <label
                htmlFor="player4"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Player 2 *
              </label>
              <select
                id="player4"
                value={formData.player4_id.toString()}
                onChange={handleSelectChange('player4_id')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-background dark:border-dark-border dark:text-dark-text ${
                  errors.player4_id
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={createTeamGameMutation.isPending}
              >
                <option value={0}>Select Player 2</option>
                {getAvailablePlayersFor('player4_id').map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
              {errors.player4_id && (
                <p className="mt-1 text-sm text-red-600">{errors.player4_id}</p>
              )}
            </div>
          </div>
        </div>

        {/* Winner Selection */}
        <div>
          <label
            htmlFor="winner_team"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Winning Team *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-background">
              <input
                type="radio"
                name="winner_team"
                value={1}
                checked={formData.winner_team === 1}
                onChange={handleSelectChange('winner_team')}
                className="mr-3"
                disabled={createTeamGameMutation.isPending}
              />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  Team 1
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.player1_id && formData.player2_id
                    ? `${players.find((p) => p.id === formData.player1_id)?.name || 'Player 1'} & ${players.find((p) => p.id === formData.player2_id)?.name || 'Player 2'}`
                    : 'Select players first'}
                </div>
              </div>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-background">
              <input
                type="radio"
                name="winner_team"
                value={2}
                checked={formData.winner_team === 2}
                onChange={handleSelectChange('winner_team')}
                className="mr-3"
                disabled={createTeamGameMutation.isPending}
              />
              <div>
                <div className="font-medium text-green-900 dark:text-green-100">
                  Team 2
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.player3_id && formData.player4_id
                    ? `${players.find((p) => p.id === formData.player3_id)?.name || 'Player 1'} & ${players.find((p) => p.id === formData.player4_id)?.name || 'Player 2'}`
                    : 'Select players first'}
                </div>
              </div>
            </label>
          </div>
          {errors.winner_team && (
            <p className="mt-1 text-sm text-red-600">{errors.winner_team}</p>
          )}
        </div>

        {/* Duplicate players error */}
        {errors.duplicate && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.duplicate}</p>
          </div>
        )}

        {/* Submit error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <PrimaryButton
            type="submit"
            isLoading={createTeamGameMutation.isPending}
            loadingText="Recording..."
            fullWidth
            size="lg"
          >
            Record Team Game
          </PrimaryButton>

          {onCancel && (
            <OutlineButton
              type="button"
              onClick={onCancel}
              disabled={createTeamGameMutation.isPending}
              size="lg"
            >
              Cancel
            </OutlineButton>
          )}
        </div>
      </form>
    </div>
  )
}
