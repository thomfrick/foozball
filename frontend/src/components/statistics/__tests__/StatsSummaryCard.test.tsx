// ABOUTME: Tests for StatsSummaryCard component
// ABOUTME: Validates statistics summary display, loading states, and error handling

import { render, screen } from '@testing-library/react'
import type { StatisticsSummary } from '../../../types/statistics'
import { StatsSummaryCard } from '../StatsSummaryCard'

const mockSummary: StatisticsSummary = {
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
  most_active_player: {
    rank: 2,
    player_id: 2,
    player_name: 'Bob',
    games_played: 75,
    wins: 40,
    losses: 35,
    win_percentage: 53.3,
    conservative_rating: 22.1,
    trueskill_mu: 25.0,
    trueskill_sigma: 6.0,
    recent_form: 'WLWLW',
    trend_7d: 'stable',
    rating_change_7d: 0.1,
    last_game_date: '2025-07-29T12:00:00Z',
    games_this_week: 8,
  },
  best_win_rate_player: {
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
  avg_games_per_player: 15.0,
  avg_rating: 23.4,
  most_common_matchup: 'Alice vs Bob (12 games)',
  last_updated: '2025-07-29T15:30:00Z',
}

describe('StatsSummaryCard', () => {
  it('renders loading state correctly', () => {
    render(<StatsSummaryCard loading={true} />)

    expect(screen.getByText('🎯 System Overview')).toBeInTheDocument()
    // Check for loading skeletons - just verify they exist
    expect(screen.getAllByRole('generic').length).toBeGreaterThan(0)
  })

  it('renders error state correctly', () => {
    const error = new Error('Failed to fetch')
    render(<StatsSummaryCard error={error} />)

    expect(screen.getByText('🎯 System Overview')).toBeInTheDocument()
    expect(screen.getByText('⚠️')).toBeInTheDocument()
    expect(
      screen.getByText('Failed to load statistics summary')
    ).toBeInTheDocument()
  })

  it('renders summary data correctly', () => {
    render(<StatsSummaryCard summary={mockSummary} />)

    // Check system overview title
    expect(screen.getByText('🎯 System Overview')).toBeInTheDocument()

    // Check player statistics
    expect(screen.getByText('10')).toBeInTheDocument() // total_players
    expect(screen.getByText('8')).toBeInTheDocument() // active_players
    expect(screen.getByText('Total Players')).toBeInTheDocument()
    expect(screen.getByText('Active Players')).toBeInTheDocument()

    // Check game statistics
    expect(screen.getByText('150')).toBeInTheDocument() // total_games
    expect(screen.getByText('Total Games Played')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // games_today
    expect(screen.getByText('25')).toBeInTheDocument() // games_this_week
    expect(screen.getByText('80')).toBeInTheDocument() // games_this_month
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('This Week')).toBeInTheDocument()
    expect(screen.getByText('This Month')).toBeInTheDocument()
  })

  it('displays system averages correctly', () => {
    render(<StatsSummaryCard summary={mockSummary} />)

    expect(screen.getByText('15.0')).toBeInTheDocument() // avg_games_per_player
    expect(screen.getByText('23.4')).toBeInTheDocument() // avg_rating
    expect(screen.getByText('Avg Games/Player')).toBeInTheDocument()
    expect(screen.getByText('Avg Rating')).toBeInTheDocument()
  })

  it('displays most common matchup when available', () => {
    render(<StatsSummaryCard summary={mockSummary} />)

    expect(screen.getByText('🔥 Most Common Matchup')).toBeInTheDocument()
    expect(screen.getByText('Alice vs Bob (12 games)')).toBeInTheDocument()
  })

  it('hides most common matchup when not available', () => {
    const summaryWithoutMatchup: StatisticsSummary = {
      ...mockSummary,
      most_common_matchup: undefined,
    }

    render(<StatsSummaryCard summary={summaryWithoutMatchup} />)

    expect(screen.queryByText('🔥 Most Common Matchup')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Alice vs Bob (12 games)')
    ).not.toBeInTheDocument()
  })

  it('displays last updated timestamp', () => {
    render(<StatsSummaryCard summary={mockSummary} />)

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    // Note: Exact formatted date may vary based on locale
  })

  it('returns null when no summary and not loading', () => {
    const { container } = render(<StatsSummaryCard />)
    expect(container.firstChild).toBeNull()
  })

  it('handles zero values correctly', () => {
    const zeroSummary: StatisticsSummary = {
      ...mockSummary,
      total_players: 0,
      active_players: 0,
      total_games: 0,
      games_today: 0,
      games_this_week: 0,
      games_this_month: 0,
      avg_games_per_player: 0.0,
      avg_rating: 0.0,
    }

    render(<StatsSummaryCard summary={zeroSummary} />)

    // Should still render the structure with zero values
    expect(screen.getAllByText('0')).toHaveLength(6) // All zero values
    expect(screen.getAllByText('0.0')).toHaveLength(2) // avg_games_per_player and avg_rating
  })
})
