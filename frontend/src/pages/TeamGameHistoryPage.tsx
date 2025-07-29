// ABOUTME: Full team game history page with comprehensive filtering and pagination
// ABOUTME: Dedicated page for browsing all team games with advanced search capabilities

import TeamGameHistory from '../components/TeamGameHistory'

export default function TeamGameHistoryPage() {
  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-dark-text bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Team Game History
          </h1>
          <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Browse all team games, filter by teams, and explore match history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main game history */}
          <div className="lg:col-span-3">
            <TeamGameHistory />
          </div>

          {/* Sidebar with quick stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <a
                  href="/team-games"
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                >
                  → Record New Team Game
                </a>
                <a
                  href="/teams"
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                >
                  → View Team Leaderboard
                </a>
                <a
                  href="/games"
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                >
                  → Individual Game History
                </a>
                <a
                  href="/leaderboard"
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                >
                  → Individual Leaderboard
                </a>
              </div>
            </div>

            {/* Team Game Tips */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
                Team Game System
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <div>
                    <strong>Dual Ratings:</strong> Both team and individual
                    player ratings are updated from team games.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <div>
                    <strong>Auto Teams:</strong> Teams are automatically created
                    when players form new partnerships.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <div>
                    <strong>TrueSkill:</strong> Advanced algorithm accounts for
                    team chemistry and individual skill.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <div>
                    <strong>Match Quality:</strong> System suggests balanced
                    matchups for competitive games.
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tips */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/10 dark:to-accent-900/10 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-200 mb-4">
                💡 Pro Tips
              </h3>
              <div className="space-y-2 text-sm text-primary-800 dark:text-primary-300">
                <p>• Use team filters to track specific partnerships</p>
                <p>• Game IDs help reference specific matches</p>
                <p>• Rating changes show team progression over time</p>
                <p>• Match dates help identify playing patterns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
