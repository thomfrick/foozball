// ABOUTME: Common API response types and error handling types
// ABOUTME: Provides consistent typing for API interactions

export interface ApiError {
  detail: string | Record<string, unknown>
}

export interface HealthResponse {
  status: string
  service: string
  version: string
  environment: string
}

export interface ReadinessResponse {
  status: string
  service: string
  version: string
  environment: string
  checks: {
    database: string
  }
}
