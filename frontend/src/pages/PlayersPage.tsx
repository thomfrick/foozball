// ABOUTME: Main players page that orchestrates all player management functionality
// ABOUTME: Combines list, add, detail, and delete components with state management

import { useState } from 'react'
import AddPlayerForm from '../components/AddPlayerForm'
import DeletePlayerConfirm from '../components/DeletePlayerConfirm'
import PlayerDetail from '../components/PlayerDetail'
import PlayerList from '../components/PlayerList'
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Player Management
          </h1>

          {viewMode === 'list' && (
            <button
              onClick={handleAddPlayer}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add New Player
            </button>
          )}

          {viewMode !== 'list' && (
            <button
              onClick={handleBackToList}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Back to List
            </button>
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
