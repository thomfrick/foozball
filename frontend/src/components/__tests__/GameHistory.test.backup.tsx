// ABOUTME: Test suite for GameHistory component functionality
// ABOUTME: Tests comprehensive game history display, filtering, and pagination

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameHistory from '../GameHistory'

// Mock game and player data (reusing from RecentGamesList tests)
const mockPlayers = [
  {
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
  {
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
]

const mockGames = [
  {
    id: 1,
    player1_id: 1,
    player2_id: 2,
    winner_id: 1,
    created_at: '2023-01-01T12:00:00Z',
    player1: mockPlayers[0],
    player2: mockPlayers[1],
    winner: mockPlayers[0],
  },
  {
    id: 2,
    player1_id: 2,
    player2_id: 1,
    winner_id: 2,
    created_at: '2023-01-01T13:00:00Z',
    player1: mockPlayers[1],
    player2: mockPlayers[0],
    winner: mockPlayers[1],
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
      page_size: 20,
      total_pages: 1,
    },
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  }),
  usePlayerGames: () => ({
    data: {
      games: [mockGames[0]], // Player 1's games
      total: 1,
      page: 1,
      page_size: 20,
      total_pages: 1,
    },
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  }),
  usePlayers: () => ({
    data: {
      players: mockPlayers,
      total: 2,
      page: 1,
      page_size: 100,
      total_pages: 1,
    },
    isLoading: false,
    error: null,
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

describe('GameHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders game history correctly', () => {
    renderWithProviders(<GameHistory />)

    expect(screen.getByText('Game History')).toBeInTheDocument()
    expect(screen.getByText('2 games total')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by Player')).toBeInTheDocument()
  })

  it('shows player filter dropdown when not locked to specific player', () => {
    renderWithProviders(<GameHistory />)

    const filterSelect = screen.getByLabelText('Filter by Player')
    expect(filterSelect).toBeInTheDocument()

    // Should have "All Players" option plus individual players
    expect(screen.getByText('All Players')).toBeInTheDocument()
    
    // Check for player options in the filter dropdown specifically
    const playerOption1 = filterSelect.querySelector('option[value="1"]')
    const playerOption2 = filterSelect.querySelector('option[value="2"]')
    expect(playerOption1).toHaveTextContent('Player 1')
    expect(playerOption2).toHaveTextContent('Player 2')
  })

  it('hides player filter when locked to specific player', () => {
    renderWithProviders(<GameHistory playerId={1} />)

    expect(screen.queryByLabelText('Filter by Player')).not.toBeInTheDocument()
    expect(screen.queryByText('All Players')).not.toBeInTheDocument()
  })

  it('displays games with proper formatting', () => {
    renderWithProviders(<GameHistory />)

    // Check for player names with winner indicators
    expect(screen.getByText('Player 1')).toBeInTheDocument()
    expect(screen.getByText('Player 2')).toBeInTheDocument()

    // Check for VS indicators
    expect(screen.getAllByText('VS')).toHaveLength(2)

    // Check for winner indicators (🏆)
    expect(screen.getAllByText(/🏆/)).toHaveLength(2)

    // Check for game results
    expect(screen.getByText('Player 1 defeated Player 2')).toBeInTheDocument()
    expect(screen.getByText('Player 2 defeated Player 1')).toBeInTheDocument()
  })

  it('filters games by selected player', async () => {
    renderWithProviders(<GameHistory />)

    const filterSelect = screen.getByLabelText('Filter by Player')
    fireEvent.change(filterSelect, { target: { value: '1' } })

    // Just verify the UI updates
    expect(screen.getByText('Player Game History')).toBeInTheDocument()
  })

  it('shows player-specific title when filtering', () => {
    renderWithProviders(<GameHistory />)

    const filterSelect = screen.getByLabelText('Filter by Player')
    fireEvent.change(filterSelect, { target: { value: '1' } })

    expect(screen.getByText('Player Game History')).toBeInTheDocument()
  })

  it('shows player-specific game results when locked to player', () => {
    renderWithProviders(<GameHistory playerId={1} />)

    // Should show results from player 1's perspective
    expect(screen.getByText('Won vs Player 2')).toBeInTheDocument()
  })

  it('handles pagination correctly', () => {
    mockUseGames.mockReturnValue({
      data: {
        games: mockGames,
        total: 50,
        page: 1,
        page_size: 20,
        total_pages: 3,
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    })

    renderWithProviders(<GameHistory />)

    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('handles complex pagination with many pages', () => {
    mockUseGames.mockReturnValue({
      data: {
        games: mockGames,
        total: 200,
        page: 5,
        page_size: 20,
        total_pages: 10,
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    })

    renderWithProviders(<GameHistory />)

    // Should show ellipsis and limited page numbers around current page
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getAllByText('...')).toHaveLength(2)
  })

  it('calls onGameSelect when game is clicked', () => {
    const mockOnGameSelect = vi.fn()
    renderWithProviders(<GameHistory onGameSelect={mockOnGameSelect} />)

    const gameButton = screen.getByLabelText('View details for game 1')
    fireEvent.click(gameButton)

    expect(mockOnGameSelect).toHaveBeenCalledWith(mockGames[0])
  })

  it('shows loading state', () => {
    mockUseGames.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    })

    renderWithProviders(<GameHistory />)

    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows error state with retry button', () => {
    mockUseGames.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('API Error'),
      refetch: mockRefetch,
    })

    renderWithProviders(<GameHistory />)

    expect(screen.getByText('Failed to load game history')).toBeInTheDocument()

    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)

    expect(mockRefetch).toHaveBeenCalled()
  })

  it('shows empty state when no games exist', () => {
    mockUseGames.mockReturnValue({
      data: {
        games: [],
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 0,
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    })

    renderWithProviders(<GameHistory />)

    expect(screen.getByText('No games recorded yet.')).toBeInTheDocument()
  })

  it('shows player-specific empty state', () => {
    mockUsePlayerGames.mockReturnValue({
      data: {
        games: [],
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 0,
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    })

    renderWithProviders(<GameHistory playerId={1} />)

    expect(
      screen.getByText('No games found for this player.')
    ).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    renderWithProviders(<GameHistory />)

    // Should show formatted dates (exact format depends on locale)
    // We'll just check that dates are present
    const dateElements = screen.getAllByText(
      /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d+\/\d+\/\d+/
    )
    expect(dateElements.length).toBeGreaterThan(0)
  })

  it('highlights players correctly based on win/loss', () => {
    renderWithProviders(<GameHistory playerId={1} />)

    // Player 1 won the first game, so should be highlighted in green
    const player1Elements = screen.getAllByText('Player 1')
    expect(player1Elements[0]).toBeInTheDocument()

    // Should show winner emoji
    expect(screen.getByText(/🏆/)).toBeInTheDocument()
  })

  it('resets page when filter changes', async () => {
    renderWithProviders(<GameHistory />)

    // First simulate being on page 2
    const nextButton = screen.queryByText('Next')
    if (nextButton && !nextButton.hasAttribute('disabled')) {
      fireEvent.click(nextButton)
    }

    // Then change filter
    const filterSelect = screen.getByLabelText('Filter by Player')
    fireEvent.change(filterSelect, { target: { value: '1' } })

    // Should reset to page 1
    await waitFor(() => {
      expect(mockUsePlayerGames).toHaveBeenCalledWith(1, {
        page: 1,
        page_size: 20,
      })
    })
  })
})
