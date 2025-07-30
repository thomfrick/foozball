// ABOUTME: Tests for EnhancedLeaderboard component
// ABOUTME: Validates leaderboard display, filtering, sorting, and player interactions

import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import type { EnhancedLeaderboardResponse } from '../../../types/statistics'
import { EnhancedLeaderboard } from '../EnhancedLeaderboard'

const mockLeaderboardData: EnhancedLeaderboardResponse = {
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
    {
      rank: 2,
      player_id: 2,
      player_name: 'Bob',
      games_played: 45,
      wins: 25,
      losses: 20,
      win_percentage: 55.6,
      conservative_rating: 22.1,
      trueskill_mu: 25.0,
      trueskill_sigma: 6.0,
      recent_form: 'WLWLW',
      trend_7d: 'down',
      rating_change_7d: -1.2,
      last_game_date: '2025-07-29T12:00:00Z',
      games_this_week: 3,
    },
    {
      rank: 3,
      player_id: 3,
      player_name: 'Charlie',
      games_played: 30,
      wins: 18,
      losses: 12,
      win_percentage: 60.0,
      conservative_rating: 20.8,
      trueskill_mu: 24.0,
      trueskill_sigma: 7.0,
      recent_form: 'LWWWL',
      trend_7d: 'stable',
      rating_change_7d: 0.1,
      last_game_date: '2025-07-28T15:30:00Z',
      games_this_week: 2,
    },
  ],
  total_players: 10,
  active_players: 8,
  total_games: 200,
  last_updated: '2025-07-29T15:30:00Z',
}

const mockOnPlayerSelect = vi.fn()

