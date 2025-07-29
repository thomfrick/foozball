// ABOUTME: TypeScript types for Team and TeamGame data matching backend Pydantic schemas
// ABOUTME: Ensures type safety between frontend and backend team functionality

import type { Player } from './player'

export interface Team {
  id: number
  player1_id: number
  player2_id: number
  trueskill_mu: number
  trueskill_sigma: number
  games_played: number
  wins: number
  losses: number
  created_at: string
  updated_at?: string
  is_active: boolean
  win_percentage: number
  conservative_rating: number
  player_names: string
  player1: Player
  player2: Player
}

export interface TeamCreate {
  player1_id: number
  player2_id: number
}

export interface TeamGame {
  id: number
  team1_id: number
  team2_id: number
  winner_team_id: number
  created_at: string
  team1: Team
  team2: Team
  winner_team: Team
  loser_team_id: number
  loser_team: Team
}

export interface TeamGameCreate {
  team1_id: number
  team2_id: number
  winner_team_id: number
}

export interface TeamFormationRequest {
  player1_id: number
  player2_id: number
  player3_id: number
  player4_id: number
  winner_team: 1 | 2
}

export interface TeamListResponse {
  teams: Team[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface TeamGameListResponse {
  team_games: TeamGame[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface TeamSearchResponse {
  team: Team | null
}

export interface MatchQuality {
  quality: number
  description: string
}
