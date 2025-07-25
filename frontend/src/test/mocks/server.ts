// ABOUTME: MSW server setup for Node.js test environment
// ABOUTME: Configures mock service worker to intercept API calls during testing

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup MSW server with our handlers
export const server = setupServer(...handlers)
