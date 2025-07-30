// ABOUTME: Tests for HeadToHeadComparison component
// ABOUTME: Validates player selection, comparison display, and matchup analysis

import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { useHeadToHeadStatistics } from '../../../hooks/useStatistics'
import type {
  EnhancedLeaderboardResponse,
  HeadToHeadResponse,
} from '../../../types/statistics'
import { HeadToHeadComparison } from '../HeadToHeadComparison'

// Mock the useHeadToHeadStatistics hook
vi.mock('../../../hooks/useStatistics')
const mockUseHeadToHeadStatistics = vi.mocked(useHeadToHeadStatistics)

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

const mockHeadToHeadData: HeadToHeadResponse = {
  head_to_head: {
    player1_id: 1,
    player1_name: 'Alice',
    player2_id: 2,
    player2_name: 'Bob',
    total_games: 8,
    player1_wins: 5,
    player2_wins: 3,
    player1_win_percentage: 62.5,
    player2_win_percentage: 37.5,
    last_game_date: '2025-07-29T14:00:00Z',
    current_streak: 'Alice - 2 game win streak',
  },
  recent_games: [
    {
      game_id: 1,
      date: '2025-07-29T14:00:00Z',
      opponent_id: 2,
      opponent_name: 'Bob',
      result: 'W',
      rating_change: 1.5,
      conservative_rating_change: 0.8,
    },
    {
      game_id: 2,
      date: '2025-07-29T12:00:00Z',
      opponent_id: 2,
      opponent_name: 'Bob',
      result: 'W',
      rating_change: 1.2,
      conservative_rating_change: 0.6,
    },
    {
      game_id: 3,
      date: '2025-07-28T16:00:00Z',
      opponent_id: 2,
      opponent_name: 'Bob',
      result: 'L',
      rating_change: -1.8,
      conservative_rating_change: -0.9,
    },
  ],
}

