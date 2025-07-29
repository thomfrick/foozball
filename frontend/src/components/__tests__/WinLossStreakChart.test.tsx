// ABOUTME: Tests for WinLossStreakChart component
// ABOUTME: Verifies win/loss streak visualization and statistics
/* eslint-disable @typescript-eslint/no-explicit-any */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import * as useApiHooks from '../../hooks/useApi'
import WinLossStreakChart from '../WinLossStreakChart'

// Mock Recharts
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ dataKey }: any) => <div data-testid="bar">{dataKey}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: ({ fill }: any) => <div data-testid="cell" style={{ fill }} />,
}))

// Mock API hooks
vi.mock('../../hooks/useApi')

const mockUsePlayerGames = vi.mocked(useApiHooks.usePlayerGames)

type MockReturnType = {
  data: typeof mockGamesData | undefined
  isLoading: boolean
  error: Error | null
}

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  )
}

const mockGamesData = {
  games: [
    {
      id: 1,
      player1_id: 1,
      player2_id: 2,
      winner_id: 1, // Player 1 wins
      created_at: '2024-01-01T10:00:00Z',
      player1: { id: 1, name: 'Player One' },
      player2: { id: 2, name: 'Player Two' },
      winner: { id: 1, name: 'Player One' },
    },
    {
      id: 2,
      player1_id: 1,
      player2_id: 3,
      winner_id: 1, // Player 1 wins again
      created_at: '2024-01-02T10:00:00Z',
      player1: { id: 1, name: 'Player One' },
      player2: { id: 3, name: 'Player Three' },
      winner: { id: 1, name: 'Player One' },
    },
    {
      id: 3,
      player1_id: 1,
      player2_id: 2,
      winner_id: 2, // Player 1 loses
      created_at: '2024-01-03T10:00:00Z',
      player1: { id: 1, name: 'Player One' },
      player2: { id: 2, name: 'Player Two' },
      winner: { id: 2, name: 'Player Two' },
    },
    {
      id: 4,
      player1_id: 2,
      player2_id: 1,
      winner_id: 2, // Player 1 loses again
      created_at: '2024-01-04T10:00:00Z',
      player1: { id: 2, name: 'Player Two' },
      player2: { id: 1, name: 'Player One' },
      winner: { id: 2, name: 'Player Two' },
    },
  ],
  total: 4,
  page: 1,
  page_size: 50,
  total_pages: 1,
}

describe('WinLossStreakChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    mockUsePlayerGames.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as MockReturnType)

    renderWithProviders(<WinLossStreakChart playerId={1} />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders error state', () => {
    const error = new Error('Failed to load games')
    mockUsePlayerGames.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    } as MockReturnType)

    renderWithProviders(<WinLossStreakChart playerId={1} />)

    expect(screen.getByText('Failed to load game history')).toBeInTheDocument()
    expect(screen.getByText('Failed to load games')).toBeInTheDocument()
  })

  it('renders empty state when no games', () => {
    mockUsePlayerGames.mockReturnValue({
      data: { games: [], total: 0, page: 1, page_size: 50, total_pages: 0 },
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<WinLossStreakChart playerId={1} />)

    expect(screen.getByText('No games found')).toBeInTheDocument()
    expect(
      screen.getByText('Play some games to see win/loss streaks')
    ).toBeInTheDocument()
  })

  it('renders chart with games data', () => {
    mockUsePlayerGames.mockReturnValue({
      data: mockGamesData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(
      <WinLossStreakChart playerId={1} playerName="Test Player" />
    )

    expect(
      screen.getByText("Test Player's Win/Loss Streaks")
    ).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('displays streak statistics correctly', () => {
    mockUsePlayerGames.mockReturnValue({
      data: mockGamesData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(
      <WinLossStreakChart playerId={1} playerName="Test Player" />
    )

    // Current streak should be 2 game win streak (first two games were wins)
    expect(screen.getByText('Current:')).toBeInTheDocument()
    expect(screen.getByText('2 game win streak')).toBeInTheDocument()

    // Best win streak should be 2 (first two games were wins)
    expect(screen.getByText('Best win streak:')).toBeInTheDocument()

    // Worst loss streak should be 2 (last two games were losses)
    expect(screen.getByText('Worst loss streak:')).toBeInTheDocument()
  })

  it('renders without player name', () => {
    mockUsePlayerGames.mockReturnValue({
      data: mockGamesData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<WinLossStreakChart playerId={1} />)

    expect(screen.getByText('Win/Loss Streaks')).toBeInTheDocument()
  })

  it('shows legend for win/loss colors', () => {
    mockUsePlayerGames.mockReturnValue({
      data: mockGamesData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<WinLossStreakChart playerId={1} />)

    expect(screen.getByText('Win streaks')).toBeInTheDocument()
    expect(screen.getByText('Loss streaks')).toBeInTheDocument()
    expect(screen.getByText('Showing last 4 games')).toBeInTheDocument()
  })

  it('passes correct props to usePlayerGames hook', () => {
    mockUsePlayerGames.mockReturnValue({
      data: mockGamesData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<WinLossStreakChart playerId={42} maxGames={25} />)

    expect(mockUsePlayerGames).toHaveBeenCalledWith(42, { page_size: 25 })
  })

  it('uses default maxGames when not provided', () => {
    mockUsePlayerGames.mockReturnValue({
      data: mockGamesData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<WinLossStreakChart playerId={1} />)

    expect(mockUsePlayerGames).toHaveBeenCalledWith(1, { page_size: 50 })
  })

  it('handles single win game correctly', () => {
    const singleWinData = {
      ...mockGamesData,
      games: [mockGamesData.games[0]], // Only the first game (win)
    }

    mockUsePlayerGames.mockReturnValue({
      data: singleWinData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<WinLossStreakChart playerId={1} />)

    expect(screen.getByText('Current:')).toBeInTheDocument()
    expect(screen.getByText('1 game win streak')).toBeInTheDocument()
    expect(screen.getByText('Best win streak:')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Worst loss streak:')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('handles single loss game correctly', () => {
    const singleLossData = {
      ...mockGamesData,
      games: [mockGamesData.games[2]], // Only the third game (loss)
    }

    mockUsePlayerGames.mockReturnValue({
      data: singleLossData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<WinLossStreakChart playerId={1} />)

    expect(screen.getByText('Current:')).toBeInTheDocument()
    expect(screen.getByText('1 game loss streak')).toBeInTheDocument()
    expect(screen.getByText('Best win streak:')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Worst loss streak:')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
