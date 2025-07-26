// ABOUTME: Game API endpoints for CRUD operations
// ABOUTME: Handles all game-related API calls to the backend

import type { Game, GameCreate, GameListResponse } from '../types/game'
import apiClient from './client'

export const gamesApi = {
  // Get all games with pagination
  getGames: (params?: {
    page?: number
    page_size?: number
  }): Promise<GameListResponse> => {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.page_size)
      searchParams.set('page_size', params.page_size.toString())

    const query = searchParams.toString()
    return apiClient.get<GameListResponse>(`/games${query ? `?${query}` : ''}`)
  },

  // Get a single game by ID
  getGame: (id: number): Promise<Game> => {
    return apiClient.get<Game>(`/games/${id}`)
  },

  // Create a new game
  createGame: (data: GameCreate): Promise<Game> => {
    return apiClient.post<Game>('/games', data)
  },

  // Get games for a specific player
  getPlayerGames: (
    playerId: number,
    params?: {
      page?: number
      page_size?: number
    }
  ): Promise<GameListResponse> => {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.page_size)
      searchParams.set('page_size', params.page_size.toString())

    const query = searchParams.toString()
    return apiClient.get<GameListResponse>(
      `/players/${playerId}/games${query ? `?${query}` : ''}`
    )
  },
}
