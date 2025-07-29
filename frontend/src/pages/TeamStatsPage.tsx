// ABOUTME: Detailed team statistics page with comprehensive TrueSkill displays
// ABOUTME: Shows individual team performance with advanced analytics and tooltips

import { Navigate, useParams } from 'react-router-dom'
import { LoadingSkeleton } from '../components/LoadingSpinner'
import TeamGameHistory from '../components/TeamGameHistory'
import { TeamStatsDisplay } from '../components/TeamTrueSkillRating'
import Card, { CardContent, CardHeader } from '../components/ui/Card'
import { useTeam, useTeamGames } from '../hooks/useApi'

export default function TeamStatsPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const teamIdNum = teamId ? parseInt(teamId, 10) : null

  const {
    data: team,
    isLoading: isLoadingTeam,
    error: teamError,
  } = useTeam(teamIdNum!)

  const { data: teamGamesData } = useTeamGames({
    team_id: teamIdNum!,
    page: 1,
    page_size: 5,
  })

  if (!teamIdNum || isNaN(teamIdNum)) {
    return <Navigate to="/teams" replace />
  }

  if (isLoadingTeam) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <LoadingSkeleton rows={1} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LoadingSkeleton rows={8} />
            </div>
            <div>
              <LoadingSkeleton rows={6} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (teamError || !team) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-4">
              Team Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The team you're looking for doesn't exist or has been deleted.
            </p>
            <a
              href="/teams"
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              ← Back to Teams
            </a>
          </div>
        </div>
      </div>
    )
  }

  const recentGames = teamGamesData?.team_games || []

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-dark-text bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            {team.player1.name} & {team.player2.name}
          </h1>
          <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">
            Team Statistics & Performance Analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Statistics */}
          <div className="lg:col-span-2 space-y-6">
            {/* TrueSkill Rating Display */}
            <Card variant="elevated" padding="lg">
              <CardHeader
                title="TrueSkill Rating"
                subtitle="Comprehensive team performance metrics"
              />
              <CardContent>
                <TeamStatsDisplay team={team} showDetailedStats={true} />
              </CardContent>
            </Card>

            {/* Recent Games */}
            <Card variant="default" padding="lg">
              <CardHeader
                title="Recent Games"
                subtitle={`Last ${recentGames.length} games played by this team`}
                action={
                  <a
                    href={`/team-games/history?team=${team.id}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    View All →
                  </a>
                }
              />
              <CardContent>
                {recentGames.length > 0 ? (
                  <TeamGameHistory teamId={team.id} limit={5} />
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-4">🎮</div>
                    <p>This team hasn't played any games yet.</p>
                    <p className="text-sm mt-2">
                      <a
                        href="/team-games"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Record a team game
                      </a>{' '}
                      to see match history!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card variant="default" padding="md">
              <CardHeader title="Quick Stats" />
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Team ID
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      #{team.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Created
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(team.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </span>
                    <span
                      className={`font-medium ${team.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                      {team.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last Updated
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {team.updated_at
                        ? new Date(team.updated_at).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card variant="default" padding="md">
              <CardHeader title="Performance Insights" />
              <CardContent>
                <div className="space-y-3 text-sm">
                  {team.games_played === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <p>No games played yet.</p>
                      <p className="mt-2">Start playing to see insights!</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            team.win_percentage >= 70
                              ? 'bg-green-500'
                              : team.win_percentage >= 50
                                ? 'bg-blue-500'
                                : team.win_percentage >= 30
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                          }`}
                        ></span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {team.win_percentage >= 70
                            ? 'Dominant team'
                            : team.win_percentage >= 50
                              ? 'Competitive team'
                              : team.win_percentage >= 30
                                ? 'Developing team'
                                : 'Struggling team'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            team.trueskill_sigma <= 4
                              ? 'bg-green-500'
                              : team.trueskill_sigma <= 6
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                          }`}
                        ></span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {team.trueskill_sigma <= 4
                            ? 'Consistent performance'
                            : team.trueskill_sigma <= 6
                              ? 'Moderate consistency'
                              : 'Variable performance'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            team.games_played >= 20
                              ? 'bg-green-500'
                              : team.games_played >= 10
                                ? 'bg-blue-500'
                                : team.games_played >= 5
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-500'
                          }`}
                        ></span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {team.games_played >= 20
                            ? 'Experienced team'
                            : team.games_played >= 10
                              ? 'Active team'
                              : team.games_played >= 5
                                ? 'New team'
                                : 'Rookie team'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card variant="default" padding="md">
              <CardHeader title="Quick Actions" />
              <CardContent>
                <div className="space-y-2">
                  <a
                    href="/team-games"
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                  >
                    → Record Game with this Team
                  </a>
                  <a
                    href={`/team-games/history?team=${team.id}`}
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                  >
                    → View Full Game History
                  </a>
                  <a
                    href="/teams"
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                  >
                    → Back to Team Leaderboard
                  </a>
                  <a
                    href={`/players/${team.player1_id}`}
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                  >
                    → View {team.player1.name}'s Profile
                  </a>
                  <a
                    href={`/players/${team.player2_id}`}
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors"
                  >
                    → View {team.player2.name}'s Profile
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
