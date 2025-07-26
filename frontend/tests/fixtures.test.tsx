// ABOUTME: Tests validating frontend test fixtures and utilities
// ABOUTME: Ensures fixture functions provide correct data structures for component tests

import { describe, expect, it } from 'vitest'
import {
  formTestData,
  mockApiResponses,
  PlayerFixtures,
  testUtils,
} from '../src/test/fixtures'

describe('PlayerFixtures', () => {
  it('should create a basic player with default values', () => {
    const player = PlayerFixtures.createPlayer()

    expect(player).toEqual({
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
    })
  })

  it('should create a player with overrides', () => {
    const player = PlayerFixtures.createPlayer({
      name: 'Custom Player',
      email: 'custom@example.com',
      games_played: 10,
      wins: 7,
      losses: 3,
      win_percentage: 70.0,
    })

    expect(player.name).toBe('Custom Player')
    expect(player.email).toBe('custom@example.com')
    expect(player.games_played).toBe(10)
    expect(player.wins).toBe(7)
    expect(player.losses).toBe(3)
    expect(player.win_percentage).toBe(70.0)
  })

  it('should create multiple players with sequential IDs', () => {
    const players = PlayerFixtures.createPlayers(3, 'Test')

    expect(players).toHaveLength(3)
    expect(players[0].name).toBe('Test 1')
    expect(players[1].name).toBe('Test 2')
    expect(players[2].name).toBe('Test 3')
    expect(players[0].id).toBe(1)
    expect(players[1].id).toBe(2)
    expect(players[2].id).toBe(3)
  })

  it('should create diverse players data with varied skill levels', () => {
    const players = PlayerFixtures.createDiversePlayersData()

    expect(players).toHaveLength(5)

    // Check for different player types
    const names = players.map((p) => p.name)
    expect(names).toContain('Rookie Player')
    expect(names).toContain('Pro Player')
    expect(names).toContain('Learning Player')

    // Verify skill variation
    const mus = players.map((p) => p.trueskill_mu)
    expect(Math.min(...mus)).toBeLessThan(20.0)
    expect(Math.max(...mus)).toBeGreaterThan(30.0)

    // Check for player without email
    const anonymousPlayer = players.find((p) => p.email === null)
    expect(anonymousPlayer).toBeDefined()
    expect(anonymousPlayer!.name).toBe('Anonymous Player')
  })

  it('should create pagination test data with correct structure', () => {
    const players = PlayerFixtures.createPaginationTestData(25)

    expect(players).toHaveLength(25)

    // Verify sequential naming
    expect(players[0].name).toBe('Page Player 01')
    expect(players[24].name).toBe('Page Player 25')

    // Verify increasing games played
    expect(players[0].games_played).toBe(1)
    expect(players[24].games_played).toBe(25)
  })

  it('should create search test data with searchable names', () => {
    const players = PlayerFixtures.createSearchTestData()

    expect(players).toHaveLength(7)

    // Check for searchable patterns
    const johnPlayers = players.filter((p) => p.name.includes('John'))
    expect(johnPlayers.length).toBeGreaterThanOrEqual(2)

    const johnsonPlayers = players.filter((p) => p.name.includes('Johnson'))
    expect(johnsonPlayers.length).toBeGreaterThanOrEqual(2)
  })

  it('should create inactive players data', () => {
    const players = PlayerFixtures.createInactivePlayersData()

    expect(players).toHaveLength(2)

    const activePlayer = players.find((p) => p.is_active)
    const inactivePlayer = players.find((p) => !p.is_active)

    expect(activePlayer).toBeDefined()
    expect(inactivePlayer).toBeDefined()
    expect(inactivePlayer!.name).toBe('Inactive Player')
  })

  it('should create edge case players data with boundary values', () => {
    const players = PlayerFixtures.createEdgeCasePlayersData()

    expect(players).toHaveLength(4)

    // Check for long name
    const longNamePlayer = players.find((p) => p.name.length > 50)
    expect(longNamePlayer).toBeDefined()

    // Check for special characters
    const specialCharPlayer = players.find((p) => p.name.includes("'"))
    expect(specialCharPlayer).toBeDefined()

    // Check for perfect win rate
    const perfectPlayer = players.find((p) => p.win_percentage === 100.0)
    expect(perfectPlayer).toBeDefined()

    // Check for zero win rate
    const zeroWinPlayer = players.find((p) => p.win_percentage === 0.0)
    expect(zeroWinPlayer).toBeDefined()
  })

  it('should create leaderboard data sorted by rating', () => {
    const players = PlayerFixtures.createLeaderboardData(5)

    expect(players).toHaveLength(5)

    // Verify descending mu order
    const mus = players.map((p) => p.trueskill_mu)
    const sortedMus = [...mus].sort((a, b) => b - a)
    expect(mus).toEqual(sortedMus)

    // Verify rank naming
    expect(players[0].name).toBe('Rank 1 Player')
    expect(players[4].name).toBe('Rank 5 Player')
  })
})

