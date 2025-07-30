// ABOUTME: Reusable component for displaying TrueSkill ratings with tooltips
// ABOUTME: Shows mu, sigma, conservative rating, and uncertainty indicators

import type { Player } from '../types/player'

interface TrueSkillRatingProps {
  player: Player
  size?: 'small' | 'medium' | 'large'
  showTooltip?: boolean
  showConservative?: boolean
  className?: string
}

export default function TrueSkillRating({
  player,
  size = 'medium',
  showTooltip = true,
  showConservative = true,
  className = '',
}: TrueSkillRatingProps) {
  const conservativeRating = player.trueskill_mu - 3 * player.trueskill_sigma

  const getCertaintyLevel = (sigma: number) => {
    if (sigma > 7) return 'Low'
    if (sigma >= 5) return 'Medium'
    return 'High'
  }

  const getUncertaintyColor = (sigma: number) => {
    if (sigma > 7) return 'text-red-600'
    if (sigma >= 5) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRatingGradient = (mu: number) => {
    // Color gradient based on skill level
    if (mu > 30) return 'from-green-500 to-green-600'
    if (mu > 25) return 'from-blue-500 to-blue-600'
    if (mu > 20) return 'from-yellow-500 to-yellow-600'
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
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-black text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
      <div className="space-y-2">
        <div>
          <strong>TrueSkill Rating System</strong>
        </div>
        <div>
          <strong>μ (Mu):</strong> {player.trueskill_mu.toFixed(2)} - Estimated
          skill level
        </div>
        <div>
          <strong>σ (Sigma):</strong> {player.trueskill_sigma.toFixed(2)} -
          Uncertainty in skill estimate
        </div>
        <div>
          <strong>Conservative Rating:</strong> {conservativeRating.toFixed(1)}{' '}
          (μ - 3σ)
        </div>
        <div>
          This represents a skill level we're 99.7% confident the player
          exceeds.
        </div>
        <div className="text-xs text-gray-300 pt-1">
          Higher μ = better skill, Lower σ = more confident estimate
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
              player.trueskill_mu
            )} bg-clip-text text-transparent`}
          >
            {conservativeRating.toFixed(1)}
          </div>
        )}

        <div
          className={`${sizeClasses[size].details} text-gray-600 text-center space-y-0.5`}
        >
          <div>
            <span className="font-medium">μ</span>{' '}
            {player.trueskill_mu.toFixed(1)}
            <span className="mx-2">•</span>
            <span
              className={`font-medium ${getUncertaintyColor(player.trueskill_sigma)}`}
            >
              σ
            </span>{' '}
            <span className={getUncertaintyColor(player.trueskill_sigma)}>
              {player.trueskill_sigma.toFixed(1)}
            </span>
          </div>

          <div
            className={`${sizeClasses[size].uncertainty} ${getUncertaintyColor(player.trueskill_sigma)}`}
          >
            {getCertaintyLevel(player.trueskill_sigma)} certainty
          </div>
        </div>

        {player.games_played === 0 && (
          <div className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
            New Player
          </div>
        )}
      </div>

      {tooltipContent}
    </div>
  )
}

// Utility component for compact rating display (e.g., in lists)
export function CompactTrueSkillRating({
  player,
  className = '',
}: {
  player: Player
  className?: string
}) {
  const conservativeRating = player.trueskill_mu - 3 * player.trueskill_sigma

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <span className="font-semibold text-gray-900">
        {conservativeRating.toFixed(1)}
      </span>
      <span className="text-xs text-gray-500">
        (μ{player.trueskill_mu.toFixed(1)} σ{player.trueskill_sigma.toFixed(1)})
      </span>
    </div>
  )
}

// Component for showing rating changes after a game
export function TrueSkillChange({
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
      ? 'text-green-600'
      : change < 0
        ? 'text-red-600'
        : 'text-gray-600'
  const changeIcon = change > 0 ? '↗' : change < 0 ? '↘' : '→'

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-600">
        {conservativeBefore.toFixed(1)}
      </span>
      <span className={`text-lg ${changeColor}`}>{changeIcon}</span>
      <span className="text-sm font-semibold">
        {conservativeAfter.toFixed(1)}
      </span>
      <span className={`text-xs ${changeColor}`}>
        ({change >= 0 ? '+' : ''}
        {change.toFixed(1)})
      </span>
    </div>
  )
}
