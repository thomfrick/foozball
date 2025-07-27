// ABOUTME: Tests for Leaderboard component displaying TrueSkill rankings
// ABOUTME: Verifies sorting logic, ranking display, and loading states

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { usePlayers } from '../../hooks/useApi'
import type { PlayerListResponse } from '../../types/player'
import Leaderboard from '../Leaderboard'

// Mock the API hook
vi.mock('../../hooks/useApi', () => ({
  usePlayers: vi.fn(),
}))

const mockUsePlayers = usePlayers as jest.MockedFunction<typeof usePlayers>

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createQueryClient()
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </ThemeProvider>
  )
}

const mockPlayersData: PlayerListResponse = {
  players: [
    {
      id: 1,
      name: 'Top Player',
      email: 'top@example.com',
      trueskill_mu: 35.0,
      trueskill_sigma: 3.0,
      games_played: 20,
      wins: 15,
      losses: 5,
      created_at: '2023-01-01T00:00:00Z',
      is_active: true,
      win_percentage: 75.0,
    },
    {
      id: 2,
      name: 'Middle Player',
      email: 'middle@example.com',
      trueskill_mu: 25.0,
      trueskill_sigma: 5.0,
      games_played: 10,
      wins: 5,
      losses: 5,
      created_at: '2023-01-02T00:00:00Z',
      is_active: true,
      win_percentage: 50.0,
    },
    {
      id: 3,
      name: 'New Player',
      email: 'new@example.com',
      trueskill_mu: 25.0,
      trueskill_sigma: 8.3333,
      games_played: 0,
      wins: 0,
      losses: 0,
      created_at: '2023-01-03T00:00:00Z',
      is_active: true,
      win_percentage: 0.0,
    },
  ],
  total: 3,
  page: 1,
  page_size: 10,
  total_pages: 1,
}

describe('Leaderboard', () => {
  it('displays loading skeleton', () => {
    mockUsePlayers.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderWithQueryClient(<Leaderboard />)

    expect(screen.getByText('Leaderboard')).toBeInTheDocument()

    // Should show loading skeleton
    const skeletonElements = screen.getAllByRole('generic')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('displays error message', () => {
    mockUsePlayers.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    })

    renderWithQueryClient(<Leaderboard />)

    expect(
      screen.getByText('Failed to load leaderboard. Please try again.')
    ).toBeInTheDocument()
  })

  it('displays empty state when no players', () => {
    mockUsePlayers.mockReturnValue({
      data: { players: [], total: 0, page: 1, page_size: 10, total_pages: 0 },
      isLoading: false,
      error: null,
    })

    renderWithQueryClient(<Leaderboard />)

    expect(
      screen.getByText(
        'No players found. Add some players to see the leaderboard!'
      )
    ).toBeInTheDocument()
  })

  it('sorts players by conservative rating', async () => {
    mockUsePlayers.mockReturnValue({
      data: mockPlayersData,
      isLoading: false,
      error: null,
    })

    renderWithQueryClient(<Leaderboard />)

    await waitFor(() => {
      expect(screen.getByText('Top Player')).toBeInTheDocument()
    })

    // Calculate expected conservative ratings:
    // Top Player: 35.0 - 3*3.0 = 26.0
    // Middle Player: 25.0 - 3*5.0 = 10.0
    // New Player: 25.0 - 3*8.3333 = 0.0

    const playerElements = screen
      .getAllByRole('generic')
      .filter((el) => el.textContent?.includes('Player'))

    // Should be sorted by conservative rating (Top > Middle > New)
    expect(playerElements[0]).toHaveTextContent('Top Player')
    expect(playerElements[1]).toHaveTextContent('Middle Player')
    expect(playerElements[2]).toHaveTextContent('New Player')
  })

  it('displays correct rank icons', async () => {
    mockUsePlayers.mockReturnValue({
      data: mockPlayersData,
      isLoading: false,
      error: null,
    })

    renderWithQueryClient(<Leaderboard />)

    await waitFor(() => {
      expect(screen.getByText('🥇')).toBeInTheDocument() // 1st place
      expect(screen.getByText('🥈')).toBeInTheDocument() // 2nd place
      expect(screen.getByText('🥉')).toBeInTheDocument() // 3rd place
    })
  })

  it('shows conservative ratings correctly', async () => {
    mockUsePlayers.mockReturnValue({
      data: mockPlayersData,
      isLoading: false,
      error: null,
    })

    renderWithQueryClient(<Leaderboard />)

    await waitFor(() => {
      // Top Player: 35.0 - 3*3.0 = 26.0
      expect(screen.getByText('26.0')).toBeInTheDocument()

      // Middle Player: 25.0 - 3*5.0 = 10.0
      expect(screen.getByText('10.0')).toBeInTheDocument()

      // New Player: 25.0 - 3*8.3333 ≈ 0.0
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })
  })

  it('displays uncertainty levels with correct colors', async () => {
    mockUsePlayers.mockReturnValue({
      data: mockPlayersData,
      isLoading: false,
      error: null,
    })

    renderWithQueryClient(<Leaderboard />)

    await waitFor(() => {
      expect(screen.getAllByText('High certainty')).toHaveLength(1) // σ = 3.0 (low uncertainty)
      expect(screen.getAllByText('Medium certainty')).toHaveLength(1) // σ = 5.0 (medium uncertainty)
      expect(screen.getAllByText('Low certainty')).toHaveLength(1) // σ = 8.3333 (high uncertainty)
    })
  })

  it('respects limit prop', () => {
    mockUsePlayers.mockReturnValue({
      data: mockPlayersData,
      isLoading: false,
      error: null,
    })

    renderWithQueryClient(<Leaderboard limit={2} />)

    // Should pass limit to usePlayers hook
    expect(mockUsePlayers).toHaveBeenCalledWith({
      page_size: 2,
      active_only: true,
    })
  })

  it('can hide rankings when requested', async () => {
    mockUsePlayers.mockReturnValue({
      data: mockPlayersData,
      isLoading: false,
      error: null,
    })

    renderWithQueryClient(<Leaderboard showRankings={false} />)

    await waitFor(() => {
      expect(screen.queryByText('🥇')).not.toBeInTheDocument()
      expect(screen.queryByText('🥈')).not.toBeInTheDocument()
      expect(screen.queryByText('🥉')).not.toBeInTheDocument()
    })
  })
})
