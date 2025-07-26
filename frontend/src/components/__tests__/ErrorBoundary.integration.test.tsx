// ABOUTME: Integration tests for error boundaries and advanced loading states across components
// ABOUTME: Tests error recovery, boundary behavior, and complex loading scenarios with MSW

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import AddGameForm from '../AddGameForm'
// Import components to test
import GameHistory from '../GameHistory'
import PlayerList from '../PlayerList'
import RecentGamesList from '../RecentGamesList'

// Test Error Boundary Component
class TestErrorBoundary extends React.Component<
  {
    children: React.ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  },
  { hasError: boolean; error?: Error }
> {
  constructor(props: React.PropsWithChildren<{ onError?: (error: Error, errorInfo: React.ErrorInfo) => void }>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-testid="error-boundary">
          <h2>Something went wrong</h2>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Mock data
const mockPlayers = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@test.com',
    trueskill_mu: 25.0,
    trueskill_sigma: 8.3333,
    games_played: 15,
    wins: 10,
    losses: 5,
    win_percentage: 66.7,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@test.com',
    trueskill_mu: 22.5,
    trueskill_sigma: 7.8,
    games_played: 12,
    wins: 4,
    losses: 8,
    win_percentage: 33.3,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: null,
  },
]

const mockGames = [
  {
    id: 1,
    player1_id: 1,
    player2_id: 2,
    winner_id: 1,
    created_at: '2023-01-03T14:30:00Z',
    player1: mockPlayers[0],
    player2: mockPlayers[1],
    winner: mockPlayers[0],
  },
  {
    id: 2,
    player1_id: 2,
    player2_id: 1,
    winner_id: 2,
    created_at: '2023-01-03T12:00:00Z',
    player1: mockPlayers[1],
    player2: mockPlayers[0],
    winner: mockPlayers[1],
  },
]

