// ABOUTME: React Query hooks for enhanced statistics data management
// ABOUTME: Provides hooks for fetching and caching statistics, leaderboard, and player performance data

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { statisticsApi } from '../api/statistics'
import type {
  EnhancedLeaderboardResponse,
  HeadToHeadResponse,
  LeaderboardParams,
  PlayerStatistics,
  StatisticsSummary,
} from '../types/statistics'

// Hook for overall statistics summary
export const useStatisticsSummary = (
  options?: UseQueryOptions<StatisticsSummary>
) => {
  return useQuery({
    queryKey: ['statistics', 'summary'],
    queryFn: statisticsApi.getSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

// Hook for player statistics
export const usePlayerStatistics = (
  playerId: number,
  options?: UseQueryOptions<PlayerStatistics>
) => {
  return useQuery({
    queryKey: ['statistics', 'player', playerId],
    queryFn: () => statisticsApi.getPlayerStatistics(playerId),
    enabled: !!playerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

// Hook for head-to-head statistics
export const useHeadToHeadStatistics = (
  player1Id: number,
  player2Id: number,
  options?: UseQueryOptions<HeadToHeadResponse>
) => {
  return useQuery({
    queryKey: ['statistics', 'head-to-head', player1Id, player2Id],
    queryFn: () => statisticsApi.getHeadToHead(player1Id, player2Id),
    enabled: !!player1Id && !!player2Id && player1Id !== player2Id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

// Hook for enhanced leaderboard
export const useEnhancedLeaderboard = (
  params: LeaderboardParams = {},
  options?: UseQueryOptions<EnhancedLeaderboardResponse>
) => {
  return useQuery({
    queryKey: ['statistics', 'leaderboard', params],
    queryFn: () => statisticsApi.getLeaderboard(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    placeholderData: keepPreviousData, // For pagination
    ...options,
  })
}

// Hook for multiple player statistics (for comparison)
export const useMultiplePlayerStatistics = (
  playerIds: number[],
  options?: UseQueryOptions<PlayerStatistics[]>
) => {
  return useQuery({
    queryKey: ['statistics', 'players', playerIds.sort()],
    queryFn: async () => {
      const promises = playerIds.map((id) =>
        statisticsApi.getPlayerStatistics(id)
      )
      return Promise.all(promises)
    },
    enabled: playerIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}
