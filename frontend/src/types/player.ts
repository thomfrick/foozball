// ABOUTME: TypeScript types for Player data matching backend Pydantic schemas
// ABOUTME: Ensures type safety between frontend and backend

export interface Player {
  id: number
  name: string
  email?: string
  elo_rating: number
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
