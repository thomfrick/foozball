// ABOUTME: Tests for StatisticsDashboard main component
// ABOUTME: Validates tab navigation, data integration, and dashboard functionality

import { fireEvent, render, screen } from '@testing-library/react'
import {
  useEnhancedLeaderboard,
  useStatisticsSummary,
} from '../../../hooks/useStatistics'
import { StatisticsDashboard } from '../../../pages/StatisticsDashboard'

// Mock the statistics hooks
jest.mock('../../../hooks/useStatistics')
const mockUseStatisticsSummary = useStatisticsSummary as jest.MockedFunction<
  typeof useStatisticsSummary
>
const mockUseEnhancedLeaderboard =
  useEnhancedLeaderboard as jest.MockedFunction<typeof useEnhancedLeaderboard>

// Mock child components to focus on dashboard logic
jest.mock('../StatsSummaryCard', () => ({
  StatsSummaryCard: ({
    summary,
    loading,
    error,
  }: {
    summary?: unknown
    loading?: boolean
    error?: unknown
    data?: unknown
    onPlayerSelect?: (id: number) => void
    selectedPlayerId?: number | null
    leaderboardData?: unknown
  }) => (
    <div data-testid="stats-summary-card">
      {loading && <div>Loading summary...</div>}
      {error && <div>Error loading summary</div>}
      {summary && <div>Summary loaded: {summary.total_players} players</div>}
    </div>
  ),
}))

jest.mock('../EnhancedLeaderboard', () => ({
  EnhancedLeaderboard: ({
    data,
    loading,
    error,
    onPlayerSelect,
  }: {
    summary?: unknown
    loading?: boolean
    error?: unknown
    data?: unknown
    onPlayerSelect?: (id: number) => void
    selectedPlayerId?: number | null
    leaderboardData?: unknown
  }) => (
    <div data-testid="enhanced-leaderboard">
      {loading && <div>Loading leaderboard...</div>}
      {error && <div>Error loading leaderboard</div>}
      {data && (
        <div>
          <div>Leaderboard loaded: {data.leaderboard.length} players</div>
          <button onClick={() => onPlayerSelect(1)}>Select Player 1</button>
        </div>
      )}
    </div>
  ),
}))

jest.mock('../PlayerStatisticsPanel', () => ({
  PlayerStatisticsPanel: ({
    selectedPlayerId,
    onPlayerSelect,
    leaderboardData,
  }: {
    summary?: unknown
    loading?: boolean
    error?: unknown
    data?: unknown
    onPlayerSelect?: (id: number) => void
    selectedPlayerId?: number | null
    leaderboardData?: unknown
  }) => (
    <div data-testid="player-statistics-panel">
      <div>Selected Player ID: {selectedPlayerId || 'None'}</div>
      <button onClick={() => onPlayerSelect(2)}>Select Player 2</button>
      {leaderboardData && <div>Leaderboard available</div>}
    </div>
  ),
}))

jest.mock('../HeadToHeadComparison', () => ({
  HeadToHeadComparison: ({
    leaderboardData,
  }: {
    summary?: unknown
    loading?: boolean
    error?: unknown
    data?: unknown
    onPlayerSelect?: (id: number) => void
    selectedPlayerId?: number | null
    leaderboardData?: unknown
  }) => (
    <div data-testid="head-to-head-comparison">
      <div>Head-to-Head Component</div>
      {leaderboardData && <div>Leaderboard data provided</div>}
    </div>
  ),
}))

const mockSummaryData = {
  total_players: 10,
  active_players: 8,
  total_games: 150,
  games_today: 5,
  games_this_week: 25,
  games_this_month: 80,
  highest_rated_player: {
    rank: 1,
    player_id: 1,
    player_name: 'Alice',
    conservative_rating: 28.5,
    games_played: 50,
    wins: 35,
    losses: 15,
    win_percentage: 70.0,
    trueskill_mu: 30.0,
    trueskill_sigma: 5.0,
    recent_form: 'WWLWW',
    trend_7d: 'up',
    rating_change_7d: 2.5,
    last_game_date: '2025-07-29T10:00:00Z',
    games_this_week: 5,
  },
  avg_games_per_player: 15.0,
  avg_rating: 23.4,
  last_updated: '2025-07-29T15:30:00Z',
}

