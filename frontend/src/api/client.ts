// ABOUTME: Main API client for communicating with the backend
// ABOUTME: Handles HTTP requests, error handling, and base configuration

import type { ApiError } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_BASE_URL_WITH_PREFIX = `${API_BASE_URL}/api/v1`

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL_WITH_PREFIX) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const error: ApiError = await response.json()
        throw new Error(
          typeof error.detail === 'string' ? error.detail : 'API request failed'
        )
      }

      // Handle empty responses (like 204 No Content)
      if (response.status === 204) {
        return null
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error occurred')
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Export a singleton instance
export const apiClient = new ApiClient()
export default apiClient
