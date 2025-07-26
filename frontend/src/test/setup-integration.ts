// ABOUTME: Integration test setup file with MSW configuration
// ABOUTME: Configures mock service worker for integration tests only

import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetMockData } from './mocks/handlers'
import { server } from './mocks/server'

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

// Reset handlers and mock data after each test
afterEach(() => {
  server.resetHandlers()
  resetMockData()
})

// Clean up after all tests
afterAll(() => {
  server.close()
})