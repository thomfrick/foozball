// ABOUTME: MSW request handlers for mocking API responses in tests
// ABOUTME: Defines mock API endpoints that mirror the real backend API

import { http, HttpResponse } from 'msw'
import { Player } from '../../types/player'

// Mock data for testing
const mockPlayers: Player[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    trueskill_mu: 26.5,
    trueskill_sigma: 7.2,
    games_played: 15,
    wins: 9,
    losses: 6,
    win_percentage: 60.0,
    is_active: true,
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    trueskill_mu: 23.8,
    trueskill_sigma: 8.1,
    games_played: 12,
    wins: 5,
    losses: 7,
    win_percentage: 41.7,
    is_active: true,
    created_at: '2024-01-10T14:20:00Z',
  },
]

let playersData = [...mockPlayers]
let nextId = 3

export const handlers = [
  // GET /api/v1/players
  http.get('http://localhost:8000/api/v1/players', ({ request }) => {
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

  // POST /api/v1/players
  http.post('http://localhost:8000/api/v1/players', async ({ request }) => {
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
      id: nextId++,
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
  http.get('http://localhost:8000/api/v1/players/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const player = playersData.find((p) => p.id === id)

    if (!player) {
      return HttpResponse.json({ detail: 'Player not found' }, { status: 404 })
    }

    return HttpResponse.json(player)
  }),

  // PUT /api/v1/players/:id
  http.put(
    'http://localhost:8000/api/v1/players/:id',
    async ({ params, request }) => {
      const id = parseInt(params.id as string)
      const body = (await request.json()) as { name?: string; email?: string }

      const playerIndex = playersData.findIndex((p) => p.id === id)
      if (playerIndex === -1) {
        return HttpResponse.json(
          { detail: 'Player not found' },
          { status: 404 }
        )
      }

      const player = playersData[playerIndex]
      const updatedPlayer = {
        ...player,
        ...body,
      }

      playersData[playerIndex] = updatedPlayer

      return HttpResponse.json(updatedPlayer)
    }
  ),

  // DELETE /api/v1/players/:id
  http.delete('http://localhost:8000/api/v1/players/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const playerIndex = playersData.findIndex((p) => p.id === id)

    if (playerIndex === -1) {
      return HttpResponse.json({ detail: 'Player not found' }, { status: 404 })
    }

    // Soft delete - mark as inactive
    playersData[playerIndex].is_active = false

    return new HttpResponse(null, { status: 204 })
  }),
]

// Reset function for test isolation
export const resetMockData = () => {
  playersData = [...mockPlayers]
  nextId = 3
}
