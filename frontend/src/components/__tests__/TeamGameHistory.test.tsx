// ABOUTME: Tests for TeamGameHistory component
// ABOUTME: Verifies team game display, filtering, pagination, and rating changes
/* eslint-disable @typescript-eslint/no-explicit-any */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../../contexts/ThemeContext'
import * as apiHooks from '../../hooks/useApi'
import TeamGameHistory from '../TeamGameHistory'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  )
}

const mockTeam1 = {
  id: 1,
  player1_id: 1,
  player2_id: 2,
  trueskill_mu: 50.0,
  trueskill_sigma: 5.0,
  games_played: 10,
  wins: 6,
  losses: 4,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: null,
  is_active: true,
  win_percentage: 60.0,
  conservative_rating: 35.0,
  player_names: 'Alice & Bob',
  player1: { id: 1, name: 'Alice' },
  player2: { id: 2, name: 'Bob' },
}

const mockTeam2 = {
  id: 2,
  player1_id: 3,
  player2_id: 4,
  trueskill_mu: 55.0,
  trueskill_sigma: 4.0,
  games_played: 15,
  wins: 10,
  losses: 5,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: null,
  is_active: true,
  win_percentage: 66.7,
  conservative_rating: 43.0,
  player_names: 'Charlie & Dana',
  player1: { id: 3, name: 'Charlie' },
  player2: { id: 4, name: 'Dana' },
}

const mockTeamGames = [
  {
    id: 1,
    team1_id: 1,
    team2_id: 2,
    winner_team_id: 1,
    created_at: '2023-01-15T12:00:00Z',
    team1: mockTeam1,
    team2: mockTeam2,
    winner_team: mockTeam1,
    loser_team_id: 2,
    loser_team: mockTeam2,
  },
  {
    id: 2,
    team1_id: 2,
    team2_id: 1,
    winner_team_id: 2,
    created_at: '2023-01-14T10:00:00Z',
    team1: mockTeam2,
    team2: mockTeam1,
    winner_team: mockTeam2,
    loser_team_id: 1,
    loser_team: mockTeam1,
  },
]

const mockTeams = [mockTeam1, mockTeam2]

