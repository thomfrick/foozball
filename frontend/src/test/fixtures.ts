// ABOUTME: Test data fixtures and factories for frontend component testing
// ABOUTME: Provides reusable mock data and factory functions for React tests

import { Player } from '../types/player'

export class PlayerFixtures {
  /**
   * Create a basic player object with default values
   */
  static createPlayer(overrides: Partial<Player> = {}): Player {
    return {
      id: 1,
      name: 'Test Player',
      email: 'test@example.com',
      trueskill_mu: 25.0,
      trueskill_sigma: 8.3333,
      games_played: 0,
      wins: 0,
      losses: 0,
      win_percentage: 0.0,
      is_active: true,
      created_at: '2024-01-15T10:30:00Z',
      ...overrides,
    }
  }

  /**
   * Create multiple players with sequential IDs and names
   */
  static createPlayers(count: number, baseName = 'Player'): Player[] {
    return Array.from({ length: count }, (_, index) =>
      this.createPlayer({
        id: index + 1,
        name: `${baseName} ${index + 1}`,
        email: `${baseName.toLowerCase()}${index + 1}@example.com`,
      })
    )
  }

  /**
   * Create players with diverse skill levels and performance data
   */
  static createDiversePlayersData(): Player[] {
    return [
      // Rookie player
      this.createPlayer({
        id: 1,
        name: 'Rookie Player',
        email: 'rookie@example.com',
        trueskill_mu: 25.0,
        trueskill_sigma: 8.3333,
        games_played: 0,
        wins: 0,
        losses: 0,
        win_percentage: 0.0,
      }),
      // Pro player with high rating
      this.createPlayer({
        id: 2,
        name: 'Pro Player',
        email: 'pro@example.com',
        trueskill_mu: 35.0,
        trueskill_sigma: 5.2,
        games_played: 100,
        wins: 75,
        losses: 25,
        win_percentage: 75.0,
      }),
      // Average player
      this.createPlayer({
        id: 3,
        name: 'Average Player',
        email: 'average@example.com',
        trueskill_mu: 25.0,
        trueskill_sigma: 6.8,
        games_played: 50,
        wins: 25,
        losses: 25,
        win_percentage: 50.0,
      }),
      // Learning player with low rating
      this.createPlayer({
        id: 4,
        name: 'Learning Player',
        email: 'learning@example.com',
        trueskill_mu: 18.5,
        trueskill_sigma: 7.1,
        games_played: 30,
        wins: 8,
        losses: 22,
        win_percentage: 26.7,
      }),
      // Player without email
      this.createPlayer({
        id: 5,
        name: 'Anonymous Player',
        email: null,
        games_played: 10,
        wins: 3,
        losses: 7,
        win_percentage: 30.0,
      }),
    ]
  }

  /**
   * Create players for pagination testing
   */
  static createPaginationTestData(totalCount = 25): Player[] {
    return Array.from({ length: totalCount }, (_, index) =>
      this.createPlayer({
        id: index + 1,
        name: `Page Player ${(index + 1).toString().padStart(2, '0')}`,
        email: `page${(index + 1).toString().padStart(2, '0')}@example.com`,
        games_played: index + 1,
        wins: Math.floor((index + 1) * 0.6),
        losses: Math.ceil((index + 1) * 0.4),
        win_percentage: Math.round((((index + 1) * 0.6) / (index + 1)) * 100),
      })
    )
  }

  /**
   * Create players for search functionality testing
   */
  static createSearchTestData(): Player[] {
    return [
      this.createPlayer({
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      }),
      this.createPlayer({
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      }),
      this.createPlayer({
        id: 3,
        name: 'John Smith',
        email: 'john.smith@example.com',
      }),
      this.createPlayer({
        id: 4,
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
      }),
      this.createPlayer({
        id: 5,
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
      }),
      this.createPlayer({
        id: 6,
        name: 'David Wilson',
        email: 'david.wilson@example.com',
      }),
      this.createPlayer({
        id: 7,
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
      }),
    ]
  }

  /**
   * Create inactive players for testing active/inactive filtering
   */
  static createInactivePlayersData(): Player[] {
    return [
      this.createPlayer({
        id: 1,
        name: 'Active Player',
        email: 'active@example.com',
        is_active: true,
      }),
      this.createPlayer({
        id: 2,
        name: 'Inactive Player',
        email: 'inactive@example.com',
        is_active: false,
        games_played: 25,
        wins: 10,
        losses: 15,
        win_percentage: 40.0,
      }),
    ]
  }

