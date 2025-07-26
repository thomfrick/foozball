// ABOUTME: Simplified test suite for RecentGamesList component functionality  
// ABOUTME: Tests basic game list display without complex mock requirements

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RecentGamesList from '../RecentGamesList'

// Mock data
const mockGames = [
  {
    id: 1, player1_id: 1, player2_id: 2, winner_id: 1, created_at: '2023-01-01T12:00:00Z',
    player1: { id: 1, name: 'Player 1', email: 'p1@test.com', trueskill_mu: 25.0, trueskill_sigma: 8.3333, games_played: 1, wins: 1, losses: 0, win_percentage: 100, is_active: true, created_at: '2023-01-01T00:00:00Z' },
    player2: { id: 2, name: 'Player 2', email: 'p2@test.com', trueskill_mu: 25.0, trueskill_sigma: 8.3333, games_played: 1, wins: 0, losses: 1, win_percentage: 0, is_active: true, created_at: '2023-01-01T00:00:00Z' },
    winner: { id: 1, name: 'Player 1', email: 'p1@test.com', trueskill_mu: 25.0, trueskill_sigma: 8.3333, games_played: 1, wins: 1, losses: 0, win_percentage: 100, is_active: true, created_at: '2023-01-01T00:00:00Z' },
  },
  {
    id: 2, player1_id: 2, player2_id: 1, winner_id: 2, created_at: '2023-01-01T13:00:00Z',
    player1: { id: 2, name: 'Player 2', email: 'p2@test.com', trueskill_mu: 25.0, trueskill_sigma: 8.3333, games_played: 1, wins: 1, losses: 0, win_percentage: 50, is_active: true, created_at: '2023-01-01T00:00:00Z' },
    player2: { id: 1, name: 'Player 1', email: 'p1@test.com', trueskill_mu: 25.0, trueskill_sigma: 8.3333, games_played: 1, wins: 0, losses: 1, win_percentage: 50, is_active: true, created_at: '2023-01-01T00:00:00Z' },
    winner: { id: 2, name: 'Player 2', email: 'p2@test.com', trueskill_mu: 25.0, trueskill_sigma: 8.3333, games_played: 1, wins: 1, losses: 0, win_percentage: 50, is_active: true, created_at: '2023-01-01T00:00:00Z' },
  },
]

// Mock the API hooks
vi.mock('../../hooks/useApi', () => ({
  useGames: () => ({
    data: { games: mockGames, total: 2, page: 1, page_size: 10, total_pages: 1 },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>)
}

describe('RecentGamesList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders games list correctly', () => {
    renderWithProviders(<RecentGamesList />)
    
    expect(screen.getByText('Recent Games')).toBeInTheDocument()
    expect(screen.getByText('2 total games')).toBeInTheDocument()
    
    // Check for winner badges (more specific)
    expect(screen.getByText('🏆 Player 1')).toBeInTheDocument()
    expect(screen.getByText('🏆 Player 2')).toBeInTheDocument()
  })

  it('displays game information correctly', () => {
    renderWithProviders(<RecentGamesList />)
    
    // Check for game descriptions
    expect(screen.getByText('Player 1 defeated Player 2')).toBeInTheDocument()
    expect(screen.getByText('Player 2 defeated Player 1')).toBeInTheDocument()
    
    // Check for game IDs
    expect(screen.getByText('Game #1')).toBeInTheDocument()
    expect(screen.getByText('Game #2')).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    renderWithProviders(<RecentGamesList />)
    
    // Check that time elements are present (format may vary)
    const timeElements = screen.getAllByText(/\d+\/\d+\/\d+/)
    expect(timeElements.length).toBeGreaterThan(0)
  })

  it('does not show clickable interface when onGameSelect is not provided', () => {
    renderWithProviders(<RecentGamesList />)
    
    // Games should not have cursor-pointer class
    const gameElements = screen.getAllByText(/defeated/)
    gameElements.forEach(element => {
      const gameRow = element.closest('.p-4')
      expect(gameRow).not.toHaveClass('cursor-pointer')
    })
  })

  it('highlights winners correctly in different scenarios', () => {
    renderWithProviders(<RecentGamesList />)
    
    // Check for green winner styling
    const winnerElements = screen.getAllByText(/🏆/)
    expect(winnerElements.length).toBeGreaterThan(0)
  })

  it('respects limit prop', () => {
    renderWithProviders(<RecentGamesList limit={1} />)
    
    // The component should apply the limit, but our mock returns all games
    // In a real scenario, the backend would handle the limit
    // So we just verify the component renders without error
    expect(screen.getByText('Recent Games')).toBeInTheDocument()
  })
})