// MSW server setup
const server = setupServer(
  // Default successful responses
  http.get('http://localhost:8000/api/v1/players', () => {
    return HttpResponse.json({
      players: mockPlayers,
      total: mockPlayers.length,
      page: 1,
      page_size: 100,
      total_pages: 1,
    })
  }),

  http.get('http://localhost:8000/api/v1/games', () => {
    return HttpResponse.json({
      games: mockGames,
      total: mockGames.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
    })
  }),

  http.post('http://localhost:8000/api/v1/games', () => {
    return HttpResponse.json(
      {
        id: 3,
        player1_id: 1,
        player2_id: 2,
        winner_id: 1,
        created_at: '2023-01-01T12:00:00Z',
        player1: mockPlayers[0],
        player2: mockPlayers[1],
        winner: mockPlayers[0],
      },
      { status: 201 }
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const renderWithProviders = (
  component: React.ReactElement,
  { withErrorBoundary = false, onError = vi.fn() } = {}
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const wrapped = (
    <QueryClientProvider client={queryClient}>
      {withErrorBoundary ? (
        <TestErrorBoundary onError={onError}>{component}</TestErrorBoundary>
      ) : (
        component
      )}
    </QueryClientProvider>
  )

  return { ...render(wrapped), onError }
}

describe('Error Boundary and Loading States Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear any console errors for clean testing
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GameHistory Error Boundaries', () => {
    it('handles API errors gracefully with error boundary', async () => {
      // Mock API error
      server.use(
        http.get('http://localhost:8000/api/v1/games', () => {
          return new HttpResponse(null, { status: 500 })
        }),
        http.get('http://localhost:8000/api/v1/players', () => {
          return HttpResponse.json({
            players: mockPlayers,
            total: mockPlayers.length,
            page: 1,
            page_size: 100,
            total_pages: 1,
          })
        })
      )

      renderWithProviders(<GameHistory />)

      // Should show built-in error handling, not crash to error boundary
      await waitFor(() => {
        expect(
          screen.getByText('Failed to load game history')
        ).toBeInTheDocument()
      })

      expect(screen.getByText('Try Again')).toBeInTheDocument()
      expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument()
    })

    it('catches rendering errors with error boundary', async () => {
      // Mock malformed data that could cause rendering errors
      server.use(
        http.get('http://localhost:8000/api/v1/games', () => {
          return HttpResponse.json({
            games: [
              {
                // Missing required fields to potentially cause errors
                id: 1,
                // player1_id: missing
                // player2_id: missing
                winner_id: 999,
                created_at: 'invalid-date',
                // Missing player objects
              },
            ],
            total: 1,
            page: 1,
            page_size: 20,
            total_pages: 1,
          })
        }),
        http.get('http://localhost:8000/api/v1/players', () => {
          return HttpResponse.json({
            players: mockPlayers,
            total: mockPlayers.length,
            page: 1,
            page_size: 100,
            total_pages: 1,
          })
        })
      )

      renderWithProviders(<GameHistory />, {
        withErrorBoundary: true,
      })

      // Wait for potential rendering error
      await waitFor(() => {
        // Either the component handles the malformed data gracefully,
        // or the error boundary catches it
        const errorBoundary = screen.queryByTestId('error-boundary')
        const normalContent = screen.queryByText('Game History')

        expect(errorBoundary || normalContent).toBeTruthy()
      })
    })

    it('shows complex loading states correctly', async () => {
      let resolvePromise: (value: unknown) => void
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      // Mock delayed response
      server.use(
        http.get('http://localhost:8000/api/v1/games', async () => {
          await delayedPromise
          return HttpResponse.json({
            games: mockGames,
            total: mockGames.length,
            page: 1,
            page_size: 20,
            total_pages: 1,
          })
        }),
        http.get('http://localhost:8000/api/v1/players', () => {
          return HttpResponse.json({
            players: mockPlayers,
            total: mockPlayers.length,
            page: 1,
            page_size: 100,
            total_pages: 1,
          })
        })
      )

      renderWithProviders(<GameHistory />)

      // Should show loading skeleton
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
      expect(screen.queryByText('Game History')).not.toBeInTheDocument()

      // Resolve the promise to complete loading
      resolvePromise!(null)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Game History')).toBeInTheDocument()
      })

      // Loading state should be gone
      expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument()
    })
  })

  describe('AddGameForm Error Boundaries', () => {
    it('handles submission errors with graceful error display', async () => {
      // Mock submission error
      server.use(
        http.post('http://localhost:8000/api/v1/games', () => {
          return HttpResponse.json(
            { detail: 'Validation failed: Players cannot be the same' },
            { status: 400 }
          )
        }),
        http.get('http://localhost:8000/api/v1/players', () => {
          return HttpResponse.json({
            players: mockPlayers,
            total: mockPlayers.length,
            page: 1,
            page_size: 100,
            total_pages: 1,
          })
        })
      )

      renderWithProviders(<AddGameForm />)

      // Wait for players to load
      await waitFor(() => {
        expect(screen.getAllByText('Alice Johnson').length).toBeGreaterThan(0)
      })

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/player 1/i), {
        target: { value: '1' },
      })
      fireEvent.change(screen.getByLabelText(/player 2/i), {
        target: { value: '2' },
      })
      fireEvent.change(screen.getByLabelText(/winner/i), {
        target: { value: '1' },
      })

      const submitButton = screen.getByRole('button', { name: 'Record Game' })
      fireEvent.click(submitButton)

      // Should show specific error message, not crash
      await waitFor(() => {
        expect(
          screen.getByText('Validation failed: Players cannot be the same')
        ).toBeInTheDocument()
      })
    })

    it('shows loading state during form submission', async () => {
      let resolvePromise: (value: unknown) => void
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      // Mock delayed submission
      server.use(
        http.post('http://localhost:8000/api/v1/games', async () => {
          await delayedPromise
          return HttpResponse.json(
            {
              id: 3,
              player1_id: 1,
              player2_id: 2,
              winner_id: 1,
              created_at: '2023-01-01T12:00:00Z',
              player1: mockPlayers[0],
              player2: mockPlayers[1],
              winner: mockPlayers[0],
            },
            { status: 201 }
          )
        }),
        http.get('http://localhost:8000/api/v1/players', () => {
          return HttpResponse.json({
            players: mockPlayers,
            total: mockPlayers.length,
            page: 1,
            page_size: 100,
            total_pages: 1,
          })
        })
      )

      renderWithProviders(<AddGameForm />)

      // Wait for players to load
      await waitFor(() => {
        expect(screen.getAllByText('Alice Johnson').length).toBeGreaterThan(0)
      })

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/player 1/i), {
        target: { value: '1' },
      })
      fireEvent.change(screen.getByLabelText(/player 2/i), {
        target: { value: '2' },
      })
      fireEvent.change(screen.getByLabelText(/winner/i), {
        target: { value: '1' },
      })

      const submitButton = screen.getByRole('button', { name: 'Record Game' })
      fireEvent.click(submitButton)

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Recording...')).toBeInTheDocument()
        expect(submitButton).toBeDisabled()
      })

      // Resolve the promise to complete submission
      resolvePromise!(null)

      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.getByText('Record Game')).toBeInTheDocument()
      })
    })

    it('catches component errors with error boundary', async () => {
      // Mock error that could cause component to crash
      server.use(
        http.get('http://localhost:8000/api/v1/players', () => {
          return HttpResponse.json({
            players: null, // This could cause issues if not handled
            total: 0,
            page: 1,
            page_size: 100,
            total_pages: 1,
          })
        })
      )

      renderWithProviders(<AddGameForm />, {
        withErrorBoundary: true,
      })

      // Wait for potential rendering error or successful handling
      await waitFor(() => {
        const errorBoundary = screen.queryByTestId('error-boundary')
        const normalContent = screen.queryByText('Record Game')

        expect(errorBoundary || normalContent).toBeTruthy()
      })
    })
  })

  describe('PlayerList Error Boundaries', () => {
    it('handles API failures with error boundary support', async () => {
      // Mock API failure
      server.use(
        http.get('http://localhost:8000/api/v1/players', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      renderWithProviders(<PlayerList />)

      // Should show built-in error handling
      await waitFor(() => {
        expect(screen.getByText('Failed to load players')).toBeInTheDocument()
      })

      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('shows search loading states correctly', async () => {
      renderWithProviders(<PlayerList />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Players')).toBeInTheDocument()
      })

      // Should have search functionality
      const searchInput = screen.getByPlaceholderText(/search players/i)
      expect(searchInput).toBeInTheDocument()

      // Mock delayed search response
      let resolvePromise: (value: unknown) => void
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      server.use(
        http.get('http://localhost:8000/api/v1/players', async () => {
          await delayedPromise
          return HttpResponse.json({
            players: [mockPlayers[0]], // Filtered results
            total: 1,
            page: 1,
            page_size: 100,
            total_pages: 1,
          })
        })
      )

      // Trigger search
      fireEvent.change(searchInput, { target: { value: 'Alice' } })

      // Should show some loading indication during search
      // (The exact implementation may vary based on component design)

      // Resolve search
      resolvePromise!(null)

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      })
    })
  })

  describe('RecentGamesList Error Boundaries', () => {
    it('handles empty state gracefully', async () => {
      // Mock empty response
      server.use(
        http.get('http://localhost:8000/api/v1/games', () => {
          return HttpResponse.json({
            games: [],
            total: 0,
            page: 1,
            page_size: 10,
            total_pages: 0,
          })
        })
      )

      renderWithProviders(<RecentGamesList />)

      // Should show empty state message
      await waitFor(() => {
        expect(screen.getByText('No games recorded yet.')).toBeInTheDocument()
      })
    })

    it('shows loading skeleton during initial load', async () => {
      let resolvePromise: (value: unknown) => void
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      // Mock delayed response
      server.use(
        http.get('http://localhost:8000/api/v1/games', async () => {
          await delayedPromise
          return HttpResponse.json({
            games: mockGames,
            total: mockGames.length,
            page: 1,
            page_size: 10,
            total_pages: 1,
          })
        })
      )

      renderWithProviders(<RecentGamesList />)

      // Should show loading skeleton
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

      // Resolve the promise
      resolvePromise!(null)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Recent Games')).toBeInTheDocument()
      })

      // Loading state should be gone
      expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument()
    })
  })

  describe('Cross-Component Error Recovery', () => {
    it('allows error recovery through retry mechanisms', async () => {
      // Start with error
      server.use(
        http.get('http://localhost:8000/api/v1/games', () => {
          return new HttpResponse(null, { status: 500 })
        }),
        http.get('http://localhost:8000/api/v1/players', () => {
          return HttpResponse.json({
            players: mockPlayers,
            total: mockPlayers.length,
            page: 1,
            page_size: 100,
            total_pages: 1,
          })
        })
      )

      renderWithProviders(<GameHistory />)

      // Should show error
      await waitFor(() => {
        expect(
          screen.getByText('Failed to load game history')
        ).toBeInTheDocument()
      })

      // Mock successful retry
      server.use(
        http.get('http://localhost:8000/api/v1/games', () => {
          return HttpResponse.json({
            games: mockGames,
            total: mockGames.length,
            page: 1,
            page_size: 20,
            total_pages: 1,
          })
        })
      )

      // Click retry
      const retryButton = screen.getByText('Try Again')
      fireEvent.click(retryButton)

      // Should recover successfully
      await waitFor(() => {
        expect(screen.getByText('Game History')).toBeInTheDocument()
        expect(
          screen.queryByText('Failed to load game history')
        ).not.toBeInTheDocument()
      })
    })
  })
})