describe('mockApiResponses', () => {
  it('should create proper player list response structure', () => {
    const players = PlayerFixtures.createPlayers(15)
    const response = mockApiResponses.playersList(players, 2, 5)

    expect(response).toEqual({
      players: players.slice(5, 10), // Page 2, size 5
      total: 15,
      page: 2,
      page_size: 5,
      total_pages: 3,
    })
  })

  it('should provide error response structures', () => {
    expect(mockApiResponses.errors.notFound).toEqual({
      detail: 'Player not found',
    })

    expect(mockApiResponses.errors.duplicate).toEqual({
      detail: 'Player with this name already exists',
    })

    expect(mockApiResponses.errors.validation).toHaveProperty('detail')
    expect(Array.isArray(mockApiResponses.errors.validation.detail)).toBe(true)
  })
})

describe('formTestData', () => {
  it('should provide valid form data', () => {
    expect(formTestData.valid).toEqual({
      name: 'New Player',
      email: 'new@example.com',
    })

    expect(formTestData.validWithoutEmail).toEqual({
      name: 'Anonymous Player',
      email: '',
    })
  })

  it('should provide invalid form data scenarios', () => {
    expect(formTestData.invalid.emptyName.name).toBe('')
    expect(formTestData.invalid.invalidEmail.email).toBe('not-an-email')
    expect(formTestData.invalid.longName.name.length).toBeGreaterThan(100)
  })
})

describe('testUtils', () => {
  it('should sort players by rating descending', () => {
    const players = [
      PlayerFixtures.createPlayer({ trueskill_mu: 20.0 }),
      PlayerFixtures.createPlayer({ trueskill_mu: 30.0 }),
      PlayerFixtures.createPlayer({ trueskill_mu: 25.0 }),
    ]

    const sorted = testUtils.sortPlayersByRating(players)
    const mus = sorted.map((p) => p.trueskill_mu)

    expect(mus).toEqual([30.0, 25.0, 20.0])
  })

  it('should filter players by search term case-insensitively', () => {
    const players = PlayerFixtures.createSearchTestData()
    const filtered = testUtils.filterPlayersBySearch(players, 'john')

    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((p) => p.name.toLowerCase().includes('john'))).toBe(
      true
    )
  })

  it('should filter active players only', () => {
    const players = PlayerFixtures.createInactivePlayersData()
    const activeOnly = testUtils.filterActivePlayersOnly(players)

    expect(activeOnly).toHaveLength(1)
    expect(activeOnly[0].is_active).toBe(true)
  })

  it('should calculate win percentage correctly', () => {
    expect(testUtils.calculateWinPercentage(7, 10)).toBe(70)
    expect(testUtils.calculateWinPercentage(0, 5)).toBe(0)
    expect(testUtils.calculateWinPercentage(5, 5)).toBe(100)
    expect(testUtils.calculateWinPercentage(3, 0)).toBe(0) // Edge case: no games
  })

  it('should generate random player data', () => {
    const player1 = testUtils.generateRandomPlayer(1)
    const player2 = testUtils.generateRandomPlayer(2)

    expect(player1.id).toBe(1)
    expect(player2.id).toBe(2)
    expect(player1.name).not.toEqual(player2.name)
    expect(player1.trueskill_mu).toBeGreaterThanOrEqual(15)
    expect(player1.trueskill_mu).toBeLessThanOrEqual(35)
    expect(player1.trueskill_sigma).toBeGreaterThanOrEqual(2)
    expect(player1.trueskill_sigma).toBeLessThanOrEqual(8)
  })
})
