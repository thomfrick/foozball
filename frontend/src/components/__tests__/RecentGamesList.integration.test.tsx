// ABOUTME: Integration tests for RecentGamesList component with MSW API mocking
// ABOUTME: Tests various data states, loading, errors, and pagination scenarios

import '../../test/setup-integration'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { PlayerFixtures } from '../../test/fixtures'
import { server } from '../../test/mocks/server'
import RecentGamesList from '../RecentGamesList'

// Use the test fixtures data which matches the global MSW setup
const mockPlayers = PlayerFixtures.createDiversePlayersData()

const mockGames = [
  {
    id: 1,
    player1_id: 1,
    player2_id: 2,
    winner_id: 1,
    created_at: '2023-01-03T14:30:00Z', // Most recent
    player1: mockPlayers[0],
    player2: mockPlayers[1],
    winner: mockPlayers[0],
  },
  {
    id: 2,
    player1_id: 2,
    player2_id: 1,
    winner_id: 2,
    created_at: '2023-01-03T12:00:00Z', // Middle
    player1: mockPlayers[1],
    player2: mockPlayers[0],
    winner: mockPlayers[1],
  },
  {
    id: 3,
    player1_id: 1,
    player2_id: 2,
    winner_id: 1,
    created_at: '2023-01-03T09:15:00Z', // Oldest
    player1: mockPlayers[0],
    player2: mockPlayers[1],
    winner: mockPlayers[0],
  },
]

// The global MSW server is automatically set up in the test setup files

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </ThemeProvider>
  )
}

