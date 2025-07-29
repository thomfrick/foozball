// ABOUTME: Tests for RatingProgressionChart component
// ABOUTME: Verifies chart rendering, loading states, and error handling
/* eslint-disable @typescript-eslint/no-explicit-any */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import * as useApiHooks from '../../hooks/useApi'
import RatingProgressionChart from '../RatingProgressionChart'

// Mock Recharts to avoid canvas rendering issues in tests
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

// Mock API hooks
vi.mock('../../hooks/useApi')

const mockUsePlayerRatingProgression = vi.mocked(
  useApiHooks.usePlayerRatingProgression
)

type MockReturnType = {
  data: typeof mockRatingData | undefined
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

const mockRatingData = {
  player_id: 1,
  player_name: 'Test Player',
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
    {
      id: 2,
      player_id: 1,
      game_id: 2,
      trueskill_mu_before: 26.2,
      trueskill_sigma_before: 7.8,
      trueskill_mu_after: 24.8,
      trueskill_sigma_after: 7.2,
      rating_system: 'trueskill',
      created_at: '2024-01-02T10:00:00Z',
      mu_change: -1.4,
      sigma_change: -0.6,
      conservative_rating_before: 2.8,
      conservative_rating_after: 3.2,
      conservative_rating_change: 0.4,
    },
  ],
}

describe('RatingProgressionChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    mockUsePlayerRatingProgression.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as MockReturnType)

    renderWithProviders(<RatingProgressionChart playerId={1} />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders error state', () => {
    const error = new Error('Failed to load data')
    mockUsePlayerRatingProgression.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    } as MockReturnType)

    renderWithProviders(<RatingProgressionChart playerId={1} />)

    expect(
      screen.getByText('Failed to load rating progression')
    ).toBeInTheDocument()
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  it('renders empty state when no ratings available', () => {
    mockUsePlayerRatingProgression.mockReturnValue({
      data: { ...mockRatingData, ratings: [] },
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<RatingProgressionChart playerId={1} />)

    expect(screen.getByText('No rating history available')).toBeInTheDocument()
    expect(
      screen.getByText('Play some games to see rating progression')
    ).toBeInTheDocument()
  })

  it('renders chart with rating data', () => {
    mockUsePlayerRatingProgression.mockReturnValue({
      data: mockRatingData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(
      <RatingProgressionChart
        playerId={1}
        playerName="Test Player"
        showConservativeRating={true}
        showUncertainty={false}
      />
    )

    expect(
      screen.getByText("Test Player's Rating Progression")
    ).toBeInTheDocument()
    expect(screen.getByText('2 games tracked')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('renders chart with all options enabled', () => {
    mockUsePlayerRatingProgression.mockReturnValue({
      data: mockRatingData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(
      <RatingProgressionChart
        playerId={1}
        playerName="Test Player"
        showConservativeRating={true}
        showUncertainty={true}
      />
    )

    expect(
      screen.getByText('Skill Rating (μ) - Raw skill level')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Conservative Rating - μ - 3σ (ranking system)')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Uncertainty (σ) - Rating confidence')
    ).toBeInTheDocument()
  })

  it('renders chart without player name', () => {
    mockUsePlayerRatingProgression.mockReturnValue({
      data: mockRatingData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<RatingProgressionChart playerId={1} />)

    expect(screen.getByText('Rating Progression')).toBeInTheDocument()
  })

  it('passes correct props to usePlayerRatingProgression hook', () => {
    mockUsePlayerRatingProgression.mockReturnValue({
      data: mockRatingData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<RatingProgressionChart playerId={42} limit={150} />)

    expect(mockUsePlayerRatingProgression).toHaveBeenCalledWith(42, 150)
  })

  it('uses default limit when not provided', () => {
    mockUsePlayerRatingProgression.mockReturnValue({
      data: mockRatingData,
      isLoading: false,
      error: null,
    } as MockReturnType)

    renderWithProviders(<RatingProgressionChart playerId={1} />)

    expect(mockUsePlayerRatingProgression).toHaveBeenCalledWith(1, 100)
  })
})
