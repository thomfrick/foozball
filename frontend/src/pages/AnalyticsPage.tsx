// ABOUTME: Analytics dashboard page showcasing data visualization components
// ABOUTME: Responsive layout with player selection and multiple chart types

import React, { useState } from 'react'
import InteractiveRatingChart from '../components/InteractiveRatingChart'
import LoadingSpinner from '../components/LoadingSpinner'
import MultiPlayerComparisonChart from '../components/MultiPlayerComparisonChart'
import RatingProgressionChart from '../components/RatingProgressionChart'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import WinLossStreakChart from '../components/WinLossStreakChart'
import { usePlayers } from '../hooks/useApi'
import type { Player } from '../types/player'

const AnalyticsPage: React.FC = () => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(0)
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<
    'single' | 'comparison' | 'interactive'
  >('single')

  const { data: playersData, isLoading: playersLoading } = usePlayers({
    page_size: 100,
    active_only: true,
  })

  const selectedPlayer = playersData?.players.find(
    (p) => p.id === selectedPlayerId
  )

  const handlePlayerToggle = (playerId: number) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : prev.length < 5
          ? [...prev, playerId]
          : prev
    )
  }

  if (playersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  const players = playersData?.players || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze player performance with interactive charts and visualizations
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
          <Button
            variant={activeTab === 'single' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('single')}
          >
            Single Player
          </Button>
          <Button
            variant={activeTab === 'comparison' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('comparison')}
          >
            Player Comparison
          </Button>
          <Button
            variant={activeTab === 'interactive' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('interactive')}
          >
            Interactive Charts
          </Button>
        </div>
      </div>

      {/* Single Player Tab */}
      {activeTab === 'single' && (
        <div className="space-y-6">
          {/* Player Selection */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Select Player
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {players.map((player: Player) => (
                <Button
                  key={player.id}
                  variant={
                    selectedPlayerId === player.id ? 'primary' : 'outline'
                  }
                  size="sm"
                  onClick={() => setSelectedPlayerId(player.id)}
                  className="text-left justify-start"
                >
                  {player.name}
                </Button>
              ))}
            </div>
          </Card>

          {selectedPlayerId > 0 && selectedPlayer && (
            <div className="space-y-6">
              {/* Rating Progression Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RatingProgressionChart
                  playerId={selectedPlayerId}
                  playerName={selectedPlayer.name}
                  showConservativeRating={true}
                  showUncertainty={false}
                  height={350}
                />
                <RatingProgressionChart
                  playerId={selectedPlayerId}
                  playerName={selectedPlayer.name}
                  showConservativeRating={true}
                  showUncertainty={true}
                  height={350}
                />
              </div>

              {/* Win/Loss Streak Chart */}
              <WinLossStreakChart
                playerId={selectedPlayerId}
                playerName={selectedPlayer.name}
                height={300}
              />
            </div>
          )}

          {selectedPlayerId === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Select a player to view their analytics
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Choose from {players.length} available players above
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Player Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Player Multi-Selection */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Select Players to Compare (max 5)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {players.map((player: Player) => (
                <Button
                  key={player.id}
                  variant={
                    selectedPlayerIds.includes(player.id)
                      ? 'primary'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => handlePlayerToggle(player.id)}
                  disabled={
                    !selectedPlayerIds.includes(player.id) &&
                    selectedPlayerIds.length >= 5
                  }
                  className="text-left justify-start"
                >
                  {player.name}
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Selected: {selectedPlayerIds.length}/5 players
            </p>
          </Card>

          {selectedPlayerIds.length >= 2 && (
            <MultiPlayerComparisonChart
              playerIds={selectedPlayerIds}
              showConservativeRating={true}
              height={450}
            />
          )}

          {selectedPlayerIds.length < 2 && (
            <Card className="p-12">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Select at least 2 players to compare
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Choose players above to see their rating progression
                  comparison
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Interactive Charts Tab */}
      {activeTab === 'interactive' && (
        <div className="space-y-6">
          {/* Player Selection for Interactive */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Select Player for Interactive Analysis
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {players.map((player: Player) => (
                <Button
                  key={player.id}
                  variant={
                    selectedPlayerId === player.id ? 'primary' : 'outline'
                  }
                  size="sm"
                  onClick={() => setSelectedPlayerId(player.id)}
                  className="text-left justify-start"
                >
                  {player.name}
                </Button>
              ))}
            </div>
          </Card>

          {selectedPlayerId > 0 && selectedPlayer && (
            <InteractiveRatingChart
              playerId={selectedPlayerId}
              playerName={selectedPlayer.name}
              height={600}
              limit={500}
            />
          )}

          {selectedPlayerId === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Select a player for interactive analysis
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Interactive charts include zooming, filtering, and advanced
                  controls
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default AnalyticsPage
