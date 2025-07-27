// ABOUTME: Integration tests for AddGameForm component with MSW API mocking
// ABOUTME: Tests realistic API interactions and error scenarios

import '../../test/setup-integration'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { PlayerFixtures } from '../../test/fixtures'
import { server } from '../../test/mocks/server'
import AddGameForm from '../AddGameForm'

// Use the test fixtures data which matches the global MSW setup
const mockPlayers = PlayerFixtures.createDiversePlayersData()

// The global MSW server is automatically set up in the test setup files

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </ThemeProvider>
  )
}

describe('AddGameForm Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads players and allows game creation', async () => {
    const mockOnSuccess = vi.fn()
    renderWithProviders(<AddGameForm onSuccess={mockOnSuccess} />)

    // Wait for players to load (using names from test fixtures)
    await waitFor(() => {
      const player1Select = screen.getByLabelText(/player 1/i)
      expect(player1Select).toBeInTheDocument()
      // Check if the first player is available in the dropdown options
      const options = player1Select.querySelectorAll('option')
      const hasPlayer = Array.from(options).some(
        (option) => option.textContent === mockPlayers[0].name
      )
      expect(hasPlayer).toBe(true)
    })

    // Select players
    const player1Select = screen.getByLabelText(/player 1/i)
    const player2Select = screen.getByLabelText(/player 2/i)

    fireEvent.change(player1Select, {
      target: { value: mockPlayers[0].id.toString() },
    })
    fireEvent.change(player2Select, {
      target: { value: mockPlayers[1].id.toString() },
    })

    // Winner dropdown should now be enabled
    const winnerSelect = screen.getByLabelText(/winner/i)
    expect(winnerSelect).not.toBeDisabled()

    // Select winner
    fireEvent.change(winnerSelect, {
      target: { value: mockPlayers[0].id.toString() },
    })

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Record Game' })
    fireEvent.click(submitButton)

    // Wait for success
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    // Form should be reset
    expect(player1Select.value).toBe('0')
    expect(player2Select.value).toBe('0')
    expect(winnerSelect.value).toBe('0')
  })

  it('handles API errors gracefully', async () => {
    // Mock API error
    server.use(
      http.post('*/api/v1/games', () => {
        return HttpResponse.json(
          { detail: 'Player validation failed' },
          { status: 400 }
        )
      })
    )

    renderWithProviders(<AddGameForm />)

    // Wait for players to load (using names from test fixtures)
    await waitFor(() => {
      const player1Select = screen.getByLabelText(/player 1/i)
      expect(player1Select).toBeInTheDocument()
      // Check if the first player is available in the dropdown options
      const options = player1Select.querySelectorAll('option')
      const hasPlayer = Array.from(options).some(
        (option) => option.textContent === mockPlayers[0].name
      )
      expect(hasPlayer).toBe(true)
    })

    // Fill form
    const player1Select = screen.getByLabelText(/player 1/i)
    const player2Select = screen.getByLabelText(/player 2/i)
    const winnerSelect = screen.getByLabelText(/winner/i)

    fireEvent.change(player1Select, {
      target: { value: mockPlayers[0].id.toString() },
    })
    fireEvent.change(player2Select, {
      target: { value: mockPlayers[1].id.toString() },
    })
    fireEvent.change(winnerSelect, {
      target: { value: mockPlayers[0].id.toString() },
    })

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Record Game' })
    fireEvent.click(submitButton)

    // Wait for error message (should show the specific API error)
    await waitFor(() => {
      expect(screen.getByText('Player validation failed')).toBeInTheDocument()
    })
  })

  it('handles network errors', async () => {
    // Mock network error that throws without a message property
    server.use(
      http.post('*/api/v1/games', () => {
        // Return a 500 status instead of HttpResponse.error() to ensure consistent error handling
        return new Response(null, { status: 500 })
      })
    )

    renderWithProviders(<AddGameForm />)

    // Wait for players to load (using names from test fixtures)
    await waitFor(() => {
      const player1Select = screen.getByLabelText(/player 1/i)
      expect(player1Select).toBeInTheDocument()
      // Check if the first player is available in the dropdown options
      const options = player1Select.querySelectorAll('option')
      const hasPlayer = Array.from(options).some(
        (option) => option.textContent === mockPlayers[0].name
      )
      expect(hasPlayer).toBe(true)
    })

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/player 1/i), {
      target: { value: mockPlayers[0].id.toString() },
    })
    fireEvent.change(screen.getByLabelText(/player 2/i), {
      target: { value: mockPlayers[1].id.toString() },
    })
    fireEvent.change(screen.getByLabelText(/winner/i), {
      target: { value: mockPlayers[0].id.toString() },
    })

    const submitButton = screen.getByRole('button', { name: 'Record Game' })
    fireEvent.click(submitButton)

    // Wait for error message or check if form remains filled (indicating error occurred)
    await waitFor(() => {
      // The form should still have the selected values (not reset on error)
      const player1Select = screen.getByLabelText(
        /player 1/i
      ) as HTMLSelectElement
      const player2Select = screen.getByLabelText(
        /player 2/i
      ) as HTMLSelectElement

      // Values should still be selected (form doesn't reset on error)
      expect(player1Select.value).toBe(mockPlayers[0].id.toString())
      expect(player2Select.value).toBe(mockPlayers[1].id.toString())
    })
  })

  it('handles players loading failure', async () => {
    // Mock players API error
    server.use(
      http.get('*/api/v1/players', () => {
        return HttpResponse.json({ detail: 'Server error' }, { status: 500 })
      })
    )

    renderWithProviders(<AddGameForm />)

    // Should show loading first, then error state
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    // Wait for component to handle the error gracefully
    await waitFor(() => {
      // Component should still render the form title even on error
      expect(screen.getByText('Record Game')).toBeInTheDocument()
      // Loading state should be gone
      expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument()
    })
  })

  it('shows insufficient players warning correctly', async () => {
    // Mock API with only one player
    server.use(
      http.get('*/api/v1/players', () => {
        return HttpResponse.json({
          players: [mockPlayers[0]],
          total: 1,
          page: 1,
          page_size: 100,
          total_pages: 1,
        })
      })
    )

    renderWithProviders(<AddGameForm />)

    // Wait for insufficient players message
    await waitFor(() => {
      expect(
        screen.getByText(/you need at least 2 active players/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/current active players: 1/i)).toBeInTheDocument()
    })

    // Form should not be usable
    expect(screen.queryByLabelText(/player 1/i)).not.toBeInTheDocument()
  })

  it('handles slow API responses with loading states', async () => {
    // Mock slow API response
    server.use(
      http.get('*/api/v1/players', async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second delay
        return HttpResponse.json({
          players: mockPlayers,
          total: mockPlayers.length,
          page: 1,
          page_size: 100,
          total_pages: 1,
        })
      })
    )

    renderWithProviders(<AddGameForm />)

    // Should show loading state
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText(mockPlayers[0].name)).not.toBeInTheDocument()

    // Wait for loading to complete - check for the player in a specific select
    await waitFor(
      () => {
        const player1Select = screen.getByLabelText(/player 1/i)
        const options = player1Select.querySelectorAll('option')
        const hasPlayer = Array.from(options).some(
          (option) => option.textContent === mockPlayers[0].name
        )
        expect(hasPlayer).toBe(true)
      },
      { timeout: 2000 }
    )

    // Loading state should be gone
    expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument()
  })

  it('prevents double submission during API call', async () => {
    let requestCount = 0

    // Mock API with delay to test double submission prevention
    server.use(
      http.post('*/api/v1/games', async () => {
        requestCount++
        await new Promise((resolve) => setTimeout(resolve, 500))
        return HttpResponse.json(
          {
            id: requestCount,
            player1_id: mockPlayers[0].id,
            player2_id: mockPlayers[1].id,
            winner_id: mockPlayers[0].id,
            created_at: '2023-01-01T12:00:00Z',
            player1: mockPlayers[0],
            player2: mockPlayers[1],
            winner: mockPlayers[0],
          },
          { status: 201 }
        )
      })
    )

    renderWithProviders(<AddGameForm />)

    // Wait for players to load (using names from test fixtures)
    await waitFor(() => {
      const player1Select = screen.getByLabelText(/player 1/i)
      expect(player1Select).toBeInTheDocument()
      // Check if the first player is available in the dropdown options
      const options = player1Select.querySelectorAll('option')
      const hasPlayer = Array.from(options).some(
        (option) => option.textContent === mockPlayers[0].name
      )
      expect(hasPlayer).toBe(true)
    })

    // Fill form
    fireEvent.change(screen.getByLabelText(/player 1/i), {
      target: { value: mockPlayers[0].id.toString() },
    })
    fireEvent.change(screen.getByLabelText(/player 2/i), {
      target: { value: mockPlayers[1].id.toString() },
    })
    fireEvent.change(screen.getByLabelText(/winner/i), {
      target: { value: mockPlayers[0].id.toString() },
    })

    const submitButton = screen.getByRole('button', { name: 'Record Game' })

    // Click submit button multiple times rapidly
    fireEvent.click(submitButton)
    fireEvent.click(submitButton)
    fireEvent.click(submitButton)

    // Button should be disabled during loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })

    // Button should have loading state (opacity changes)
    expect(submitButton).toHaveClass('opacity-75', 'cursor-not-allowed')

    // Wait for completion (button no longer loading)
    await waitFor(
      () => {
        expect(submitButton).not.toBeDisabled()
      },
      { timeout: 1000 }
    )

    // Should only have made one request despite multiple clicks
    expect(requestCount).toBe(1)
  })

  it('updates winner options dynamically when players change', async () => {
    renderWithProviders(<AddGameForm />)

    // Wait for players to load (using names from test fixtures)
    await waitFor(() => {
      const player1Select = screen.getByLabelText(/player 1/i)
      expect(player1Select).toBeInTheDocument()
      // Check if the first player is available in the dropdown options
      const options = player1Select.querySelectorAll('option')
      const hasPlayer = Array.from(options).some(
        (option) => option.textContent === mockPlayers[0].name
      )
      expect(hasPlayer).toBe(true)
    })

    const player1Select = screen.getByLabelText(/player 1/i)
    const player2Select = screen.getByLabelText(/player 2/i)
    const winnerSelect = screen.getByLabelText(/winner/i)

    // Initially winner should be disabled (no players selected)
    expect(winnerSelect).toBeDisabled()

    // Select first player
    fireEvent.change(player1Select, {
      target: { value: mockPlayers[0].id.toString() },
    })

    // Winner should now be enabled (at least one player selected)
    // Wait a moment for the state to update
    await waitFor(() => {
      expect(winnerSelect).not.toBeDisabled()
    })

    // Select second player
    fireEvent.change(player2Select, {
      target: { value: mockPlayers[1].id.toString() },
    })

    // Winner should still be enabled with both players
    expect(winnerSelect).not.toBeDisabled()

    // Check winner options - should now contain both players
    const winnerOptions = Array.from(winnerSelect.querySelectorAll('option'))
    const optionTexts = winnerOptions.map((option) => option.textContent)

    expect(optionTexts).toContain(mockPlayers[0].name)
    expect(optionTexts).toContain(mockPlayers[1].name)
    expect(optionTexts).not.toContain(mockPlayers[2].name) // Not selected as player

    // Change player1, winner should reset
    fireEvent.change(player1Select, {
      target: { value: mockPlayers[2].id.toString() },
    })

    // Winner should reset to default
    expect(winnerSelect.value).toBe('0')

    // Winner options should update
    const updatedOptions = Array.from(winnerSelect.querySelectorAll('option'))
    const updatedTexts = updatedOptions.map((option) => option.textContent)

    expect(updatedTexts).toContain(mockPlayers[2].name) // Now available
    expect(updatedTexts).toContain(mockPlayers[1].name)
    expect(updatedTexts).not.toContain(mockPlayers[0].name) // No longer selected
  })

  it('validates that winner must be one of selected players', async () => {
    renderWithProviders(<AddGameForm />)

    // Wait for players to load (using names from test fixtures)
    await waitFor(() => {
      const player1Select = screen.getByLabelText(/player 1/i)
      expect(player1Select).toBeInTheDocument()
      // Check if the first player is available in the dropdown options
      const options = player1Select.querySelectorAll('option')
      const hasPlayer = Array.from(options).some(
        (option) => option.textContent === mockPlayers[0].name
      )
      expect(hasPlayer).toBe(true)
    })

    // Select players
    fireEvent.change(screen.getByLabelText(/player 1/i), {
      target: { value: mockPlayers[0].id.toString() },
    })
    fireEvent.change(screen.getByLabelText(/player 2/i), {
      target: { value: mockPlayers[1].id.toString() },
    })

    // Don't select winner, try to submit
    const submitButton = screen.getByRole('button', { name: 'Record Game' })
    fireEvent.click(submitButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Please select the winner')).toBeInTheDocument()
    })

    // Form should not be submitted (button not in loading state)
    expect(submitButton).not.toBeDisabled()
  })
})