  /**
   * Create players with edge case data for robust testing
   */
  static createEdgeCasePlayersData(): Player[] {
    return [
      // Player with very long name
      this.createPlayer({
        id: 1,
        name: 'A'.repeat(100),
        email: 'longname@example.com',
      }),
      // Player with special characters
      this.createPlayer({
        id: 2,
        name: "José María O'Connor-Smith",
        email: 'special@example.com',
      }),
      // Player with perfect win rate
      this.createPlayer({
        id: 3,
        name: 'Perfect Player',
        email: 'perfect@example.com',
        games_played: 20,
        wins: 20,
        losses: 0,
        win_percentage: 100.0,
      }),
      // Player with zero win rate
      this.createPlayer({
        id: 4,
        name: 'Unlucky Player',
        email: 'unlucky@example.com',
        games_played: 15,
        wins: 0,
        losses: 15,
        win_percentage: 0.0,
      }),
    ]
  }

  /**
   * Create leaderboard data sorted by skill rating
   */
  static createLeaderboardData(size = 10): Player[] {
    return Array.from({ length: size }, (_, index) => {
      const mu = 35.0 - index * 2.0 // Decreasing skill
      const sigma = 3.0 + index * 0.3 // Increasing uncertainty
      const games = 50 + index * 5
      const winRate = 0.8 - index * 0.05 // Decreasing win rate
      const wins = Math.floor(games * winRate)
      const losses = games - wins

      return this.createPlayer({
        id: index + 1,
        name: `Rank ${index + 1} Player`,
        email: `rank${index + 1}@example.com`,
        trueskill_mu: mu,
        trueskill_sigma: sigma,
        games_played: games,
        wins: wins,
        losses: losses,
        win_percentage: Math.round(winRate * 100),
      })
    })
  }
}

/**
 * Mock API response structures for testing
 */
export const mockApiResponses = {
  /**
   * Mock successful player list response
   */
  playersList: (players: Player[], page = 1, pageSize = 10) => ({
    players: players.slice((page - 1) * pageSize, page * pageSize),
    total: players.length,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(players.length / pageSize),
  }),

  /**
   * Mock error responses
   */
  errors: {
    notFound: {
      detail: 'Player not found',
    },
    validation: {
      detail: [
        {
          loc: ['body', 'name'],
          msg: 'field required',
          type: 'value_error.missing',
        },
      ],
    },
    duplicate: {
      detail: 'Player with this name already exists',
    },
    serverError: {
      detail: 'Internal server error',
    },
  },
}

/**
 * Form data for testing form components
 */
export const formTestData = {
  valid: {
    name: 'New Player',
    email: 'new@example.com',
  },
  validWithoutEmail: {
    name: 'Anonymous Player',
    email: '',
  },
  invalid: {
    emptyName: {
      name: '',
      email: 'valid@example.com',
    },
    invalidEmail: {
      name: 'Valid Name',
      email: 'not-an-email',
    },
    longName: {
      name: 'A'.repeat(101), // Assuming 100 char limit
      email: 'valid@example.com',
    },
  },
}

/**
 * Utility functions for test data manipulation
 */
export const testUtils = {
  /**
   * Sort players by rating (mu) descending
   */
  sortPlayersByRating: (players: Player[]): Player[] =>
    [...players].sort((a, b) => b.trueskill_mu - a.trueskill_mu),

  /**
   * Filter players by search term
   */
  filterPlayersBySearch: (players: Player[], searchTerm: string): Player[] =>
    players.filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),

  /**
   * Filter active players only
   */
  filterActivePlayersOnly: (players: Player[]): Player[] =>
    players.filter((player) => player.is_active),

  /**
   * Calculate win percentage
   */
  calculateWinPercentage: (wins: number, games: number): number =>
    games === 0 ? 0 : Math.round((wins / games) * 100),

  /**
   * Generate random player data for fuzz testing
   */
  generateRandomPlayer: (id = Math.floor(Math.random() * 1000)): Player => {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']
    const domains = ['example.com', 'test.org', 'demo.net']
    const name = names[Math.floor(Math.random() * names.length)]
    const domain = domains[Math.floor(Math.random() * domains.length)]
    const games = Math.floor(Math.random() * 100)
    const wins = Math.floor(Math.random() * games)

    return PlayerFixtures.createPlayer({
      id,
      name: `${name} ${id}`,
      email: `${name.toLowerCase()}${id}@${domain}`,
      trueskill_mu: 15 + Math.random() * 20, // 15-35 range
      trueskill_sigma: 2 + Math.random() * 6, // 2-8 range
      games_played: games,
      wins,
      losses: games - wins,
      win_percentage: testUtils.calculateWinPercentage(wins, games),
    })
  },
}
