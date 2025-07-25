// ABOUTME: Custom React hooks for API calls using TanStack Query
// ABOUTME: Provides consistent data fetching and caching patterns

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { healthApi } from '../api/health'
import { playersApi } from '../api/players'
import type { PlayerCreate, PlayerUpdate } from '../types/player'

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
