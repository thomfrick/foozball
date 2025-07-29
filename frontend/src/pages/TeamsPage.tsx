// ABOUTME: Teams page showcasing team leaderboard and team management
// ABOUTME: Central hub for all team-related activities and statistics

import TeamLeaderboard from '../components/TeamLeaderboard'

export default function TeamsPage() {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-dark-text bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Team Leaderboard
          </h1>
          <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Team rankings based on TrueSkill rating system for 2v2 matches
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main team leaderboard */}
          <div className="lg:col-span-2">
            <TeamLeaderboard limit={20} showPagination={true} />
          </div>

          {/* Sidebar with additional info */}
          <div className="space-y-6">
            {/* Team TrueSkill explanation */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
                About Team Rankings
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <strong>Team Formation:</strong> Teams are automatically
                  created from player pairs and maintain their own TrueSkill
                  ratings.
                </p>
                <p>
                  <strong>Dual Rating System:</strong> Both team ratings and
                  individual player ratings are updated from team games.
                </p>
                <p>
                  <strong>Conservative Rating:</strong> Teams are ranked by
                  their conservative rating (μ - 3σ) for fair comparison.
                </p>
                <p>
                  <strong>Team Uncertainty:</strong>
                </p>
                <ul className="ml-4 space-y-1">
                  <li>
                    <span className="text-success-600 dark:text-success-400">
                      Low σ (≤4):
                    </span>{' '}
                    High certainty
                  </li>
                  <li>
                    <span className="text-blue-600 dark:text-blue-400">
                      Medium σ (4-6):
                    </span>{' '}
                    Medium certainty
                  </li>
                  <li>
                    <span className="text-amber-600 dark:text-amber-400">
                      High σ (&gt;6):
                    </span>{' '}
                    Low certainty
                  </li>
                </ul>
              </div>
            </div>

            {/* Team stats */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
                Team System
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    New Team Rating:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    50.0 ± 16.7
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Rating Range:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    0 - 100+
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Algorithm:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Microsoft TrueSkill
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
                Team Actions
              </h3>
              <div className="space-y-2">
                <a
                  href="/team-games"
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                >
                  → Record Team Game
                </a>
                <a
                  href="/team-games/history"
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                >
                  → View Team Game History
                </a>
                <a
                  href="/leaderboard"
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                >
                  → Individual Leaderboard
                </a>
                <a
                  href="/players"
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                >
                  → View All Players
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
