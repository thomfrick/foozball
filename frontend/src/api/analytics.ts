// ABOUTME: Analytics API endpoints for data visualization and charts
// ABOUTME: Handles multi-player comparisons and advanced statistics

import type { MultiPlayerRatingProgression } from '../types/player'
import apiClient from './client'

export const analyticsApi = {
  // Get multi-player rating progression for comparison charts
  getMultiPlayerProgression: (
    playerIds: number[],
    limit?: number
  ): Promise<MultiPlayerRatingProgression> => {
    const params = new URLSearchParams()
    params.set('player_ids', playerIds.join(','))
    if (limit) params.set('limit', limit.toString())

    return apiClient.get<MultiPlayerRatingProgression>(
      `/analytics/multi-player-progression?${params.toString()}`
    )
  },
}
