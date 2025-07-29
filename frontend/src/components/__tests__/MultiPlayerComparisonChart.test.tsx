// ABOUTME: Tests for MultiPlayerComparisonChart component
// ABOUTME: Verifies multi-player comparison chart rendering and interactions

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import * as useApiHooks from '../../hooks/useApi'
import MultiPlayerComparisonChart from '../MultiPlayerComparisonChart'

// Mock Recharts
/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ name }: any) => <div data-testid="line">{name}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Legend: () => <div data-testid="legend" />,
}))
/* eslint-enable @typescript-eslint/no-explicit-any */

// Mock API hooks
vi.mock('../../hooks/useApi')

const mockUseMultiPlayerRatingProgression = vi.mocked(
  useApiHooks.useMultiPlayerRatingProgression
)

type MockReturnType = {
  data: typeof mockComparisonData | undefined
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

const mockComparisonData = {
  players: [
    {
      player_id: 1,
      player_name: 'Player One',
      ratings: [
        {
          id: 1,
          player_id: 1,
          game_id: 1,
          trueskill_mu_before: 25.0,
          trueskill_sigma_before: 8.333,
          trueskill_mu_after: 26.2,
          trueskill_sigma_after: 7.8,
          rating_system: 'trueskill',
          created_at: '2024-01-01T10:00:00Z',
          mu_change: 1.2,
          sigma_change: -0.533,
          conservative_rating_before: 0.001,
          conservative_rating_after: 2.8,
          conservative_rating_change: 2.799,
        },
      ],
    },
    {
      player_id: 2,
      player_name: 'Player Two',
      ratings: [
        {
          id: 2,
          player_id: 2,
          game_id: 1,
          trueskill_mu_before: 25.0,
          trueskill_sigma_before: 8.333,
          trueskill_mu_after: 23.8,
          trueskill_sigma_after: 7.8,
          rating_system: 'trueskill',
          created_at: '2024-01-01T10:00:00Z',
          mu_change: -1.2,
          sigma_change: -0.533,
          conservative_rating_before: 0.001,
          conservative_rating_after: 0.4,
          conservative_rating_change: 0.399,
        },
      ],
    },
  ],
  total_games: 2,
}

describe('MultiPlayerComparisonChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    mockUseMultiPlayerRatingProgression.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as MockReturnType)

    renderWithProviders(<MultiPlayerComparisonChart playerIds={[1, 2]} />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders error state', () => {
    const error = new Error('Failed to load comparison data')
    mockUseMultiPlayerRatingProgression.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    } as MockReturnType)

    renderWithProviders(<MultiPlayerComparisonChart playerIds={[1, 2]} />)

    expect(
      screen.getByText('Failed to load player comparison data')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Failed to load comparison data')
    ).toBeInTheDocument()
  })

  it('renders empty state when no players', () => {
    mockUseMultiPlayerRatingProgression.mockReturnValue({
      data: { players: [], total_games: 0 },
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<MultiPlayerComparisonChart playerIds={[]} />)

    expect(
      screen.getByText('No players selected for comparison')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Select players to compare their rating progression')
    ).toBeInTheDocument()
  })

  it('renders chart with comparison data', () => {
    mockUseMultiPlayerRatingProgression.mockReturnValue({
      data: mockComparisonData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<MultiPlayerComparisonChart playerIds={[1, 2]} />)

    expect(screen.getByText('Player Rating Comparison')).toBeInTheDocument()
    expect(
      screen.getByText('2 players compared • 2 total game entries')
    ).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('shows rating type toggle buttons', () => {
    mockUseMultiPlayerRatingProgression.mockReturnValue({
      data: mockComparisonData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<MultiPlayerComparisonChart playerIds={[1, 2]} />)

    expect(
      screen.getByRole('button', { name: 'Conservative' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Skill (μ)' })
    ).toBeInTheDocument()
  })

  it('switches rating types when buttons are clicked', () => {
    mockUseMultiPlayerRatingProgression.mockReturnValue({
      data: mockComparisonData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<MultiPlayerComparisonChart playerIds={[1, 2]} />)

    // Initially shows Conservative Rating
    expect(screen.getByText('Currently showing:')).toBeInTheDocument()
    expect(screen.getByText('Conservative Rating')).toBeInTheDocument()

    // Click Skill (μ) button
    const skillButton = screen.getByRole('button', { name: 'Skill (μ)' })
    fireEvent.click(skillButton)

    expect(screen.getByText('Currently showing:')).toBeInTheDocument()
    expect(screen.getByText('Skill Rating (μ)')).toBeInTheDocument()
  })

  it('displays player legend with game counts', () => {
    mockUseMultiPlayerRatingProgression.mockReturnValue({
      data: mockComparisonData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<MultiPlayerComparisonChart playerIds={[1, 2]} />)

    expect(screen.getByText('Player One (1 games)')).toBeInTheDocument()
    expect(screen.getByText('Player Two (1 games)')).toBeInTheDocument()
  })

  it('passes correct props to useMultiPlayerRatingProgression hook', () => {
    mockUseMultiPlayerRatingProgression.mockReturnValue({
      data: mockComparisonData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(
      <MultiPlayerComparisonChart playerIds={[1, 2, 3]} limit={200} />
    )

    expect(mockUseMultiPlayerRatingProgression).toHaveBeenCalledWith(
      [1, 2, 3],
      200
    )
  })

  it('uses default limit when not provided', () => {
    mockUseMultiPlayerRatingProgression.mockReturnValue({
      data: mockComparisonData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<MultiPlayerComparisonChart playerIds={[1, 2]} />)

    expect(mockUseMultiPlayerRatingProgression).toHaveBeenCalledWith(
      [1, 2],
      100
    )
  })

  it('handles showConservativeRating prop correctly', () => {
    mockUseMultiPlayerRatingProgression.mockReturnValue({
      data: mockComparisonData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(
      <MultiPlayerComparisonChart
        playerIds={[1, 2]}
        showConservativeRating={false}
      />
    )

    // Should still show toggle buttons even if showConservativeRating is false
    expect(
      screen.getByRole('button', { name: 'Conservative' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Skill (μ)' })
    ).toBeInTheDocument()
  })
})
