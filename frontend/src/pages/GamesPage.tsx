// ABOUTME: Complete games management page with game submission and history viewing
// ABOUTME: Combines AddGameForm and RecentGamesList for full game management experience

import { useState } from 'react'
import AddGameForm from '../components/AddGameForm'
import RecentGamesList from '../components/RecentGamesList'
import { PrimaryButton, SecondaryButton } from '../components/ui/Button'

export default function GamesPage() {
  const [showAddForm, setShowAddForm] = useState(false)

  const handleGameAdded = () => {
    setShowAddForm(false)
    // The RecentGamesList will automatically refresh due to query invalidation
  }

  const handleCancelAdd = () => {
    setShowAddForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Games
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Record new games and view match history
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              {!showAddForm && (
                <PrimaryButton
                  onClick={() => setShowAddForm(true)}
                  className="w-full sm:w-auto"
                >
                  🎮 Record New Game
                </PrimaryButton>
              )}
            </div>
          </div>
        </div>

        {/* Add Game Form */}
        {showAddForm && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Record New Game
                </h2>
                <SecondaryButton onClick={handleCancelAdd}>
                  Cancel
                </SecondaryButton>
              </div>
              <AddGameForm
                onSuccess={handleGameAdded}
                onCancel={handleCancelAdd}
              />
            </div>
          </div>
        )}

        {/* Games List */}
        <div className="space-y-6">
          <RecentGamesList showPagination={true} limit={20} />
        </div>
      </div>
    </div>
  )
}
