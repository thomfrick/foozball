// ABOUTME: Team games page for recording and viewing team games
// ABOUTME: Central hub for team game management with quick and advanced forms

import { useState } from 'react'
import AdvancedTeamGameForm from '../components/AdvancedTeamGameForm'
import QuickTeamGameForm from '../components/QuickTeamGameForm'
import TeamGameHistory from '../components/TeamGameHistory'
import { PrimaryButton } from '../components/ui/Button'
import Card, { CardContent, CardHeader } from '../components/ui/Card'

export default function TeamGamesPage() {
  const [activeForm, setActiveForm] = useState<'none' | 'quick' | 'advanced'>(
    'none'
  )

  const handleGameRecorded = () => {
    setActiveForm('none')
    // Could add a success message here
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-dark-text bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Team Games
          </h1>
          <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Record 2v2 foosball matches and track team performance
          </p>
        </div>

        {activeForm === 'none' ? (
          <div className="space-y-6">
            {/* Game Recording Options */}
            <Card variant="elevated" padding="lg">
              <CardHeader
                title="Record Team Game"
                subtitle="Choose your preferred method to record a team game"
              />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quick Entry */}
                  <div className="p-6 border-2 border-dashed border-primary-200 dark:border-primary-800 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                    <div className="text-center">
                      <div className="text-4xl mb-4">⚡</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">
                        Quick Entry
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Select 4 players and winning team. Teams are created
                        automatically.
                      </p>
                      <PrimaryButton
                        onClick={() => setActiveForm('quick')}
                        size="lg"
                        fullWidth
                      >
                        Start Quick Entry
                      </PrimaryButton>
                    </div>
                  </div>

                  {/* Advanced Entry */}
                  <div className="p-6 border-2 border-dashed border-secondary-200 dark:border-secondary-800 rounded-lg hover:border-secondary-300 dark:hover:border-secondary-700 transition-colors">
                    <div className="text-center">
                      <div className="text-4xl mb-4">⚙️</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">
                        Advanced Entry
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Select from existing teams with match quality
                        indicators.
                      </p>
                      <PrimaryButton
                        onClick={() => setActiveForm('advanced')}
                        size="lg"
                        fullWidth
                        variant="secondary"
                      >
                        Start Advanced Entry
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Team Games */}
            <TeamGameHistory limit={5} />
          </div>
        ) : activeForm === 'quick' ? (
          <div>
            <QuickTeamGameForm
              onSuccess={handleGameRecorded}
              onCancel={() => setActiveForm('none')}
            />
          </div>
        ) : (
          <div>
            <AdvancedTeamGameForm
              onSuccess={handleGameRecorded}
              onCancel={() => setActiveForm('none')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