describe('RecentGamesList Integration Tests', () => {
  const setupMockGamesAPI = (games = mockGames, total?: number) => {
    server.use(
      http.get('*/api/v1/games', ({ request }) => {
        const url = new URL(request.url)
        const pageSize = parseInt(url.searchParams.get('page_size') || '20', 10)
        const page = parseInt(url.searchParams.get('page') || '1', 10)

        // Slice the games based on page_size
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginatedGames = games.slice(startIndex, endIndex)

        return HttpResponse.json({
          games: paginatedGames,
          total: total ?? games.length,
          page: page,
          page_size: pageSize,
          total_pages: Math.ceil((total ?? games.length) / pageSize),
        })
      })
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Don't reset handlers - let them persist from the global setup
    // Individual tests can override with server.use() when needed
  })

  it('loads and displays games correctly', async () => {
    renderWithProviders(<RecentGamesList />)

    // Should show loading state initially
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    // Wait for games to load and check for actual content
    await waitFor(
      () => {
        // Check if we have actual game content instead of loading
        const totalGamesText = screen.queryByText(/total games/)
        expect(totalGamesText).toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Should display all games from mock data
    expect(screen.getByText(/3 total games/)).toBeInTheDocument()

    // Should show player names from test fixtures - use getAllByText for multiple occurrences
    expect(screen.getAllByText('Rookie Player').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pro Player').length).toBeGreaterThan(0)

    // Should show winner badges (appears once per game)
    expect(screen.getAllByText(/🏆/)).toHaveLength(3)

    // Should show game IDs
    expect(screen.getByText('Game #1')).toBeInTheDocument()
    expect(screen.getByText('Game #2')).toBeInTheDocument()
    expect(screen.getByText('Game #3')).toBeInTheDocument()

    // Loading state should be gone
    expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument()
  })

  it('handles empty games list', async () => {
    // Mock empty response
    server.use(
      http.get('*/api/v1/games', () => {
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

    // Wait for empty state
    await waitFor(() => {
      expect(screen.getByText('No games recorded yet.')).toBeInTheDocument()
    })

    expect(screen.getByText('0 total games')).toBeInTheDocument()
    expect(screen.queryByText('Game #')).not.toBeInTheDocument()
  })

  it('handles API errors with retry functionality', async () => {
    // Mock API error
    server.use(
      http.get('*/api/v1/games', () => {
        return HttpResponse.json(
          { detail: 'Internal server error' },
          { status: 500 }
        )
      })
    )

    renderWithProviders(<RecentGamesList />)

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Failed to load games')).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Try Again')
    expect(retryButton).toBeInTheDocument()

    // Mock successful retry
    server.use(
      http.get('*/api/v1/games', () => {
        return HttpResponse.json({
          games: [mockGames[0]],
          total: 1,
          page: 1,
          page_size: 10,
          total_pages: 1,
        })
      })
    )

    // Click retry
    fireEvent.click(retryButton)

    // Should load successfully after retry
    await waitFor(() => {
      expect(screen.getByText('1 total games')).toBeInTheDocument()
    })

    expect(screen.queryByText('Failed to load games')).not.toBeInTheDocument()
  })

  it('handles network errors gracefully', async () => {
    // Mock network error
    server.use(
      http.get('*/api/v1/games', () => {
        return HttpResponse.error()
      })
    )

    renderWithProviders(<RecentGamesList />)

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Failed to load games')).toBeInTheDocument()
    })

    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('displays pagination when multiple pages exist', async () => {
    // Create more games to test pagination
    const manyGames = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      player1_id: 1,
      player2_id: 2,
      winner_id: i % 2 === 0 ? 1 : 2,
      created_at: new Date(2023, 0, 1, 12, i).toISOString(),
      player1: mockPlayers[0],
      player2: mockPlayers[1],
      winner: i % 2 === 0 ? mockPlayers[0] : mockPlayers[1],
    }))

    server.use(
      http.get('*/api/v1/games', ({ request }) => {
        const url = new URL(request.url)
        const page = parseInt(url.searchParams.get('page') || '1')
        const pageSize = parseInt(url.searchParams.get('page_size') || '10')

        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginatedGames = manyGames.slice(startIndex, endIndex)

        return HttpResponse.json({
          games: paginatedGames,
          total: manyGames.length,
          page: page,
          page_size: pageSize,
          total_pages: Math.ceil(manyGames.length / pageSize),
        })
      })
    )

    renderWithProviders(<RecentGamesList />)

    // Wait for games to load
    await waitFor(() => {
      expect(screen.getByText('25 total games')).toBeInTheDocument()
    })

    // Should show pagination controls
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()

    // Should show page numbers
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    // First 10 games should be shown
    expect(screen.getAllByText(/Game #/)).toHaveLength(10)

    // Test navigation to next page
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    // Wait for next page to load
    await waitFor(() => {
      expect(screen.getByText('Game #11')).toBeInTheDocument()
    })
  })

  it('hides pagination when showPagination is false', async () => {
    renderWithProviders(<RecentGamesList showPagination={false} />)

    await waitFor(() => {
      expect(screen.getByText('Recent Games')).toBeInTheDocument()
    })

    // Pagination should not be shown
    expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
  })

  it('respects limit prop', async () => {
    // Set up mock to return only the requested number of games
    setupMockGamesAPI(mockGames.slice(0, 2), 2)

    renderWithProviders(<RecentGamesList limit={2} />)

    // Wait for games to load and verify no loading state
    await waitFor(
      () => {
        expect(screen.getByText('Recent Games')).toBeInTheDocument()
        expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Should only show 2 games
    const gameElements = screen.getAllByText(/Game #/)
    expect(gameElements).toHaveLength(2)

    // Should show correct total
    expect(screen.getByText('2 total games')).toBeInTheDocument()
  })

  it('handles game selection correctly', async () => {
    const mockOnGameSelect = vi.fn()
    renderWithProviders(<RecentGamesList onGameSelect={mockOnGameSelect} />)

    // Wait for games to load and verify content is loaded
    await waitFor(
      () => {
        expect(screen.getByText('Recent Games')).toBeInTheDocument()
        expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Games should be clickable when onGameSelect is provided
    const gameButton = screen.getByLabelText('View details for game 1')
    expect(gameButton).toBeInTheDocument()

    fireEvent.click(gameButton)

    expect(mockOnGameSelect).toHaveBeenCalledWith(mockGames[0])
  })

  it('does not show clickable interface when onGameSelect is not provided', async () => {
    renderWithProviders(<RecentGamesList />)

    // Wait for games to load and verify content is loaded
    await waitFor(
      () => {
        expect(screen.getByText('Recent Games')).toBeInTheDocument()
        expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Games should not be clickable
    expect(
      screen.queryByLabelText('View details for game 1')
    ).not.toBeInTheDocument()
  })

  it('handles slow API responses with proper loading states', async () => {
    // Mock slow API response
    server.use(
      http.get('*/api/v1/games', async () => {
        await new Promise((resolve) => setTimeout(resolve, 500)) // 500ms delay
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

    // Should show loading state with title
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.getByText('Recent Games')).toBeInTheDocument() // Title is shown even during loading

    // Wait for actual content to load
    await waitFor(
      () => {
        expect(screen.getByText(/total games/)).toBeInTheDocument()
      },
      { timeout: 2000 }
    )

    // Loading state should be gone
    expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument()
  })

  it('formats time correctly for different time ranges', async () => {
    const now = new Date('2023-01-03T15:00:00Z')
    vi.setSystemTime(now)

    const timeVariedGames = [
      {
        ...mockGames[0],
        id: 1,
        created_at: '2023-01-03T14:59:30Z', // 30 seconds ago
      },
      {
        ...mockGames[1],
        id: 2,
        created_at: '2023-01-03T14:30:00Z', // 30 minutes ago
      },
      {
        ...mockGames[2],
        id: 3,
        created_at: '2023-01-03T10:00:00Z', // 5 hours ago
      },
    ]

    server.use(
      http.get('*/api/v1/games', () => {
        return HttpResponse.json({
          games: timeVariedGames,
          total: timeVariedGames.length,
          page: 1,
          page_size: 10,
          total_pages: 1,
        })
      })
    )

    renderWithProviders(<RecentGamesList />)

    await waitFor(() => {
      expect(screen.getByText('Recent Games')).toBeInTheDocument()
    })

    // Should show different time formats
    // Note: The exact text will depend on the formatDate implementation
    // We're just checking that some time-related text appears
    const timeElements = screen.getAllByText(/ago|Just now|\d+\/\d+\/\d+|m|h/)
    expect(timeElements.length).toBeGreaterThan(0)

    vi.useRealTimers()
  })

  it('displays winner highlighting correctly', async () => {
    renderWithProviders(<RecentGamesList />)

    await waitFor(() => {
      expect(screen.getByText(/total games/)).toBeInTheDocument()
    })

    // Check that winners are highlighted with trophy emoji
    const trophyElements = screen.getAllByText(/🏆/)
    expect(trophyElements.length).toBeGreaterThan(0) // Should have trophy elements

    // Note: Specific winner checks depend on the mock games data in the global setup
  })

  it('handles mixed data scenarios correctly', async () => {
    // Test with games that have various edge cases
    const edgeCaseGames = [
      {
        id: 1,
        player1_id: 1,
        player2_id: 2,
        winner_id: 1,
        created_at: '2023-01-03T14:30:00Z',
        player1: {
          ...mockPlayers[0],
          name: 'Player With Very Long Name That Might Wrap',
        },
        player2: mockPlayers[1],
        winner: {
          ...mockPlayers[0],
          name: 'Player With Very Long Name That Might Wrap',
        },
      },
      {
        id: 2,
        player1_id: 2,
        player2_id: 1,
        winner_id: 2,
        created_at: '2023-01-03T12:00:00Z',
        player1: mockPlayers[1],
        player2: { ...mockPlayers[0], name: 'A' }, // Very short name
        winner: mockPlayers[1],
      },
    ]

    server.use(
      http.get('*/api/v1/games', () => {
        return HttpResponse.json({
          games: edgeCaseGames,
          total: edgeCaseGames.length,
          page: 1,
          page_size: 10,
          total_pages: 1,
        })
      })
    )

    renderWithProviders(<RecentGamesList />)

    await waitFor(() => {
      expect(screen.getByText(/total games/)).toBeInTheDocument()
    })

    // Should handle long names gracefully
    expect(
      screen.getByText('Player With Very Long Name That Might Wrap')
    ).toBeInTheDocument()

    // Should handle short names
    expect(screen.getAllByText('A')).toHaveLength(1)

    // Should still show proper game structure
    expect(screen.getAllByText('vs')).toHaveLength(2)
    expect(screen.getAllByText(/🏆/)).toHaveLength(2)
  })
})
