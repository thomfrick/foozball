// ABOUTME: API client functions for enhanced statistics endpoints
// ABOUTME: Provides functions to fetch player statistics, head-to-head records, and leaderboard data

import type {
  EnhancedLeaderboardResponse,
  HeadToHeadResponse,
  LeaderboardParams,
  PlayerStatistics,
  StatisticsSummary,
} from '../types/statistics'
import { apiClient } from './client'

export const statisticsApi = {
  // Get overall statistics summary
  getSummary: (): Promise<StatisticsSummary> =>
    apiClient.get('/statistics/summary'),

  // Get comprehensive player statistics
  getPlayerStatistics: (playerId: number): Promise<PlayerStatistics> =>
    apiClient.get(`/statistics/players/${playerId}`),

  // Get head-to-head statistics between two players
  getHeadToHead: (
    player1Id: number,
    player2Id: number
  ): Promise<HeadToHeadResponse> =>
    apiClient.get(`/statistics/head-to-head/${player1Id}/${player2Id}`),

  // Get enhanced leaderboard with filtering and sorting
  getLeaderboard: (
    params: LeaderboardParams = {}
  ): Promise<EnhancedLeaderboardResponse> => {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.set('page', params.page.toString())
    if (params.page_size)
      searchParams.set('page_size', params.page_size.toString())
    if (params.min_games)
      searchParams.set('min_games', params.min_games.toString())
    if (params.sort_by) searchParams.set('sort_by', params.sort_by)

    const queryString = searchParams.toString()
    const url = queryString
      ? `/statistics/leaderboard?${queryString}`
      : '/statistics/leaderboard'

    return apiClient.get(url)
  },
}
