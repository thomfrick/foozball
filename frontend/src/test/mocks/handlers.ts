// ABOUTME: MSW request handlers for mocking API responses in tests
// ABOUTME: Defines mock API endpoints that mirror the real backend API

import { http, HttpResponse } from 'msw'
import { Game } from '../../types/game'
import { Player } from '../../types/player'
import { PlayerFixtures } from '../fixtures'

// Initialize with diverse test data
const mockPlayers: Player[] = PlayerFixtures.createDiversePlayersData()

let playersData = [...mockPlayers]
let nextPlayerId = mockPlayers.length + 1

// Mock games data
const mockGames: Game[] = [
  {
    id: 1,
    player1_id: 1,
    player2_id: 2,
    winner_id: 1,
    created_at: '2023-01-03T14:30:00Z',
    player1: mockPlayers[0],
    player2: mockPlayers[1],
    winner: mockPlayers[0],
  },
  {
    id: 2,
    player1_id: 2,
    player2_id: 1,
    winner_id: 2,
    created_at: '2023-01-03T12:00:00Z',
    player1: mockPlayers[1],
    player2: mockPlayers[0],
    winner: mockPlayers[1],
  },
]

let gamesData = [...mockGames]
let nextGameId = mockGames.length + 1

export const handlers = [
  // GET /api/v1/players (with and without trailing slash)
  http.get('*/api/v1/players', ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('page_size') || '10')
    const activeOnly = url.searchParams.get('active_only') !== 'false'

    let filteredPlayers = activeOnly
      ? playersData.filter((p) => p.is_active)
      : playersData

    if (search) {
      filteredPlayers = filteredPlayers.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    const total = filteredPlayers.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const players = filteredPlayers.slice(startIndex, endIndex)

    return HttpResponse.json({
      players,
      total,
      page,
      page_size: pageSize,
      total_pages: totalPages,
    })
  }),

  // POST /api/v1/players (with and without trailing slash)
  http.post('*/api/v1/players', async ({ request }) => {
    const body = (await request.json()) as { name: string; email?: string }

    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return HttpResponse.json({ detail: 'Name is required' }, { status: 422 })
    }

    // Check for duplicate name
    if (playersData.some((p) => p.name === body.name && p.is_active)) {
      return HttpResponse.json(
        { detail: 'Player with this name already exists' },
        { status: 400 }
      )
    }

    // Check for duplicate email
    if (
      body.email &&
      playersData.some((p) => p.email === body.email && p.is_active)
    ) {
      return HttpResponse.json(
        { detail: 'Player with this email already exists' },
        { status: 400 }
      )
    }

    const newPlayer: Player = {
      id: nextPlayerId++,
      name: body.name,
      email: body.email || null,
      trueskill_mu: 25.0,
      trueskill_sigma: 8.3333,
      games_played: 0,
      wins: 0,
      losses: 0,
      win_percentage: 0.0,
      is_active: true,
      created_at: new Date().toISOString(),
    }

    playersData.push(newPlayer)

    return HttpResponse.json(newPlayer, { status: 201 })
  }),

  // GET /api/v1/players/:id
  http.get('*/api/v1/players/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const player = playersData.find((p) => p.id === id)

    if (!player) {
      return HttpResponse.json({ detail: 'Player not found' }, { status: 404 })
    }

    return HttpResponse.json(player)
  }),

  // PUT /api/v1/players/:id
  http.put('*/api/v1/players/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string)
    const body = (await request.json()) as { name?: string; email?: string }

    const playerIndex = playersData.findIndex((p) => p.id === id)
    if (playerIndex === -1) {
      return HttpResponse.json({ detail: 'Player not found' }, { status: 404 })
    }

    const player = playersData[playerIndex]
    const updatedPlayer = {
      ...player,
      ...body,
    }

    playersData[playerIndex] = updatedPlayer

    return HttpResponse.json(updatedPlayer)
  }),

  // DELETE /api/v1/players/:id
  http.delete('*/api/v1/players/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const playerIndex = playersData.findIndex((p) => p.id === id)

    if (playerIndex === -1) {
      return HttpResponse.json({ detail: 'Player not found' }, { status: 404 })
    }

    // Soft delete - mark as inactive
    playersData[playerIndex].is_active = false

    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/v1/games (with and without trailing slash)
  http.get('*/api/v1/games', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('page_size') || '10')

    const total = gamesData.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const games = gamesData.slice(startIndex, endIndex)

    return HttpResponse.json({
      games,
      total,
      page,
      page_size: pageSize,
      total_pages: totalPages,
    })
  }),

  // POST /api/v1/games
  http.post('*/api/v1/games', async ({ request }) => {
    const body = (await request.json()) as {
      player1_id: number
      player2_id: number
      winner_id: number
    }

    // Validate required fields
    if (!body.player1_id || !body.player2_id || !body.winner_id) {
      return HttpResponse.json(
        { detail: 'All fields are required' },
        { status: 422 }
      )
    }

    // Validate players exist
    const player1 = playersData.find(
      (p) => p.id === body.player1_id && p.is_active
    )
    const player2 = playersData.find(
      (p) => p.id === body.player2_id && p.is_active
    )

    if (!player1 || !player2) {
      return HttpResponse.json(
        { detail: 'One or more players not found' },
        { status: 404 }
      )
    }

    // Validate winner is one of the players
    if (
      body.winner_id !== body.player1_id &&
      body.winner_id !== body.player2_id
    ) {
      return HttpResponse.json(
        { detail: 'Winner must be one of the selected players' },
        { status: 400 }
      )
    }

    const winner = body.winner_id === body.player1_id ? player1 : player2

    const newGame: Game = {
      id: nextGameId++,
      player1_id: body.player1_id,
      player2_id: body.player2_id,
      winner_id: body.winner_id,
      created_at: new Date().toISOString(),
      player1,
      player2,
      winner,
    }

    gamesData.unshift(newGame) // Add to beginning for most recent first

    return HttpResponse.json(newGame, { status: 201 })
  }),

  // GET /api/v1/games/:id
  http.get('*/api/v1/games/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const game = gamesData.find((g) => g.id === id)

    if (!game) {
      return HttpResponse.json({ detail: 'Game not found' }, { status: 404 })
    }

    return HttpResponse.json(game)
  }),

  // GET /api/v1/players/:playerId/games
  http.get('*/api/v1/players/:playerId/games', ({ params, request }) => {
    const playerId = parseInt(params.playerId as string)
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('page_size') || '10')

    // Filter games for the specific player
    const playerGames = gamesData.filter(
      (g) => g.player1_id === playerId || g.player2_id === playerId
    )

    const total = playerGames.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const games = playerGames.slice(startIndex, endIndex)

    return HttpResponse.json({
      games,
      total,
      page,
      page_size: pageSize,
      total_pages: totalPages,
    })
  }),
]

// Reset function for test isolation
export const resetMockData = () => {
  playersData = [...mockPlayers]
  nextPlayerId = mockPlayers.length + 1
  gamesData = [...mockGames]
  nextGameId = mockGames.length + 1
}

// Additional utility functions for tests
export const setMockPlayersData = (players: Player[]) => {
  playersData = [...players]
  nextPlayerId = Math.max(...players.map((p) => p.id), 0) + 1
}

export const getMockPlayersData = () => [...playersData]

export const setMockGamesData = (games: Game[]) => {
  gamesData = [...games]
  nextGameId = Math.max(...games.map((g) => g.id), 0) + 1
}

export const getMockGamesData = () => [...gamesData]