const mockLeaderboardData = {
  leaderboard: [
    {
      rank: 1,
      player_id: 1,
      player_name: 'Alice',
      games_played: 50,
      wins: 35,
      losses: 15,
      win_percentage: 70.0,
      conservative_rating: 28.5,
      trueskill_mu: 30.0,
      trueskill_sigma: 5.0,
      recent_form: 'WWLWW',
      trend_7d: 'up',
      rating_change_7d: 2.5,
      last_game_date: '2025-07-29T10:00:00Z',
      games_this_week: 5,
    },
  ],
  total_players: 10,
  active_players: 8,
  total_games: 150,
  last_updated: '2025-07-29T15:30:00Z',
}

describe('StatisticsDashboard', () => {
  beforeEach(() => {
    mockUseStatisticsSummary.mockReturnValue({
      data: mockSummaryData,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useStatisticsSummary>)

    mockUseEnhancedLeaderboard.mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useEnhancedLeaderboard>)
  })

  it('renders dashboard header correctly', () => {
    render(<StatisticsDashboard />)

    expect(screen.getByText('📊 Statistics Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Comprehensive player performance analytics and insights'
      )
    ).toBeInTheDocument()
  })

  it('renders all dashboard tabs', () => {
    render(<StatisticsDashboard />)

    expect(screen.getByText('📊 Overview')).toBeInTheDocument()
    expect(screen.getByText('🏆 Enhanced Leaderboard')).toBeInTheDocument()
    expect(screen.getByText('👤 Player Statistics')).toBeInTheDocument()
    expect(screen.getByText('⚔️ Head-to-Head')).toBeInTheDocument()
  })

  it('starts with overview tab active', () => {
    render(<StatisticsDashboard />)

    // Overview tab should be active (has blue color classes)
    const overviewTab = screen.getByText('📊 Overview').closest('button')
    expect(overviewTab).toHaveClass('border-blue-500', 'text-blue-600')

    // Overview content should be visible
    expect(screen.getByTestId('stats-summary-card')).toBeInTheDocument()
  })

  it('switches tabs correctly', () => {
    render(<StatisticsDashboard />)

    // Click on Enhanced Leaderboard tab
    fireEvent.click(screen.getByText('🏆 Enhanced Leaderboard'))

    // Enhanced Leaderboard content should be visible
    expect(screen.getByTestId('enhanced-leaderboard')).toBeInTheDocument()
    expect(screen.queryByTestId('stats-summary-card')).not.toBeInTheDocument()

    // Click on Player Statistics tab
    fireEvent.click(screen.getByText('👤 Player Statistics'))

    // Player Statistics content should be visible
    expect(screen.getByTestId('player-statistics-panel')).toBeInTheDocument()
    expect(screen.queryByTestId('enhanced-leaderboard')).not.toBeInTheDocument()

    // Click on Head-to-Head tab
    fireEvent.click(screen.getByText('⚔️ Head-to-Head'))

    // Head-to-Head content should be visible
    expect(screen.getByTestId('head-to-head-comparison')).toBeInTheDocument()
    expect(
      screen.queryByTestId('player-statistics-panel')
    ).not.toBeInTheDocument()
  })

  it('displays overview content correctly', () => {
    render(<StatisticsDashboard />)

    // Should show stats summary card
    expect(screen.getByTestId('stats-summary-card')).toBeInTheDocument()
    expect(screen.getByText('Summary loaded: 10 players')).toBeInTheDocument()

    // Should show top performers section
    expect(screen.getByText('🌟 Top Performers')).toBeInTheDocument()
    expect(screen.getByText('Highest Rated')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('28.5 rating')).toBeInTheDocument()

    // Should show recent activity
    expect(screen.getByText('📈 Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // games_today
    expect(screen.getByText('25')).toBeInTheDocument() // games_this_week
    expect(screen.getByText('80')).toBeInTheDocument() // games_this_month
    expect(screen.getByText('15.0')).toBeInTheDocument() // avg_games_per_player
  })

  it('handles player selection from leaderboard', () => {
    render(<StatisticsDashboard />)

    // Switch to leaderboard tab
    fireEvent.click(screen.getByText('🏆 Enhanced Leaderboard'))
    expect(screen.getByTestId('enhanced-leaderboard')).toBeInTheDocument()

    // Click select player button
    fireEvent.click(screen.getByText('Select Player 1'))

    // Switch to player statistics tab
    fireEvent.click(screen.getByText('👤 Player Statistics'))

    // Should show selected player
    expect(screen.getByText('Selected Player ID: 1')).toBeInTheDocument()
  })

  it('handles player selection in player statistics panel', () => {
    render(<StatisticsDashboard />)

    // Switch to player statistics tab
    fireEvent.click(screen.getByText('👤 Player Statistics'))

    // Click select player button in panel
    fireEvent.click(screen.getByText('Select Player 2'))

    // Should update selected player
    expect(screen.getByText('Selected Player ID: 2')).toBeInTheDocument()
  })

  it('passes leaderboard data to child components', () => {
    render(<StatisticsDashboard />)

    // Switch to player statistics tab
    fireEvent.click(screen.getByText('👤 Player Statistics'))
    expect(screen.getByText('Leaderboard available')).toBeInTheDocument()

    // Switch to head-to-head tab
    fireEvent.click(screen.getByText('⚔️ Head-to-Head'))
    expect(screen.getByText('Leaderboard data provided')).toBeInTheDocument()
  })

  it('displays footer with last updated time', () => {
    render(<StatisticsDashboard />)

    expect(
      screen.getByText(/Statistics updated in real-time/)
    ).toBeInTheDocument()
    expect(screen.getByText(/Last refresh:/)).toBeInTheDocument()
  })

  it('handles loading states', () => {
    mockUseStatisticsSummary.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useStatisticsSummary>)

    mockUseEnhancedLeaderboard.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useEnhancedLeaderboard>)

    render(<StatisticsDashboard />)

    expect(screen.getByText('Loading summary...')).toBeInTheDocument()

    // Switch to leaderboard tab
    fireEvent.click(screen.getByText('🏆 Enhanced Leaderboard'))
    expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument()
  })

  it('handles error states', () => {
    mockUseStatisticsSummary.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as ReturnType<typeof useStatisticsSummary>)

    mockUseEnhancedLeaderboard.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as ReturnType<typeof useEnhancedLeaderboard>)

    render(<StatisticsDashboard />)

    expect(screen.getByText('Error loading summary')).toBeInTheDocument()

    // Switch to leaderboard tab
    fireEvent.click(screen.getByText('🏆 Enhanced Leaderboard'))
    expect(screen.getByText('Error loading leaderboard')).toBeInTheDocument()
  })

  it('maintains player selection across tab switches', () => {
    render(<StatisticsDashboard />)

    // Select player from leaderboard
    fireEvent.click(screen.getByText('🏆 Enhanced Leaderboard'))
    fireEvent.click(screen.getByText('Select Player 1'))

    // Switch to player statistics
    fireEvent.click(screen.getByText('👤 Player Statistics'))
    expect(screen.getByText('Selected Player ID: 1')).toBeInTheDocument()

    // Switch back to leaderboard and back to player stats
    fireEvent.click(screen.getByText('🏆 Enhanced Leaderboard'))
    fireEvent.click(screen.getByText('👤 Player Statistics'))

    // Player selection should persist
    expect(screen.getByText('Selected Player ID: 1')).toBeInTheDocument()
  })
})
