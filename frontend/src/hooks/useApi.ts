// ABOUTME: Custom React hooks for API calls using TanStack Query
// ABOUTME: Provides consistent data fetching and caching patterns

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gamesApi } from '../api/games'
import { healthApi } from '../api/health'
import { playersApi } from '../api/players'
import { teamGamesApi, teamsApi } from '../api/teams'
import type { GameCreate } from '../types/game'
import type { PlayerCreate, PlayerUpdate } from '../types/player'
import type {
  TeamCreate,
  TeamFormationRequest,
  TeamGameCreate,
} from '../types/team'

// Health check hooks
export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: healthApi.getHealth,
    staleTime: 1000 * 60, // 1 minute
  })
}

export const useReadiness = () => {
  return useQuery({
    queryKey: ['readiness'],
    queryFn: healthApi.getReadiness,
    staleTime: 1000 * 30, // 30 seconds
  })
}

// Player hooks
export const usePlayers = (params?: {
  page?: number
  page_size?: number
  active_only?: boolean
  search?: string
}) => {
  return useQuery({
    queryKey: ['players', params],
    queryFn: () => playersApi.getPlayers(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export const usePlayer = (id: number) => {
  return useQuery({
    queryKey: ['players', id],
    queryFn: () => playersApi.getPlayer(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useCreatePlayer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlayerCreate) => playersApi.createPlayer(data),
    onSuccess: () => {
      // Invalidate players list to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })
}

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PlayerUpdate }) =>
      playersApi.updatePlayer(id, data),
    onSuccess: (updatedPlayer) => {
      // Update the cached player data
      queryClient.setQueryData(['players', updatedPlayer.id], updatedPlayer)
      // Invalidate players list to refetch
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })
}

export const useDeletePlayer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => playersApi.deletePlayer(id),
    onSuccess: () => {
      // Invalidate players list to refetch
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })
}

// Game hooks
export const useGames = (params?: { page?: number; page_size?: number }) => {
  return useQuery({
    queryKey: ['games', params],
    queryFn: () => gamesApi.getGames(params),
    staleTime: 1000 * 60, // 1 minute
  })
}

export const useGame = (id: number) => {
  return useQuery({
    queryKey: ['games', id],
    queryFn: () => gamesApi.getGame(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const usePlayerGames = (
  playerId: number | undefined,
  params?: {
    page?: number
    page_size?: number
  }
) => {
  return useQuery({
    queryKey: ['players', playerId, 'games', params],
    queryFn: () => gamesApi.getPlayerGames(playerId!, params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: playerId !== undefined, // Only run query when playerId is defined
  })
}

export const useCreateGame = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GameCreate) => gamesApi.createGame(data),
    onSuccess: () => {
      // Invalidate games list and player data to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })
}

// Team hooks
export const useTeams = (params?: { page?: number; page_size?: number }) => {
  return useQuery({
    queryKey: ['teams', params],
    queryFn: () => teamsApi.getTeams(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export const useTeam = (id: number) => {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => teamsApi.getTeam(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useCreateTeam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TeamCreate) => teamsApi.createTeam(data),
    onSuccess: () => {
      // Invalidate teams list to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

export const useDeleteTeam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => teamsApi.deleteTeam(id),
    onSuccess: () => {
      // Invalidate teams list to refetch
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

export const useSearchTeamByPlayers = (
  player1Id: number,
  player2Id: number
) => {
  return useQuery({
    queryKey: ['teams', 'search', player1Id, player2Id],
    queryFn: () => teamsApi.searchByPlayers(player1Id, player2Id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: player1Id > 0 && player2Id > 0 && player1Id !== player2Id,
  })
}

// Team game hooks
export const useTeamGames = (params?: {
  page?: number
  page_size?: number
  team_id?: number
}) => {
  return useQuery({
    queryKey: ['team-games', params],
    queryFn: () => teamGamesApi.getTeamGames(params),
    staleTime: 1000 * 60, // 1 minute
  })
}

export const useTeamGame = (id: number) => {
  return useQuery({
    queryKey: ['team-games', id],
    queryFn: () => teamGamesApi.getTeamGame(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useCreateTeamGame = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TeamGameCreate) => teamGamesApi.createTeamGame(data),
    onSuccess: () => {
      // Invalidate team games, teams, and players to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['team-games'] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })
}

export const useCreateQuickTeamGame = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TeamFormationRequest) =>
      teamGamesApi.createQuickTeamGame(data),
    onSuccess: () => {
      // Invalidate team games, teams, and players to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['team-games'] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })
}
