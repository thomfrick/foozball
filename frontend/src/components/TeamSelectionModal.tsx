// ABOUTME: Modal component for selecting or creating teams with player search functionality
// ABOUTME: Provides both existing team selection and new team creation from player pairs

import { useMemo, useState } from 'react'
import {
  useCreateTeam,
  usePlayers,
  useSearchTeamByPlayers,
  useTeams,
} from '../hooks/useApi'
import { useDebounce } from '../hooks/useDebounce'
import type { Team } from '../types/team'
import { LoadingSkeleton } from './LoadingSpinner'
import { OutlineButton, PrimaryButton } from './ui/Button'
import { TeamCard } from './ui/Card'
import Modal from './ui/Modal'

interface TeamSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onTeamSelected: (team: Team) => void
  title?: string
  excludeTeamIds?: number[]
}

export default function TeamSelectionModal({
  isOpen,
  onClose,
  onTeamSelected,
  title = 'Select Team',
  excludeTeamIds = [],
}: TeamSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMode, setSelectedMode] = useState<'existing' | 'create'>(
    'existing'
  )
  const [selectedPlayer1Id, setSelectedPlayer1Id] = useState<number>(0)
  const [selectedPlayer2Id, setSelectedPlayer2Id] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(1)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Fetch teams for existing selection
  const {
    data: teamsData,
    isLoading: isLoadingTeams,
    error: teamsError,
  } = useTeams({
    page: currentPage,
    page_size: 10,
  })

  // Fetch players for new team creation
  const { data: playersData, isLoading: isLoadingPlayers } = usePlayers({
    page: 1,
    page_size: 100,
    active_only: true,
    search: debouncedSearchQuery,
  })

  // Search for existing team by selected players
  const { data: existingTeamData } = useSearchTeamByPlayers(
    selectedPlayer1Id,
    selectedPlayer2Id
  )

  const createTeamMutation = useCreateTeam()

  const players = useMemo(() => {
    return playersData?.players || []
  }, [playersData?.players])

  const teams = useMemo(() => {
    const allTeams = teamsData?.teams || []
    return allTeams.filter((team) => !excludeTeamIds.includes(team.id))
  }, [teamsData?.teams, excludeTeamIds])

  const filteredTeams = useMemo(() => {
    if (!debouncedSearchQuery) return teams

    return teams.filter(
      (team) =>
        team.player1.name
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        team.player2.name
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        team.player_names
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase())
    )
  }, [teams, debouncedSearchQuery])

  const availablePlayer2Options = useMemo(() => {
    return players.filter((player) => player.id !== selectedPlayer1Id)
  }, [players, selectedPlayer1Id])

  const handleCreateTeam = async () => {
    if (!selectedPlayer1Id || !selectedPlayer2Id) return

    try {
      // Check if team already exists
      if (existingTeamData?.team) {
        onTeamSelected(existingTeamData.team)
        handleClose()
        return
      }

      // Create new team
      const newTeam = await createTeamMutation.mutateAsync({
        player1_id: Math.min(selectedPlayer1Id, selectedPlayer2Id),
        player2_id: Math.max(selectedPlayer1Id, selectedPlayer2Id),
      })

      onTeamSelected(newTeam)
      handleClose()
    } catch {
      // Error handling is managed by the mutation
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSelectedMode('existing')
    setSelectedPlayer1Id(0)
    setSelectedPlayer2Id(0)
    setCurrentPage(1)
    onClose()
  }

  const actions =
    selectedMode === 'create' ? (
      <>
        <OutlineButton onClick={() => setSelectedMode('existing')}>
          Back to Teams
        </OutlineButton>
        <PrimaryButton
          onClick={handleCreateTeam}
          disabled={!selectedPlayer1Id || !selectedPlayer2Id}
          isLoading={createTeamMutation.isPending}
          loadingText="Creating..."
        >
          {existingTeamData?.team ? 'Select Existing Team' : 'Create Team'}
        </PrimaryButton>
      </>
    ) : (
      <>
        <OutlineButton onClick={handleClose}>Cancel</OutlineButton>
        <OutlineButton onClick={() => setSelectedMode('create')}>
          Create New Team
        </OutlineButton>
      </>
    )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="lg"
      actions={actions}
    >
      <div className="space-y-6">
        {selectedMode === 'existing' ? (
          <>
            {/* Search */}
            <div>
              <label
                htmlFor="team-search"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Search teams by player names
              </label>
              <input
                id="team-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-background dark:text-dark-text"
              />
            </div>

            {/* Teams List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {isLoadingTeams ? (
                <LoadingSkeleton rows={3} />
              ) : teamsError ? (
                <div className="text-red-600 text-center py-4">
                  Failed to load teams. Please try again.
                </div>
              ) : filteredTeams.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {debouncedSearchQuery
                    ? 'No teams found matching your search.'
                    : 'No teams available.'}
                  <p className="text-sm mt-2">
                    Create a new team to get started!
                  </p>
                </div>
              ) : (
                filteredTeams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onClick={() => {
                      onTeamSelected(team)
                      handleClose()
                    }}
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {teamsData &&
              teamsData.total_pages > 1 &&
              !debouncedSearchQuery && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {teamsData.total_pages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <OutlineButton
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      size="sm"
                    >
                      Previous
                    </OutlineButton>
                    <OutlineButton
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(teamsData.total_pages, p + 1)
                        )
                      }
                      disabled={currentPage >= teamsData.total_pages}
                      size="sm"
                    >
                      Next
                    </OutlineButton>
                  </div>
                </div>
              )}
          </>
        ) : (
          <>
            {/* Create New Team */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                Create New Team
              </h3>

              {/* Player Search */}
              <div>
                <label
                  htmlFor="player-search"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Search players
                </label>
                <input
                  id="player-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search players..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-background dark:text-dark-text"
                />
              </div>

              {/* Player Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Player 1 */}
                <div>
                  <label
                    htmlFor="player1"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Player 1 *
                  </label>
                  <select
                    id="player1"
                    value={selectedPlayer1Id}
                    onChange={(e) =>
                      setSelectedPlayer1Id(parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-background dark:text-dark-text"
                  >
                    <option value={0}>Select Player 1</option>
                    {players.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Player 2 */}
                <div>
                  <label
                    htmlFor="player2"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Player 2 *
                  </label>
                  <select
                    id="player2"
                    value={selectedPlayer2Id}
                    onChange={(e) =>
                      setSelectedPlayer2Id(parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-background dark:text-dark-text"
                    disabled={selectedPlayer1Id === 0}
                  >
                    <option value={0}>
                      {selectedPlayer1Id === 0
                        ? 'Select Player 1 first'
                        : 'Select Player 2'}
                    </option>
                    {availablePlayer2Options.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Existing Team Warning */}
              {existingTeamData?.team &&
                selectedPlayer1Id &&
                selectedPlayer2Id && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-md">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Team Already Exists
                        </h3>
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                          <p>
                            This team combination already exists. You can select
                            the existing team instead of creating a new one.
                          </p>
                        </div>
                        <div className="mt-3">
                          <TeamCard
                            team={existingTeamData.team}
                            showRating={true}
                            className="bg-white dark:bg-dark-surface"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Loading Players */}
              {isLoadingPlayers && (
                <div className="text-center py-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Loading players...
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