describe('TeamGameHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays team games correctly', async () => {
    vi.spyOn(apiHooks, 'useTeamGames').mockReturnValue({
      data: {
        team_games: mockTeamGames,
        total: 2,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(apiHooks, 'useTeams').mockReturnValue({
      data: {
        teams: mockTeams,
        total: 2,
        page: 1,
        page_size: 100,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
    } as any)

    render(<TeamGameHistory />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Team Game History')).toBeInTheDocument()
      expect(screen.getByText('2 team games total')).toBeInTheDocument()
    })

    // Should display team names (multiple instances expected due to game cards)
    expect(screen.getAllByText(/Alice & Bob/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Charlie & Dana/).length).toBeGreaterThanOrEqual(
      1
    )
  })

  it('shows loading state correctly', () => {
    vi.spyOn(apiHooks, 'useTeamGames').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(apiHooks, 'useTeams').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    render(<TeamGameHistory />, { wrapper: createWrapper() })

    expect(screen.getByText('Team Game History')).toBeInTheDocument()
    // Should show loading skeletons
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows error state correctly', async () => {
    const mockRefetch = vi.fn()
    vi.spyOn(apiHooks, 'useTeamGames').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
      refetch: mockRefetch,
    } as any)

    vi.spyOn(apiHooks, 'useTeams').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any)

    render(<TeamGameHistory />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load team game history')
      ).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)
    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  it('shows empty state when no games exist', async () => {
    vi.spyOn(apiHooks, 'useTeamGames').mockReturnValue({
      data: {
        team_games: [],
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 0,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(apiHooks, 'useTeams').mockReturnValue({
      data: {
        teams: mockTeams,
        total: 2,
        page: 1,
        page_size: 100,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
    } as any)

    render(<TeamGameHistory />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('No team games found')).toBeInTheDocument()
      expect(screen.getByText('Record Team Game')).toBeInTheDocument()
    })
  })

  it('handles team filtering correctly', async () => {
    const mockUseTeamGames = vi.spyOn(apiHooks, 'useTeamGames')

    mockUseTeamGames.mockReturnValue({
      data: {
        team_games: mockTeamGames,
        total: 2,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(apiHooks, 'useTeams').mockReturnValue({
      data: {
        teams: mockTeams,
        total: 2,
        page: 1,
        page_size: 100,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
    } as any)

    render(<TeamGameHistory />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByLabelText('Filter by Team')).toBeInTheDocument()
    })

    const filterSelect = screen.getByLabelText('Filter by Team')
    fireEvent.change(filterSelect, { target: { value: '1' } })

    // Should call useTeamGames with team_id filter
    await waitFor(() => {
      expect(mockUseTeamGames).toHaveBeenCalledWith(
        expect.objectContaining({
          team_id: 1,
        })
      )
    })
  })

  it('handles pagination correctly', async () => {
    const mockUseTeamGames = vi.spyOn(apiHooks, 'useTeamGames')

    mockUseTeamGames.mockReturnValue({
      data: {
        team_games: mockTeamGames,
        total: 40,
        page: 1,
        page_size: 20,
        total_pages: 2,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(apiHooks, 'useTeams').mockReturnValue({
      data: {
        teams: mockTeams,
        total: 2,
        page: 1,
        page_size: 100,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
    } as any)

    render(<TeamGameHistory />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument()
    })

    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    // Should call useTeamGames with next page
    await waitFor(() => {
      expect(mockUseTeamGames).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        })
      )
    })
  })

  it('displays rating changes when team is selected', async () => {
    vi.spyOn(apiHooks, 'useTeamGames').mockReturnValue({
      data: {
        team_games: mockTeamGames,
        total: 2,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(apiHooks, 'useTeams').mockReturnValue({
      data: {
        teams: mockTeams,
        total: 2,
        page: 1,
        page_size: 100,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
    } as any)

    render(<TeamGameHistory teamId={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getAllByText(/Rating:/).length).toBeGreaterThanOrEqual(1)
    })

    // Should show rating change indicators
    expect(
      document.querySelector('.text-green-600, .text-red-600')
    ).toBeInTheDocument()
  })

  it('hides team filter when teamId is provided', async () => {
    vi.spyOn(apiHooks, 'useTeamGames').mockReturnValue({
      data: {
        team_games: mockTeamGames,
        total: 2,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(apiHooks, 'useTeams').mockReturnValue({
      data: {
        teams: mockTeams,
        total: 2,
        page: 1,
        page_size: 100,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
    } as any)

    render(<TeamGameHistory teamId={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.queryByLabelText('Filter by Team')).not.toBeInTheDocument()
    })
  })

  it('handles game selection callback', async () => {
    const onGameSelect = vi.fn()

    vi.spyOn(apiHooks, 'useTeamGames').mockReturnValue({
      data: {
        team_games: mockTeamGames,
        total: 2,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(apiHooks, 'useTeams').mockReturnValue({
      data: {
        teams: mockTeams,
        total: 2,
        page: 1,
        page_size: 100,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
    } as any)

    render(<TeamGameHistory onGameSelect={onGameSelect} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      const gameCards = screen.getAllByRole('button')
      expect(gameCards.length).toBeGreaterThan(0)
    })

    const firstGameCard = screen.getAllByRole('button')[0]
    fireEvent.click(firstGameCard)

    expect(onGameSelect).toHaveBeenCalledWith(mockTeamGames[0])
  })

  it('respects limit prop', async () => {
    const onGameSelect = vi.fn()

    vi.spyOn(apiHooks, 'useTeamGames').mockReturnValue({
      data: {
        team_games: mockTeamGames.slice(0, 1),
        total: 1,
        page: 1,
        page_size: 1,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(apiHooks, 'useTeams').mockReturnValue({
      data: {
        teams: mockTeams,
        total: 2,
        page: 1,
        page_size: 100,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
    } as any)

    render(<TeamGameHistory limit={1} onGameSelect={onGameSelect} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      const gameCards = screen.getAllByRole('button')
      expect(gameCards).toHaveLength(1)
    })
  })

  it('displays formatted dates correctly', async () => {
    vi.spyOn(apiHooks, 'useTeamGames').mockReturnValue({
      data: {
        team_games: mockTeamGames,
        total: 2,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(apiHooks, 'useTeams').mockReturnValue({
      data: {
        teams: mockTeams,
        total: 2,
        page: 1,
        page_size: 100,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
    } as any)

    render(<TeamGameHistory />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText(/Jan 15, 2023/)).toBeInTheDocument()
      expect(screen.getByText(/Jan 14, 2023/)).toBeInTheDocument()
    })
  })
})

describe('TeamGameHistory - Accessibility', () => {
  it('has proper heading structure', async () => {
    vi.spyOn(apiHooks, 'useTeamGames').mockReturnValue({
      data: {
        team_games: mockTeamGames,
        total: 2,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(apiHooks, 'useTeams').mockReturnValue({
      data: {
        teams: mockTeams,
        total: 2,
        page: 1,
        page_size: 100,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
    } as any)

    render(<TeamGameHistory />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /team game history/i })
      ).toBeInTheDocument()
    })
  })

  it('has proper form labels', async () => {
    vi.spyOn(apiHooks, 'useTeamGames').mockReturnValue({
      data: {
        team_games: mockTeamGames,
        total: 2,
        page: 1,
        page_size: 20,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.spyOn(apiHooks, 'useTeams').mockReturnValue({
      data: {
        teams: mockTeams,
        total: 2,
        page: 1,
        page_size: 100,
        total_pages: 1,
      },
      isLoading: false,
      error: null,
    } as any)

    render(<TeamGameHistory />, { wrapper: createWrapper() })

    await waitFor(() => {
      const filterSelect = screen.getByLabelText('Filter by Team')
      expect(filterSelect).toBeInTheDocument()
    })
  })
})
