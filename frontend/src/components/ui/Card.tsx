// ABOUTME: Professional card component system with variants and hover states
// ABOUTME: Implements design system specifications with shadows, borders, and animations

import React from 'react'

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'subtle'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  hover?: boolean
  clickable?: boolean
  children: React.ReactNode
}

const cardVariants: Record<CardVariant, string> = {
  default: `
    bg-neutral-0 dark:bg-dark-surface
    border border-neutral-100 dark:border-dark-border
    shadow-soft
  `,
  elevated: `
    bg-neutral-0 dark:bg-dark-surface
    border border-neutral-100 dark:border-dark-border
    shadow-medium
  `,
  outlined: `
    bg-neutral-0 dark:bg-dark-surface
    border-2 border-neutral-200 dark:border-dark-border
    shadow-none
  `,
  subtle: `
    bg-neutral-50 dark:bg-dark-background
    border border-neutral-100 dark:border-dark-border
    shadow-none
  `,
}

const cardPadding: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
}

const hoverEffects = `
  hover:shadow-large hover:-translate-y-1
  hover:border-neutral-200 dark:hover:border-neutral-600
  transform transition-all duration-200 ease-out
`

export default function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const baseClasses = `
    rounded-lg
    transition-colors duration-200
    ${hover || clickable ? hoverEffects : 'transition-colors duration-200'}
    ${clickable ? 'cursor-pointer' : ''}
  `

  const variantClasses = cardVariants[variant]
  const paddingClasses = cardPadding[padding]

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${paddingClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Card Header Component
interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
}: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-dark-text">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  )
}

// Card Content Component
interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`text-neutral-700 dark:text-neutral-300 ${className}`}>
      {children}
    </div>
  )
}

// Card Footer Component
interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div
      className={`mt-6 pt-4 border-t border-neutral-100 dark:border-dark-border ${className}`}
    >
      {children}
    </div>
  )
}

// Specialized Card Variants
export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className = '',
  style,
}: {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const trendColors = {
    up: 'text-success-600',
    down: 'text-danger-600',
    neutral: 'text-neutral-500',
  }

  return (
    <Card variant="elevated" hover className={className} style={style}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-dark-text mt-2">
            {value}
          </p>
          {subtitle && (
            <p
              className={`text-sm mt-1 ${trend ? trendColors[trend] : 'text-neutral-500'}`}
            >
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

export function PlayerCard({
  player,
  onClick,
  actions,
  className = '',
}: {
  player: {
    id: number
    name: string
    email?: string
    games_played: number
    win_percentage: number
  }
  onClick?: () => void
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <Card
      variant="default"
      hover
      clickable={!!onClick}
      onClick={onClick}
      className={className}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {player.name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Player Info */}
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-dark-text">
              {player.name}
            </h3>
            {player.email && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {player.email}
              </p>
            )}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {player.games_played} games • {player.win_percentage.toFixed(1)}%
              wins
            </p>
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>
    </Card>
  )
}

export function GameCard({
  game,
  onClick,
  className = '',
}: {
  game: {
    id: number
    player1_name: string
    player2_name: string
    winner_name: string
    created_at: string
  }
  onClick?: () => void
  className?: string
}) {
  return (
    <Card
      variant="default"
      hover
      clickable={!!onClick}
      onClick={onClick}
      className={className}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-2xl">🏓</div>
          <div>
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`font-medium ${
                  game.winner_name === game.player1_name
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {game.player1_name}
              </span>
              <span className="text-neutral-400">vs</span>
              <span
                className={`font-medium ${
                  game.winner_name === game.player2_name
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {game.player2_name}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {new Date(game.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-medium text-success-600 dark:text-success-400">
            {game.winner_name} wins
          </div>
        </div>
      </div>
    </Card>
  )
}
