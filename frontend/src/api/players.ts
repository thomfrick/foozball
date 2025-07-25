// ABOUTME: Player API endpoints for CRUD operations
// ABOUTME: Handles all player-related API calls to the backend

import type {
  Player,
  PlayerCreate,
  PlayerListResponse,
  PlayerUpdate,
} from '../types/player'
import apiClient from './client'

export const playersApi = {
  // Get all players with pagination and filtering
  getPlayers: (params?: {
    page?: number
    page_size?: number
    active_only?: boolean
    search?: string
  }): Promise<PlayerListResponse> => {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.page_size)
      searchParams.set('page_size', params.page_size.toString())
    if (params?.active_only !== undefined)
      searchParams.set('active_only', params.active_only.toString())
    if (params?.search) searchParams.set('search', params.search)

    const query = searchParams.toString()
    return apiClient.get<PlayerListResponse>(
      `/players${query ? `?${query}` : ''}`
    )
  },

  // Get a single player by ID
  getPlayer: (id: number): Promise<Player> => {
    return apiClient.get<Player>(`/players/${id}`)
  },

  // Create a new player
  createPlayer: (data: PlayerCreate): Promise<Player> => {
    return apiClient.post<Player>('/players', data)
  },

  // Update an existing player
  updatePlayer: (id: number, data: PlayerUpdate): Promise<Player> => {
    return apiClient.put<Player>(`/players/${id}`, data)
  },

  // Delete a player (soft delete)
  deletePlayer: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/players/${id}`)
  },
}
