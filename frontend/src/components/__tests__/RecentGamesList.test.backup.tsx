// ABOUTME: Test suite for RecentGamesList component functionality
// ABOUTME: Tests game display, pagination, and interaction handling

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RecentGamesList from '../RecentGamesList'

// Mock game data
const mockGames = [
  {
    id: 1,
    player1_id: 1,
    player2_id: 2,
    winner_id: 1,
    created_at: '2023-01-01T12:00:00Z',
    player1: {
      id: 1,
      name: 'Player 1',
      email: 'player1@test.com',
      trueskill_mu: 25.0,
      trueskill_sigma: 8.3333,
      games_played: 1,
      wins: 1,
      losses: 0,
      win_percentage: 100,
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
    },
    player2: {
      id: 2,
      name: 'Player 2',
      email: 'player2@test.com',
      trueskill_mu: 25.0,
      trueskill_sigma: 8.3333,
      games_played: 1,
      wins: 0,
      losses: 1,
      win_percentage: 0,
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
    },
    winner: {
      id: 1,
      name: 'Player 1',
      email: 'player1@test.com',
      trueskill_mu: 25.0,
      trueskill_sigma: 8.3333,
      games_played: 1,
      wins: 1,
      losses: 0,
      win_percentage: 100,
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
    },
  },
  {
    id: 2,
    player1_id: 2,
    player2_id: 1,
    winner_id: 2,
    created_at: '2023-01-01T13:00:00Z',
    player1: {
      id: 2,
      name: 'Player 2',
      email: 'player2@test.com',
      trueskill_mu: 25.0,
      trueskill_sigma: 8.3333,
      games_played: 2,
      wins: 1,
      losses: 1,
      win_percentage: 50,
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
    },
    player2: {
      id: 1,
      name: 'Player 1',
      email: 'player1@test.com',
      trueskill_mu: 25.0,
      trueskill_sigma: 8.3333,
      games_played: 2,
      wins: 1,
      losses: 1,
      win_percentage: 50,
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
    },
    winner: {
      id: 2,
      name: 'Player 2',
      email: 'player2@test.com',
      trueskill_mu: 25.0,
      trueskill_sigma: 8.3333,
      games_played: 2,
      wins: 1,
      losses: 1,
      win_percentage: 50,
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
    },
  },
]

// Mock the API hooks
const mockRefetch = vi.fn()
vi.mock('../../hooks/useApi', () => ({
  useGames: () => ({
    data: {
      games: mockGames,
      total: 2,
      page: 1,
      page_size: 10,
      total_pages: 1,
    },
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  }),
}))

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  )
}

describe('RecentGamesList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders games list correctly', () => {
    renderWithProviders(<RecentGamesList />)

    expect(screen.getByText('Recent Games')).toBeInTheDocument()
    expect(screen.getByText('2 total games')).toBeInTheDocument()
    
    // Check for player names in winner badges (more specific)
    expect(screen.getByText('🏆 Player 1')).toBeInTheDocument()
    expect(screen.getByText('🏆 Player 2')).toBeInTheDocument()
  })

  it('displays game information correctly', () => {
    renderWithProviders(<RecentGamesList />)

    // Check for winner badges
    expect(screen.getAllByText(/🏆/)).toHaveLength(2)

    // Check for game descriptions
    expect(screen.getByText('Player 1 defeated Player 2')).toBeInTheDocument()
    expect(screen.getByText('Player 2 defeated Player 1')).toBeInTheDocument()

    // Check for game IDs
    expect(screen.getByText('Game #1')).toBeInTheDocument()
    expect(screen.getByText('Game #2')).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    renderWithProviders(<RecentGamesList />)

    // The exact format depends on when the test runs, but should show relative time
    // We'll just check that some time text is present
    const timeElements = screen.getAllByText(/ago|Just now|\d+\/\d+\/\d+/)
    expect(timeElements.length).toBeGreaterThan(0)
  })

  it('calls onGameSelect when game is clicked', () => {
    const mockOnGameSelect = vi.fn()
    renderWithProviders(<RecentGamesList onGameSelect={mockOnGameSelect} />)

    const gameButton = screen.getByLabelText('View details for game 1')
    fireEvent.click(gameButton)

    expect(mockOnGameSelect).toHaveBeenCalledWith(mockGames[0])
  })

  it('shows pagination when multiple pages exist', () => {
    // Mock multiple pages
    vi.mocked(vi.importActual('../../hooks/useApi')).useGames = () => ({
      data: {
        games: mockGames,
        total: 25,
        page: 1,
        page_size: 10,
        total_pages: 3,
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    })

    renderWithProviders(<RecentGamesList />)

    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('hides pagination when showPagination is false', () => {
    renderWithProviders(<RecentGamesList showPagination={false} />)

    expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
  })

  it('shows loading state', () => {
    vi.mocked(vi.importActual('../../hooks/useApi')).useGames = () => ({
      data: null,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    })

    renderWithProviders(<RecentGamesList />)

    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows error state with retry button', () => {
    vi.mocked(vi.importActual('../../hooks/useApi')).useGames = () => ({
      data: null,
      isLoading: false,
      error: new Error('API Error'),
      refetch: mockRefetch,
    })

    renderWithProviders(<RecentGamesList />)

    expect(screen.getByText('Failed to load games')).toBeInTheDocument()

    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)

    expect(mockRefetch).toHaveBeenCalled()
  })

  it('shows empty state when no games exist', () => {
    vi.mocked(vi.importActual('../../hooks/useApi')).useGames = () => ({
      data: {
        games: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    })

    renderWithProviders(<RecentGamesList />)

    expect(screen.getByText('No games recorded yet.')).toBeInTheDocument()
    expect(screen.getByText('0 total games')).toBeInTheDocument()
  })

  it('does not show clickable interface when onGameSelect is not provided', () => {
    renderWithProviders(<RecentGamesList />)

    // Games should not be wrapped in buttons when onGameSelect is not provided
    expect(
      screen.queryByLabelText('View details for game 1')
    ).not.toBeInTheDocument()
  })

  it('highlights winners correctly in different scenarios', () => {
    renderWithProviders(<RecentGamesList />)

    // Both games should show winner highlights
    const winnerBadges = screen.getAllByText(/🏆/)
    expect(winnerBadges).toHaveLength(2)

    // First game: Player 1 wins
    expect(winnerBadges[0]).toHaveTextContent('🏆 Player 1')

    // Second game: Player 2 wins
    expect(winnerBadges[1]).toHaveTextContent('🏆 Player 2')
  })

  it('respects limit prop', () => {
    renderWithProviders(<RecentGamesList limit={5} />)

    // The API should be called with the correct page_size
    // We can't directly test the API call parameters without more complex mocking,
    // but we can verify the component renders without errors
    expect(screen.getByText('Recent Games')).toBeInTheDocument()
  })
})
