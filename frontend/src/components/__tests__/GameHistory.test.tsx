// ABOUTME: Simplified test suite for GameHistory component functionality
// ABOUTME: Tests basic game history display without complex mock requirements

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../../contexts/ThemeContext'
import GameHistory from '../GameHistory'

// Simplified mock data
const mockPlayers = [
  {
    id: 1,
    name: 'Player 1',
    email: 'p1@test.com',
    trueskill_mu: 25.0,
    trueskill_sigma: 8.3333,
    games_played: 1,
    wins: 1,
    losses: 0,
    win_percentage: 100,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Player 2',
    email: 'p2@test.com',
    trueskill_mu: 25.0,
    trueskill_sigma: 8.3333,
    games_played: 1,
    wins: 0,
    losses: 1,
    win_percentage: 0,
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
    created_at: '2023-01-01T13:00:00Z',
    player1: mockPlayers[0],
    player2: mockPlayers[1],
    winner: mockPlayers[0],
  },
  {
    id: 2,
    player1_id: 2,
    player2_id: 1,
    winner_id: 2,
    created_at: '2023-01-01T14:00:00Z',
    player1: mockPlayers[1],
    player2: mockPlayers[0],
    winner: mockPlayers[1],
  },
]

// Mock the hooks
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
  usePlayerGames: () => ({
    data: {
      games: [mockGames[0]],
      total: 1,
      page: 1,
      page_size: 20,
      total_pages: 1,
    },
    isLoading: false,
    error: null,
  }),
}))

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </ThemeProvider>
  )
}

describe('GameHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders game history title', () => {
    renderWithProviders(<GameHistory />)
    expect(screen.getByText('Game History')).toBeInTheDocument()
  })

  it('shows game count', () => {
    renderWithProviders(<GameHistory />)
    expect(screen.getByText('2 games total')).toBeInTheDocument()
  })

  it('shows player filter dropdown when not locked to specific player', () => {
    renderWithProviders(<GameHistory />)
    const filterSelect = screen.getByLabelText('Filter by Player')
    expect(filterSelect).toBeInTheDocument()
    expect(screen.getByText('All Players')).toBeInTheDocument()
  })

  it('hides player filter when locked to specific player', () => {
    renderWithProviders(<GameHistory playerId={1} />)
    expect(screen.queryByLabelText('Filter by Player')).not.toBeInTheDocument()
  })

  it('displays games with proper formatting', () => {
    renderWithProviders(<GameHistory />)

    // Check for defeat messages
    expect(screen.getByText('Player 1 defeated Player 2')).toBeInTheDocument()
    expect(screen.getByText('Player 2 defeated Player 1')).toBeInTheDocument()
  })

  it('shows player-specific game results when locked to player', () => {
    renderWithProviders(<GameHistory playerId={1} />)
    expect(screen.getByText('Won vs Player 2')).toBeInTheDocument()
  })
})