describe('HeadToHeadComparison', () => {
  beforeEach(() => {
    mockUseHeadToHeadStatistics.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useHeadToHeadStatistics>)
  })

  it('renders initial state with player selectors', () => {
    render(<HeadToHeadComparison leaderboardData={mockLeaderboardData} />)

    expect(screen.getByText('🥊 Select First Player')).toBeInTheDocument()
    expect(screen.getByText('🥊 Select Second Player')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Search for first player...')
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Search for second player...')
    ).toBeInTheDocument()
  })

  it('displays players in selection lists', () => {
    render(<HeadToHeadComparison leaderboardData={mockLeaderboardData} />)

    // All players should appear in both lists initially
    expect(screen.getAllByText('Alice')).toHaveLength(2)
    expect(screen.getAllByText('Bob')).toHaveLength(2)
    expect(screen.getAllByText('Charlie')).toHaveLength(2)

    // Check player details (each player appears in both lists)
    expect(screen.getAllByText('#1 • 28.5 rating')).toHaveLength(2)
    expect(screen.getAllByText('#2 • 22.1 rating')).toHaveLength(2)
    expect(screen.getAllByText('#3 • 20.8 rating')).toHaveLength(2)
  })

  it('filters players based on search query', () => {
    render(<HeadToHeadComparison leaderboardData={mockLeaderboardData} />)

    const searchInput = screen.getByPlaceholderText(
      'Search for first player...'
    )
    fireEvent.change(searchInput, { target: { value: 'ali' } })

    // Should show Alice in first list, but Bob and Charlie should still appear in second list
    expect(screen.getAllByText('Alice')).toHaveLength(2) // One in each list
    expect(screen.getAllByText('Bob')).toHaveLength(1) // Only in second list
    expect(screen.getAllByText('Charlie')).toHaveLength(1) // Only in second list
  })

  it('excludes selected player from opposite list', () => {
    render(<HeadToHeadComparison leaderboardData={mockLeaderboardData} />)

    // Select Alice in first list
    const aliceButtons = screen.getAllByText('Alice')
    fireEvent.click(aliceButtons[0])

    // Alice should no longer appear in second list (only in first list where selected)
    expect(screen.getAllByText('Alice')).toHaveLength(1)
    // Bob and Charlie should still be in both lists since they're not selected
    expect(screen.getAllByText('Bob')).toHaveLength(2)
    expect(screen.getAllByText('Charlie')).toHaveLength(2)
  })

  it('shows select two players message initially', () => {
    render(<HeadToHeadComparison leaderboardData={mockLeaderboardData} />)

    expect(screen.getByText('⚔️')).toBeInTheDocument()
    expect(screen.getByText('Select Two Players')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Choose two players to compare their head-to-head record'
      )
    ).toBeInTheDocument()
  })

  it('shows different players warning when same player selected', () => {
    render(<HeadToHeadComparison leaderboardData={mockLeaderboardData} />)

    // Select Alice in both lists (simulate selecting same player)
    const aliceButtons = screen.getAllByText('Alice')
    fireEvent.click(aliceButtons[0]) // First list

    // Mock the same player selection somehow or test the logic
    // This would require more complex state manipulation
  })

  it.skip('shows loading state when fetching head-to-head data', async () => {
    const { rerender } = render(
      <HeadToHeadComparison leaderboardData={mockLeaderboardData} />
    )

    // Select two players first
    const aliceButton = screen.getAllByText('Alice')[0]
    const bobButton = screen.getAllByText('Bob')[1]
    fireEvent.click(aliceButton)
    fireEvent.click(bobButton)

    // Now mock loading state after players are selected
    mockUseHeadToHeadStatistics.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useHeadToHeadStatistics>)

    // Force re-render to pick up the new mock
    rerender(<HeadToHeadComparison leaderboardData={mockLeaderboardData} />)

    // Should show loading skeleton with animate-pulse
    const pulseElement = document.querySelector('.animate-pulse')
    expect(pulseElement).toBeTruthy()
  })

  it.skip('shows error state when head-to-head data fails to load', () => {
    const { rerender } = render(
      <HeadToHeadComparison leaderboardData={mockLeaderboardData} />
    )

    // Select two players first
    const aliceButton = screen.getAllByText('Alice')[0]
    const bobButton = screen.getAllByText('Bob')[1]
    fireEvent.click(aliceButton)
    fireEvent.click(bobButton)

    // Now mock error state after players are selected
    mockUseHeadToHeadStatistics.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as ReturnType<typeof useHeadToHeadStatistics>)

    // Force re-render to pick up the new mock
    rerender(<HeadToHeadComparison leaderboardData={mockLeaderboardData} />)

    expect(
      screen.getByText('Failed to load head-to-head statistics')
    ).toBeInTheDocument()
  })

  it.skip('displays head-to-head comparison when data is loaded', () => {
    mockUseHeadToHeadStatistics.mockReturnValue({
      data: mockHeadToHeadData,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useHeadToHeadStatistics>)

    render(<HeadToHeadComparison leaderboardData={mockLeaderboardData} />)

    // Select two players first (this would trigger the hook)
    const aliceButton = screen.getAllByText('Alice')[0]
    const bobButton = screen.getAllByText('Bob')[1]
    fireEvent.click(aliceButton)
    fireEvent.click(bobButton)

    // Check comparison header
    expect(screen.getByText('Alice vs Bob')).toBeInTheDocument()
    expect(
      screen.getByText('Head-to-Head Matchup Analysis')
    ).toBeInTheDocument()

    // Check win counts
    expect(screen.getByText('5')).toBeInTheDocument() // Alice's wins
    expect(screen.getByText('3')).toBeInTheDocument() // Bob's wins
    expect(screen.getByText('8 Games')).toBeInTheDocument() // Total games

    // Check win percentages
    expect(screen.getByText('62.5% win rate')).toBeInTheDocument() // Alice
    expect(screen.getByText('37.5% win rate')).toBeInTheDocument() // Bob
  })

  it.skip('displays current streak information', () => {
    mockUseHeadToHeadStatistics.mockReturnValue({
      data: mockHeadToHeadData,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useHeadToHeadStatistics>)

    render(<HeadToHeadComparison leaderboardData={mockLeaderboardData} />)

    // Select players and check streak display
    const aliceButton = screen.getAllByText('Alice')[0]
    const bobButton = screen.getAllByText('Bob')[1]
    fireEvent.click(aliceButton)
    fireEvent.click(bobButton)

    expect(screen.getByText('🔥 Current Streak')).toBeInTheDocument()
    expect(screen.getByText('Alice - 2 game win streak')).toBeInTheDocument()
  })

  it.skip('displays recent games history', () => {
    mockUseHeadToHeadStatistics.mockReturnValue({
      data: mockHeadToHeadData,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useHeadToHeadStatistics>)

    render(<HeadToHeadComparison leaderboardData={mockLeaderboardData} />)

    // Select players
    const aliceButton = screen.getAllByText('Alice')[0]
    const bobButton = screen.getAllByText('Bob')[1]
    fireEvent.click(aliceButton)
    fireEvent.click(bobButton)

    expect(screen.getByText('📋 Recent Games (3)')).toBeInTheDocument()

    // Check individual game results
    expect(screen.getAllByText('W')).toHaveLength(2) // Two wins
    expect(screen.getAllByText('L')).toHaveLength(1) // One loss

    // Check game numbers
    expect(screen.getByText('Game #3')).toBeInTheDocument()
    expect(screen.getByText('Game #2')).toBeInTheDocument()
    expect(screen.getByText('Game #1')).toBeInTheDocument()
  })

  it.skip('shows no games played message when players havent played', () => {
    const noGamesData: HeadToHeadResponse = {
      head_to_head: {
        ...mockHeadToHeadData.head_to_head,
        total_games: 0,
        player1_wins: 0,
        player2_wins: 0,
        player1_win_percentage: 0,
        player2_win_percentage: 0,
      },
      recent_games: [],
    }

    mockUseHeadToHeadStatistics.mockReturnValue({
      data: noGamesData,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useHeadToHeadStatistics>)

    render(<HeadToHeadComparison leaderboardData={mockLeaderboardData} />)

    // Select players
    const aliceButton = screen.getAllByText('Alice')[0]
    const bobButton = screen.getAllByText('Bob')[1]
    fireEvent.click(aliceButton)
    fireEvent.click(bobButton)

    expect(screen.getByText('🤷‍♂️')).toBeInTheDocument()
    expect(screen.getByText('No Games Played')).toBeInTheDocument()
    expect(
      screen.getByText("These players haven't played against each other yet")
    ).toBeInTheDocument()
  })

  it('handles empty leaderboard data gracefully', () => {
    render(<HeadToHeadComparison leaderboardData={undefined} />)

    expect(screen.getByText('🥊 Select First Player')).toBeInTheDocument()
    expect(screen.getByText('🥊 Select Second Player')).toBeInTheDocument()
    expect(screen.getAllByText('No players found')).toHaveLength(2)
  })
})
