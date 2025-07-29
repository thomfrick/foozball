// ABOUTME: Reusable component for displaying team TrueSkill ratings with tooltips
// ABOUTME: Shows team mu, sigma, conservative rating, and uncertainty indicators

import type { Team } from '../types/team'

interface TeamTrueSkillRatingProps {
  team: Team
  size?: 'small' | 'medium' | 'large'
  showTooltip?: boolean
  showConservative?: boolean
  className?: string
}

export default function TeamTrueSkillRating({
  team,
  size = 'medium',
  showTooltip = true,
  showConservative = true,
  className = '',
}: TeamTrueSkillRatingProps) {
  const getCertaintyLevel = (sigma: number) => {
    if (sigma > 6) return 'High'
    if (sigma > 4) return 'Medium'
    return 'Low'
  }

  const getUncertaintyColor = (sigma: number) => {
    if (sigma > 6) return 'text-amber-600 dark:text-amber-400'
    if (sigma > 4) return 'text-blue-600 dark:text-blue-400'
    return 'text-success-600 dark:text-success-400'
  }

  const getRatingGradient = (mu: number) => {
    // Color gradient based on team skill level (teams start at 50, not 25)
    if (mu > 70) return 'from-emerald-500 to-emerald-600'
    if (mu > 60) return 'from-green-500 to-green-600'
    if (mu > 50) return 'from-blue-500 to-blue-600'
    if (mu > 40) return 'from-yellow-500 to-yellow-600'
    return 'from-gray-500 to-gray-600'
  }

  const sizeClasses = {
    small: {
      rating: 'text-lg',
      details: 'text-xs',
      uncertainty: 'text-xs',
    },
    medium: {
      rating: 'text-xl',
      details: 'text-sm',
      uncertainty: 'text-sm',
    },
    large: {
      rating: 'text-2xl',
      details: 'text-base',
      uncertainty: 'text-sm',
    },
  }

  const tooltipContent = showTooltip ? (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-3 bg-black text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
      <div className="space-y-2">
        <div>
          <strong>Team TrueSkill Rating System</strong>
        </div>
        <div>
          <strong>Team:</strong> {team.player1.name} & {team.player2.name}
        </div>
        <div>
          <strong>μ (Mu):</strong> {team.trueskill_mu.toFixed(2)} - Estimated
          team skill level
        </div>
        <div>
          <strong>σ (Sigma):</strong> {team.trueskill_sigma.toFixed(2)} -
          Uncertainty in team skill estimate
        </div>
        <div>
          <strong>Conservative Rating:</strong>{' '}
          {team.conservative_rating.toFixed(1)} (μ - 3σ)
        </div>
        <div>
          This represents a team skill level we're 99.7% confident the team
          exceeds.
        </div>
        <div>
          <strong>Team Chemistry:</strong> Teams develop their own ratings
          separate from individual player skills.
        </div>
        <div className="text-xs text-gray-300 pt-1">
          Higher μ = better team performance, Lower σ = more confident estimate
        </div>
      </div>
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
    </div>
  ) : null

  return (
    <div className={`relative inline-block group ${className}`}>
      <div className="flex flex-col items-center space-y-1">
        {showConservative && (
          <div
            className={`${sizeClasses[size].rating} font-bold bg-gradient-to-r ${getRatingGradient(
              team.trueskill_mu
            )} bg-clip-text text-transparent`}
          >
            {team.conservative_rating.toFixed(1)}
          </div>
        )}

        <div
          className={`${sizeClasses[size].details} text-gray-600 dark:text-gray-400 text-center space-y-0.5`}
        >
          <div>
            <span className="font-medium">μ</span>{' '}
            {team.trueskill_mu.toFixed(1)}
            <span className="mx-2">•</span>
            <span
              className={`font-medium ${getUncertaintyColor(team.trueskill_sigma)}`}
            >
              σ
            </span>{' '}
            <span className={getUncertaintyColor(team.trueskill_sigma)}>
              {team.trueskill_sigma.toFixed(1)}
            </span>
          </div>

          <div
            className={`${sizeClasses[size].uncertainty} px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 ${getUncertaintyColor(team.trueskill_sigma)}`}
          >
            {getCertaintyLevel(team.trueskill_sigma)} uncertainty
          </div>
        </div>

        {team.games_played === 0 && (
          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20 px-2 py-1 rounded">
            New Team
          </div>
        )}
      </div>

      {tooltipContent}
    </div>
  )
}