describe('EnhancedLeaderboard', () => {
  beforeEach(() => {
    mockOnPlayerSelect.mockReset()
  })

  it('renders loading state correctly', () => {
    render(<EnhancedLeaderboard loading={true} />)

    expect(screen.getByText('🏆 Enhanced Leaderboard')).toBeInTheDocument()
    expect(screen.getAllByRole('generic').length).toBeGreaterThan(0) // Loading skeletons
  })

  it('renders error state correctly', () => {
    const error = new Error('Failed to fetch')
    render(<EnhancedLeaderboard error={error} />)

    expect(screen.getByText('🏆 Enhanced Leaderboard')).toBeInTheDocument()
    expect(screen.getByText('⚠️')).toBeInTheDocument()
    expect(screen.getByText('Failed to load leaderboard')).toBeInTheDocument()
  })

  it('renders leaderboard data correctly', () => {
    render(
      <EnhancedLeaderboard
        data={mockLeaderboardData}
        onPlayerSelect={mockOnPlayerSelect}
      />
    )

    // Check title
    expect(screen.getByText('🏆 Enhanced Leaderboard')).toBeInTheDocument()

    // Check summary stats
    expect(screen.getByText('10')).toBeInTheDocument() // total_players
    expect(screen.getByText('8')).toBeInTheDocument() // active_players
    expect(screen.getByText('200')).toBeInTheDocument() // total_games
    expect(screen.getByText('3')).toBeInTheDocument() // shown players

    // Check player data
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()

    // Check ratings
    expect(screen.getByText('28.5')).toBeInTheDocument() // Alice's rating
    expect(screen.getByText('22.1')).toBeInTheDocument() // Bob's rating
    expect(screen.getByText('20.8')).toBeInTheDocument() // Charlie's rating
  })

  it('displays rank badges correctly', () => {
    render(<EnhancedLeaderboard data={mockLeaderboardData} />)

    // Check medal emojis for top 3
    expect(screen.getByText('🥇')).toBeInTheDocument() // Rank 1
    expect(screen.getByText('🥈')).toBeInTheDocument() // Rank 2
    expect(screen.getByText('🥉')).toBeInTheDocument() // Rank 3
  })

  it('displays win-loss records correctly', () => {
    render(<EnhancedLeaderboard data={mockLeaderboardData} />)

    expect(screen.getByText('35W - 15L')).toBeInTheDocument() // Alice
    expect(screen.getByText('25W - 20L')).toBeInTheDocument() // Bob
    expect(screen.getByText('18W - 12L')).toBeInTheDocument() // Charlie

    expect(screen.getByText('70.0% (50 games)')).toBeInTheDocument() // Alice
    expect(screen.getByText('55.6% (45 games)')).toBeInTheDocument() // Bob
    expect(screen.getByText('60.0% (30 games)')).toBeInTheDocument() // Charlie
  })

  it('displays recent form correctly', () => {
    render(<EnhancedLeaderboard data={mockLeaderboardData} />)

    // Check form displays (W/L badges)
    const winBadges = screen.getAllByText('W')
    const lossBadges = screen.getAllByText('L')

    expect(winBadges.length).toBeGreaterThan(0)
    expect(lossBadges.length).toBeGreaterThan(0)
  })

  it('displays trend indicators correctly', () => {
    render(<EnhancedLeaderboard data={mockLeaderboardData} />)

    expect(screen.getByText('📈')).toBeInTheDocument() // Up trend
    expect(screen.getByText('📉')).toBeInTheDocument() // Down trend
    expect(screen.getByText('➖')).toBeInTheDocument() // Stable trend

    expect(screen.getByText('+2.5')).toBeInTheDocument() // Alice's change
    expect(screen.getByText('-1.2')).toBeInTheDocument() // Bob's change
    expect(screen.getByText('+0.1')).toBeInTheDocument() // Charlie's change
  })

  it('handles View Stats button clicks', () => {
    render(
      <EnhancedLeaderboard
        data={mockLeaderboardData}
        onPlayerSelect={mockOnPlayerSelect}
      />
    )

    const viewStatsButtons = screen.getAllByText('View Stats')
    expect(viewStatsButtons).toHaveLength(3)

    fireEvent.click(viewStatsButtons[0])
    expect(mockOnPlayerSelect).toHaveBeenCalledWith(1) // Alice's ID

    fireEvent.click(viewStatsButtons[1])
    expect(mockOnPlayerSelect).toHaveBeenCalledWith(2) // Bob's ID
  })

  it('renders filter controls', () => {
    render(<EnhancedLeaderboard data={mockLeaderboardData} />)

    expect(screen.getByDisplayValue('Sort by Rating')).toBeInTheDocument()
    expect(screen.getByDisplayValue('All Players')).toBeInTheDocument()
  })

  it('displays activity information', () => {
    render(<EnhancedLeaderboard data={mockLeaderboardData} />)

    expect(screen.getByText('5 games this week')).toBeInTheDocument() // Alice
    expect(screen.getByText('3 games this week')).toBeInTheDocument() // Bob
    expect(screen.getByText('2 games this week')).toBeInTheDocument() // Charlie

    // Check last game dates (multiple players have last game dates)
    expect(screen.getAllByText(/Last:/).length).toBeGreaterThan(0)
  })

  it('shows empty state when no players', () => {
    const emptyData: EnhancedLeaderboardResponse = {
      ...mockLeaderboardData,
      leaderboard: [],
    }

    render(<EnhancedLeaderboard data={emptyData} />)

    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(
      screen.getByText('No players found with the current filters')
    ).toBeInTheDocument()
  })

  it('displays last updated timestamp', () => {
    render(<EnhancedLeaderboard data={mockLeaderboardData} />)

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
  })

  it('returns null when no data and not loading', () => {
    const { container } = render(<EnhancedLeaderboard />)
    expect(container.firstChild).toBeNull()
  })

  it('displays TrueSkill details correctly', () => {
    render(<EnhancedLeaderboard data={mockLeaderboardData} />)

    // Check mu and sigma values are displayed
    expect(screen.getByText('μ: 30.0, σ: 5.0')).toBeInTheDocument() // Alice
    expect(screen.getByText('μ: 25.0, σ: 6.0')).toBeInTheDocument() // Bob
    expect(screen.getByText('μ: 24.0, σ: 7.0')).toBeInTheDocument() // Charlie
  })

  it('handles players without recent games', () => {
    const dataWithInactivePlayers: EnhancedLeaderboardResponse = {
      ...mockLeaderboardData,
      leaderboard: [
        {
          ...mockLeaderboardData.leaderboard[0],
          last_game_date: undefined,
          games_this_week: 0,
          recent_form: '',
        },
      ],
    }

    render(<EnhancedLeaderboard data={dataWithInactivePlayers} />)

    expect(screen.getByText('Last: Never')).toBeInTheDocument()
    expect(screen.getByText('0 games this week')).toBeInTheDocument()
  })
})
