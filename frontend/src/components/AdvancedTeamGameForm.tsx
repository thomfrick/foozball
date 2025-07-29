// ABOUTME: Advanced team game form for selecting existing teams with match quality indicators
// ABOUTME: Uses TeamSelectionModal for team selection and provides detailed game recording

import { useState } from 'react'
import { useCreateTeamGame } from '../hooks/useApi'
import type { Team, TeamGameCreate } from '../types/team'
import TeamSelectionModal from './TeamSelectionModal'
import { OutlineButton, PrimaryButton } from './ui/Button'
import { TeamCard } from './ui/Card'

interface AdvancedTeamGameFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AdvancedTeamGameForm({
  onSuccess,
  onCancel,
}: AdvancedTeamGameFormProps) {
  const [selectedTeam1, setSelectedTeam1] = useState<Team | null>(null)
  const [selectedTeam2, setSelectedTeam2] = useState<Team | null>(null)
  const [winnerId, setWinnerId] = useState<number>(0)
  const [teamSelectionMode, setTeamSelectionMode] = useState<
    'team1' | 'team2' | null
  >(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createTeamGameMutation = useCreateTeamGame()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedTeam1) {
      newErrors.team1 = 'Please select Team 1'
    }

    if (!selectedTeam2) {
      newErrors.team2 = 'Please select Team 2'
    }

    if (
      selectedTeam1 &&
      selectedTeam2 &&
      selectedTeam1.id === selectedTeam2.id
    ) {
      newErrors.teams = 'Teams must be different'
    }

    if (!winnerId) {
      newErrors.winner = 'Please select the winning team'
    } else if (
      selectedTeam1 &&
      selectedTeam2 &&
      winnerId !== selectedTeam1.id &&
      winnerId !== selectedTeam2.id
    ) {
      newErrors.winner = 'Winner must be one of the selected teams'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !selectedTeam1 || !selectedTeam2) {
      return
    }

    try {
      const gameData: TeamGameCreate = {
        team1_id: selectedTeam1.id,
        team2_id: selectedTeam2.id,
        winner_team_id: winnerId,
      }

      await createTeamGameMutation.mutateAsync(gameData)

      // Reset form
      setSelectedTeam1(null)
      setSelectedTeam2(null)
      setWinnerId(0)
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

  const handleTeamSelected = (team: Team) => {
    if (teamSelectionMode === 'team1') {
      setSelectedTeam1(team)
      // Clear team2 if it's the same as team1
      if (selectedTeam2?.id === team.id) {
        setSelectedTeam2(null)
        setWinnerId(0)
      }
    } else if (teamSelectionMode === 'team2') {
      setSelectedTeam2(team)
      // Clear team1 if it's the same as team2
      if (selectedTeam1?.id === team.id) {
        setSelectedTeam1(null)
        setWinnerId(0)
      }
    }

    // Clear winner if it's no longer valid
    if (
      winnerId &&
      winnerId !== team.id &&
      (teamSelectionMode === 'team1'
        ? selectedTeam2?.id !== winnerId
        : selectedTeam1?.id !== winnerId)
    ) {
      setWinnerId(0)
    }

    // Clear errors
    if (errors.team1 || errors.team2 || errors.teams) {
      setErrors((prev) => ({
        ...prev,
        team1: '',
        team2: '',
        teams: '',
      }))
    }

    setTeamSelectionMode(null)
  }

  const getMatchQuality = (): {
    quality: number
    description: string
    color: string
  } => {
    if (!selectedTeam1 || !selectedTeam2) {
      return {
        quality: 0,
        description: 'Select both teams',
        color: 'text-gray-500',
      }
    }

    // Simple match quality calculation based on rating difference
    const ratingDiff = Math.abs(
      selectedTeam1.conservative_rating - selectedTeam2.conservative_rating
    )

    if (ratingDiff <= 5) {
      return {
        quality: 0.9,
        description: 'Excellent match',
        color: 'text-green-600 dark:text-green-400',
      }
    } else if (ratingDiff <= 10) {
      return {
        quality: 0.7,
        description: 'Good match',
        color: 'text-blue-600 dark:text-blue-400',
      }
    } else if (ratingDiff <= 20) {
      return {
        quality: 0.5,
        description: 'Fair match',
        color: 'text-yellow-600 dark:text-yellow-400',
      }
    } else {
      return {
        quality: 0.3,
        description: 'Unbalanced match',
        color: 'text-red-600 dark:text-red-400',
      }
    }
  }

  const matchQuality = getMatchQuality()
  const excludeTeamIds = selectedTeam1
    ? [selectedTeam1.id]
    : selectedTeam2
      ? [selectedTeam2.id]
      : []

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-6">
        Advanced Team Game
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Select existing teams and record the match with detailed analytics.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Team Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Team 1 *
            </label>
            {selectedTeam1 ? (
              <div className="space-y-2">
                <TeamCard
                  team={selectedTeam1}
                  className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10"
                />
                <OutlineButton
                  type="button"
                  onClick={() => setTeamSelectionMode('team1')}
                  size="sm"
                  fullWidth
                >
                  Change Team 1
                </OutlineButton>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setTeamSelectionMode('team1')}
                className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-center"
              >
                <div className="text-4xl mb-2">➕</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Team 1
                </div>
              </button>
            )}
            {errors.team1 && (
              <p className="mt-1 text-sm text-red-600">{errors.team1}</p>
            )}
          </div>

          {/* Team 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Team 2 *
            </label>
            {selectedTeam2 ? (
              <div className="space-y-2">
                <TeamCard
                  team={selectedTeam2}
                  className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
                />
                <OutlineButton
                  type="button"
                  onClick={() => setTeamSelectionMode('team2')}
                  size="sm"
                  fullWidth
                >
                  Change Team 2
                </OutlineButton>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setTeamSelectionMode('team2')}
                className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 dark:hover:border-green-500 transition-colors text-center"
              >
                <div className="text-4xl mb-2">➕</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Team 2
                </div>
              </button>
            )}
            {errors.team2 && (
              <p className="mt-1 text-sm text-red-600">{errors.team2}</p>
            )}
          </div>
        </div>

        {/* Teams Error */}
        {errors.teams && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.teams}</p>
          </div>
        )}

        {/* Match Quality Indicator */}
        {selectedTeam1 && selectedTeam2 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Match Quality
                </h3>
                <p className={`text-sm ${matchQuality.color}`}>
                  {matchQuality.description} (
                  {(matchQuality.quality * 100).toFixed(0)}%)
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      matchQuality.quality >= 0.8
                        ? 'bg-green-500'
                        : matchQuality.quality >= 0.6
                          ? 'bg-blue-500'
                          : matchQuality.quality >= 0.4
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                    }`}
                    style={{ width: `${matchQuality.quality * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Winner Selection */}
        {selectedTeam1 && selectedTeam2 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Winning Team *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-background">
                <input
                  type="radio"
                  name="winner"
                  value={selectedTeam1.id}
                  checked={winnerId === selectedTeam1.id}
                  onChange={(e) => {
                    setWinnerId(parseInt(e.target.value))
                    if (errors.winner) {
                      setErrors((prev) => ({ ...prev, winner: '' }))
                    }
                  }}
                  className="mr-3"
                  disabled={createTeamGameMutation.isPending}
                />
                <div className="flex-1">
                  <div className="font-medium text-blue-900 dark:text-blue-100">
                    {selectedTeam1.player1.name} & {selectedTeam1.player2.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Rating: {selectedTeam1.conservative_rating.toFixed(1)}
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-background">
                <input
                  type="radio"
                  name="winner"
                  value={selectedTeam2.id}
                  checked={winnerId === selectedTeam2.id}
                  onChange={(e) => {
                    setWinnerId(parseInt(e.target.value))
                    if (errors.winner) {
                      setErrors((prev) => ({ ...prev, winner: '' }))
                    }
                  }}
                  className="mr-3"
                  disabled={createTeamGameMutation.isPending}
                />
                <div className="flex-1">
                  <div className="font-medium text-green-900 dark:text-green-100">
                    {selectedTeam2.player1.name} & {selectedTeam2.player2.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Rating: {selectedTeam2.conservative_rating.toFixed(1)}
                  </div>
                </div>
              </label>
            </div>
            {errors.winner && (
              <p className="mt-1 text-sm text-red-600">{errors.winner}</p>
            )}
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
            disabled={!selectedTeam1 || !selectedTeam2}
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

      {/* Team Selection Modal */}
      <TeamSelectionModal
        isOpen={teamSelectionMode !== null}
        onClose={() => setTeamSelectionMode(null)}
        onTeamSelected={handleTeamSelected}
        title={
          teamSelectionMode === 'team1' ? 'Select Team 1' : 'Select Team 2'
        }
        excludeTeamIds={excludeTeamIds}
      />
    </div>
  )
}
