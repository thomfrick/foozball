// ABOUTME: TypeScript types for Player data matching backend Pydantic schemas
// ABOUTME: Ensures type safety between frontend and backend

export interface Player {
  id: number
  name: string
  email?: string
  trueskill_mu: number
  trueskill_sigma: number
  games_played: number
  wins: number
  losses: number
  created_at: string
  updated_at?: string
  is_active: boolean
  win_percentage: number
}

export interface PlayerCreate {
  name: string
  email?: string
}

export interface PlayerUpdate {
  name?: string
  email?: string
  is_active?: boolean
}

export interface PlayerListResponse {
  players: Player[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface RatingHistoryEntry {
  id: number
  player_id: number
  game_id: number
  trueskill_mu_before: number
  trueskill_sigma_before: number
  trueskill_mu_after: number
  trueskill_sigma_after: number
  rating_system: string
  created_at: string
  mu_change: number
  sigma_change: number
  conservative_rating_before: number
  conservative_rating_after: number
  conservative_rating_change: number
}

export interface RatingHistoryListResponse {
  rating_history: RatingHistoryEntry[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface PlayerRatingProgression {
  player_id: number
  player_name: string
  ratings: RatingHistoryEntry[]
}

export interface MultiPlayerRatingProgression {
  players: PlayerRatingProgression[]
  total_games: number
}
