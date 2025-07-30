// ABOUTME: TypeScript type definitions for enhanced statistics features
// ABOUTME: Defines interfaces for player statistics, head-to-head records, and performance analytics

export interface HeadToHeadRecord {
  player1_id: number
  player1_name: string
  player2_id: number
  player2_name: string
  total_games: number
  player1_wins: number
  player2_wins: number
  player1_win_percentage: number
  player2_win_percentage: number
  last_game_date?: string
  current_streak?: string
}

export interface GameForm {
  game_id: number
  date: string
  opponent_id: number
  opponent_name: string
  result: 'W' | 'L'
  rating_change: number
  conservative_rating_change: number
}

export interface RecentForm {
  player_id: number
  player_name: string
  games_analyzed: number
  wins: number
  losses: number
  win_percentage: number
  avg_rating_change: number
  current_form: string // e.g., "WWLWL"
  form_trend: 'improving' | 'declining' | 'stable'
  games: GameForm[]
}

export interface PerformanceTrend {
  period: '7d' | '30d' | '90d' | 'all'
  games_played: number
  wins: number
  losses: number
  win_percentage: number
  avg_rating: number
  rating_change: number
  trend_direction: 'up' | 'down' | 'stable'
}

export interface PlayerStatistics {
  player_id: number
  player_name: string

  // Basic stats
  total_games: number
  wins: number
  losses: number
  win_percentage: number

  // Rating stats
  current_mu: number
  current_sigma: number
  conservative_rating: number
  peak_rating: number
  peak_rating_date?: string

  // Streak stats
  current_streak: string
  longest_win_streak: number
  longest_loss_streak: number

  // Performance trends
  performance_trends: PerformanceTrend[]

  // Recent form
  recent_form: RecentForm

  // Activity stats
  first_game_date?: string
  last_game_date?: string
  games_this_week: number
  games_this_month: number
}

export interface HeadToHeadResponse {
  head_to_head: HeadToHeadRecord
  recent_games: GameForm[]
}

export interface LeaderboardEntry {
  rank: number
  player_id: number
  player_name: string

  // Core stats
  games_played: number
  wins: number
  losses: number
  win_percentage: number

  // TrueSkill
  conservative_rating: number
  trueskill_mu: number
  trueskill_sigma: number

  // Performance indicators
  recent_form: string // Last 5 games, e.g., "WWLWL"
  trend_7d: 'up' | 'down' | 'stable'
  rating_change_7d: number

  // Activity
  last_game_date?: string
  games_this_week: number
}

export interface EnhancedLeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  total_players: number
  active_players: number
  total_games: number
  last_updated: string
}

export interface StatisticsSummary {
  total_players: number
  active_players: number
  total_games: number
  games_today: number
  games_this_week: number
  games_this_month: number

  // Top performers
  highest_rated_player?: LeaderboardEntry
  most_active_player?: LeaderboardEntry
  best_win_rate_player?: LeaderboardEntry

  // System stats
  avg_games_per_player: number
  avg_rating: number
  most_common_matchup?: string

  last_updated: string
}

// Request parameters
export interface LeaderboardParams {
  page?: number
  page_size?: number
  min_games?: number
  sort_by?: 'rating' | 'wins' | 'games' | 'win_rate'
}

// UI-specific types
export interface StatsDashboardTab {
  id: string
  label: string
  icon?: string
}

export interface PerformanceIndicator {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  color?: 'green' | 'red' | 'yellow' | 'blue'
  tooltip?: string
}