// Utility component for compact team rating display (e.g., in lists)
export function CompactTeamTrueSkillRating({
  team,
  className = '',
}: {
  team: Team
  className?: string
}) {
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <span className="font-semibold text-gray-900 dark:text-gray-100">
        {team.conservative_rating.toFixed(1)}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        (μ{team.trueskill_mu.toFixed(1)} σ{team.trueskill_sigma.toFixed(1)})
      </span>
    </div>
  )
}

// Component for showing team rating changes after a game
export function TeamTrueSkillChange({
  beforeMu,
  beforeSigma,
  afterMu,
  afterSigma,
  className = '',
}: {
  beforeMu: number
  beforeSigma: number
  afterMu: number
  afterSigma: number
  className?: string
}) {
  const conservativeBefore = beforeMu - 3 * beforeSigma
  const conservativeAfter = afterMu - 3 * afterSigma
  const change = conservativeAfter - conservativeBefore

  const changeColor =
    change > 0
      ? 'text-green-600 dark:text-green-400'
      : change < 0
        ? 'text-red-600 dark:text-red-400'
        : 'text-gray-600 dark:text-gray-400'
  const changeIcon = change > 0 ? '↗' : change < 0 ? '↘' : '→'

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {conservativeBefore.toFixed(1)}
      </span>
      <span className={`text-lg ${changeColor}`}>{changeIcon}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {conservativeAfter.toFixed(1)}
      </span>
      <span className={`text-xs ${changeColor}`}>
        ({change >= 0 ? '+' : ''}
        {change.toFixed(1)})
      </span>
    </div>
  )
}

// Component for team statistics display with comprehensive tooltips
export function TeamStatsDisplay({
  team,
  showDetailedStats = true,
  className = '',
}: {
  team: Team
  showDetailedStats?: boolean
  className?: string
}) {
  const getCertaintyLevel = (sigma: number) => {
    if (sigma > 6)
      return {
        level: 'High',
        color: 'text-amber-600 dark:text-amber-400',
        description: 'Low confidence in rating',
      }
    if (sigma > 4)
      return {
        level: 'Medium',
        color: 'text-blue-600 dark:text-blue-400',
        description: 'Moderate confidence in rating',
      }
    return {
      level: 'Low',
      color: 'text-success-600 dark:text-success-400',
      description: 'High confidence in rating',
    }
  }

  const uncertainty = getCertaintyLevel(team.trueskill_sigma)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Rating Display */}
      <div className="text-center">
        <TeamTrueSkillRating team={team} size="large" />
      </div>

      {/* Detailed Statistics */}
      {showDetailedStats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Games Played
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {team.games_played}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Win Percentage
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {team.win_percentage.toFixed(1)}%
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Record
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {team.wins}W-{team.losses}L
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Rating Uncertainty
            </div>
            <div className={`text-lg font-bold ${uncertainty.color}`}>
              {uncertainty.level}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {uncertainty.description}
            </div>
          </div>
        </div>
      )}

      {/* Team Composition */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Team Composition
        </div>
        <div className="flex items-center justify-center space-x-3">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {team.player1.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {team.player1.name}
            </div>
          </div>

          <div className="text-2xl text-gray-400 dark:text-gray-500">+</div>

          <div className="text-center">
            <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-lg font-bold text-secondary-600 dark:text-secondary-400">
                {team.player2.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {team.player2.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
