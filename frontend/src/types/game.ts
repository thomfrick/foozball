// ABOUTME: TypeScript types for Game data matching backend Pydantic schemas
// ABOUTME: Ensures type safety between frontend and backend

import type { Player } from './player'

export interface Game {
  id: number
  player1_id: number
  player2_id: number
  winner_id: number
  created_at: string
  player1: Player
  player2: Player
  winner: Player
}

export interface GameCreate {
  player1_id: number
  player2_id: number
  winner_id: number
}

export interface GameListResponse {
  games: Game[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
