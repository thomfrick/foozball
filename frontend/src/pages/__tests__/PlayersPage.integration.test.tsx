// ABOUTME: Integration tests for PlayersPage with real API interactions
// ABOUTME: Tests full player management workflow including search, pagination, and CRUD operations

import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import PlayersPage from '../PlayersPage'
import '../../test/setup-integration'

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('PlayersPage Integration Tests', () => {
  beforeEach(() => {
    // Reset is handled by setup-integration.ts
  })

  it('loads and displays players from API', async () => {
    renderWithProviders(<PlayersPage />)

    // Wait for players to load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.getByText('Bob Smith')).toBeInTheDocument()
    })

    // Check player details are displayed
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    expect(screen.getByText(/15.*games/)).toBeInTheDocument()
    expect(screen.getByText(/12.*games/)).toBeInTheDocument()
  })

  it('searches players via API', async () => {
    renderWithProviders(<PlayersPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    })

    // Search for Alice
    const searchInput = screen.getByPlaceholderText(/search players/i)
    fireEvent.change(searchInput, { target: { value: 'Alice' } })

    // Wait for search results (debounced)
    await waitFor(
      () => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument()
      },
      { timeout: 1000 }
    )
  })

  it('opens add player modal and creates new player', async () => {
    renderWithProviders(<PlayersPage />)

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Players')).toBeInTheDocument()
    })

    // Click add player button
    const addButton = screen.getByText(/add new player/i)
    fireEvent.click(addButton)

    // Form should open (view changes to add mode)
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument()
    })

    // Fill out form
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(nameInput, {
      target: { value: 'Integration Test Player' },
    })
    fireEvent.change(emailInput, { target: { value: 'integration@test.com' } })

    // Submit form
    const createButton = screen.getByRole('button', { name: /create player/i })
    fireEvent.click(createButton)

    // Wait for modal to close and player to appear in list
    await waitFor(() => {
      expect(
        screen.queryByRole('textbox', { name: /name/i })
      ).not.toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Integration Test Player')).toBeInTheDocument()
      expect(screen.getByText('integration@test.com')).toBeInTheDocument()
    })
  })

  it('edits existing player', async () => {
    renderWithProviders(<PlayersPage />)

    // Wait for players to load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    })

    // Find Alice's row and click edit button
    const aliceContainer = screen
      .getByText('Alice Johnson')
      .closest('div[class*="p-4 border border-gray-200"]')!
    const editButton = within(aliceContainer).getByText(/edit/i)
    fireEvent.click(editButton)

    // Should navigate to detail view (edit functionality redirects to detail for now)
    await waitFor(() => {
      expect(screen.getByText('TrueSkill Rating')).toBeInTheDocument()
      expect(screen.getByText('Game Statistics')).toBeInTheDocument()
    })

    // Detail view should show Alice's information
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText(/26.5 ± 7.2/)).toBeInTheDocument()
  })

  it('deletes player', async () => {
    renderWithProviders(<PlayersPage />)

    // Wait for players to load
    await waitFor(() => {
      expect(screen.getByText('Bob Smith')).toBeInTheDocument()
    })

    // Find Bob's row and click delete button
    const bobContainer = screen
      .getByText('Bob Smith')
      .closest('div[class*="p-4 border border-gray-200"]')!
    const deleteButton = within(bobContainer).getByText(/delete/i)
    fireEvent.click(deleteButton)

    // Confirm deletion in modal
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByRole('dialog')
    const confirmButton = within(dialog).getByRole('button', {
      name: 'Delete Player',
    })
    fireEvent.click(confirmButton)

    // Wait for modal to close and player to be removed
    await waitFor(() => {
      expect(screen.queryByText('Delete Player')).not.toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument()
    })

    // Alice should still be there
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
  })

  it('handles empty search results', async () => {
    renderWithProviders(<PlayersPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    })

    // Search for non-existent player
    const searchInput = screen.getByPlaceholderText(/search players/i)
    fireEvent.change(searchInput, { target: { value: 'NonExistentPlayer' } })

    // Wait for empty results
    await waitFor(
      () => {
        expect(screen.getByText(/no players found/i)).toBeInTheDocument()
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument()
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument()
      },
      { timeout: 1000 }
    )
  })

  it('handles API error gracefully', async () => {
    // Import server to override handlers for this test
    const { server } = await import('../../test/mocks/server')
    const { http, HttpResponse } = await import('msw')

    // Override handler to simulate API error
    server.use(
      http.get('http://localhost:8000/api/v1/players', () => {
        return HttpResponse.error()
      })
    )

    renderWithProviders(<PlayersPage />)

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/failed to load players/i)).toBeInTheDocument()
    })

    // Should show retry button
    expect(screen.getByText(/try again/i)).toBeInTheDocument()
  })

  it('retries loading after error', async () => {
    // Import server to override handlers for this test
    const { server } = await import('../../test/mocks/server')
    const { http, HttpResponse } = await import('msw')
    const { handlers } = await import('../../test/mocks/handlers')

    // Override handler to simulate API error initially
    server.use(
      http.get('http://localhost:8000/api/v1/players', () => {
        return HttpResponse.error()
      })
    )

    renderWithProviders(<PlayersPage />)

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/failed to load players/i)).toBeInTheDocument()
    })

    // Reset to working handlers
    server.use(...handlers)

    // Click retry
    const retryButton = screen.getByText(/try again/i)
    fireEvent.click(retryButton)

    // Wait for successful load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(
        screen.queryByText(/failed to load players/i)
      ).not.toBeInTheDocument()
    })
  })
})
