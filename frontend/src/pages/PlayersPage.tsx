// ABOUTME: Modern players page with professional design and state management
// ABOUTME: Features beautiful cards, buttons, and responsive layout

import { useState } from 'react'
import AddPlayerForm from '../components/AddPlayerForm'
import DeletePlayerConfirm from '../components/DeletePlayerConfirm'
import PlayerDetail from '../components/PlayerDetail'
import PlayerList from '../components/PlayerList'
import { OutlineButton, PrimaryButton } from '../components/ui/Button'
import type { Player } from '../types/player'

type ViewMode = 'list' | 'add' | 'detail'

export default function PlayersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null)

  const handleAddPlayer = () => {
    setViewMode('add')
    setSelectedPlayer(null)
  }

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player)
    setViewMode('detail')
  }

  const handlePlayerEdit = (player: Player) => {
    // For now, just show the detail view
    // TODO: Implement edit form component
    setSelectedPlayer(player)
    setViewMode('detail')
  }

  const handlePlayerDelete = (player: Player) => {
    setPlayerToDelete(player)
  }

  const handleDeleteConfirm = () => {
    setPlayerToDelete(null)
    // If we're viewing the deleted player's detail, go back to list
    if (selectedPlayer?.id === playerToDelete?.id) {
      setViewMode('list')
      setSelectedPlayer(null)
    }
  }

  const handleDeleteCancel = () => {
    setPlayerToDelete(null)
  }

  const handleAddSuccess = () => {
    setViewMode('list')
  }

  const handleAddCancel = () => {
    setViewMode('list')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedPlayer(null)
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="text-center sm:text-left">
            <div className="text-5xl mb-3">👥</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-dark-text bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Player Management
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Manage your foosball players and track their progress
            </p>
          </div>

          {viewMode === 'list' && (
            <PrimaryButton
              onClick={handleAddPlayer}
              leftIcon={<span>➕</span>}
              size="lg"
            >
              Add New Player
            </PrimaryButton>
          )}

          {viewMode !== 'list' && (
            <OutlineButton
              onClick={handleBackToList}
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
              size="lg"
            >
              Back to List
            </OutlineButton>
          )}
        </div>

        {/* Main Content */}
        {viewMode === 'list' && (
          <PlayerList
            onPlayerSelect={handlePlayerSelect}
            onPlayerEdit={handlePlayerEdit}
            onPlayerDelete={handlePlayerDelete}
            showActions={true}
          />
        )}

        {viewMode === 'add' && (
          <AddPlayerForm
            onSuccess={handleAddSuccess}
            onCancel={handleAddCancel}
          />
        )}

        {viewMode === 'detail' && selectedPlayer && (
          <PlayerDetail
            playerId={selectedPlayer.id}
            onEdit={handlePlayerEdit}
            onDelete={handlePlayerDelete}
            onClose={handleBackToList}
          />
        )}

        {/* Delete Confirmation Modal */}
        {playerToDelete && (
          <DeletePlayerConfirm
            player={playerToDelete}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            isOpen={true}
          />
        )}
      </div>
    </div>
  )
}
