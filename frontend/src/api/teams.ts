// ABOUTME: API client functions for team-related endpoints
// ABOUTME: Handles HTTP requests for teams, team games, and team formation

import type {
  Team,
  TeamCreate,
  TeamFormationRequest,
  TeamGame,
  TeamGameCreate,
  TeamGameListResponse,
  TeamListResponse,
  TeamSearchResponse,
} from '../types/team'
import { apiClient } from './client'

// Team endpoints
export const teamsApi = {
  // Create or get existing team
  createTeam: (data: TeamCreate): Promise<Team> =>
    apiClient.post<Team>('/teams', data),

  // List teams with pagination
  getTeams: (params?: {
    page?: number
    page_size?: number
  }): Promise<TeamListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size)
      searchParams.append('page_size', params.page_size.toString())

    const query = searchParams.toString()
    return apiClient.get<TeamListResponse>(`/teams${query ? `?${query}` : ''}`)
  },

  // Get specific team
  getTeam: (teamId: number): Promise<Team> =>
    apiClient.get<Team>(`/teams/${teamId}`),

  // Soft delete team
  deleteTeam: (teamId: number): Promise<void> =>
    apiClient.delete<void>(`/teams/${teamId}`),

  // Find team by player IDs (order independent)
  searchByPlayers: (
    player1Id: number,
    player2Id: number
  ): Promise<TeamSearchResponse> => {
    const searchParams = new URLSearchParams()
    searchParams.append('player1_id', player1Id.toString())
    searchParams.append('player2_id', player2Id.toString())
    return apiClient.get<TeamSearchResponse>(
      `/teams/search/by-players?${searchParams}`
    )
  },
}

// Team game endpoints
export const teamGamesApi = {
  // Record team game
  createTeamGame: (data: TeamGameCreate): Promise<TeamGame> =>
    apiClient.post<TeamGame>('/team-games', data),

  // Quick team game creation from 4 player IDs
  createQuickTeamGame: (data: TeamFormationRequest): Promise<TeamGame> =>
    apiClient.post<TeamGame>('/team-games/quick', data),

  // List team games with pagination and filtering
  getTeamGames: (params?: {
    page?: number
    page_size?: number
    team_id?: number
  }): Promise<TeamGameListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size)
      searchParams.append('page_size', params.page_size.toString())
    if (params?.team_id)
      searchParams.append('team_id', params.team_id.toString())

    const query = searchParams.toString()
    return apiClient.get<TeamGameListResponse>(
      `/team-games${query ? `?${query}` : ''}`
    )
  },

  // Get specific team game
  getTeamGame: (gameId: number): Promise<TeamGame> =>
    apiClient.get<TeamGame>(`/team-games/${gameId}`),
}
