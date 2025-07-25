// ABOUTME: Test setup for integration tests with MSW server
// ABOUTME: Configures mock service worker lifecycle for test suite

import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetMockData } from './mocks/handlers'
import { server } from './mocks/server'

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
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
