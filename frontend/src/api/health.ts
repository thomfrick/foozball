// ABOUTME: Health check API endpoints for monitoring backend status
// ABOUTME: Provides health and readiness check functionality

import type { HealthResponse, ReadinessResponse } from '../types/api'
import apiClient from './client'

export const healthApi = {
  // Basic health check
  getHealth: (): Promise<HealthResponse> => {
    return apiClient.get<HealthResponse>('/health')
  },

  // Readiness check (includes database connectivity)
  getReadiness: (): Promise<ReadinessResponse> => {
    return apiClient.get<ReadinessResponse>('/ready')
  },

  // Root endpoint info
  getInfo: (): Promise<{
    name: string
    version: string
    status: string
    environment: string
  }> => {
    return apiClient.get('/')
  },
}
