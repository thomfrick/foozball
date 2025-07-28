// ABOUTME: Integration tests for AddPlayerForm with real API calls
// ABOUTME: Tests form submission flow with mock API responses and error handling

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../../contexts/ThemeContext'
import AddPlayerForm from '../AddPlayerForm'
import '../../test/setup-integration'

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

describe('AddPlayerForm Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully creates a player and calls onSuccess', async () => {
    const onSuccess = vi.fn()
    renderWithProviders(<AddPlayerForm onSuccess={onSuccess} />)

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /create player/i })

    // Fill out the form
    fireEvent.change(nameInput, { target: { value: 'New Test Player' } })
    fireEvent.change(emailInput, { target: { value: 'newtest@example.com' } })

    // Submit the form
    fireEvent.click(submitButton)

    // Wait for successful submission
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce()
    })

    // Form should be reset after successful submission
    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
  })

  it('handles duplicate name error from API', async () => {
    renderWithProviders(<AddPlayerForm />)

    const nameInput = screen.getByLabelText(/name/i)
    const submitButton = screen.getByRole('button', { name: /create player/i })

    // Try to create player with existing name (from fixtures)
    fireEvent.change(nameInput, { target: { value: 'Rookie Player' } })
    fireEvent.click(submitButton)

    // Wait for error message
    await waitFor(() => {
      expect(
        screen.getByText(/player with this name already exists/i)
      ).toBeInTheDocument()
    })

    // Button should not be disabled after error
    expect(submitButton).not.toBeDisabled()
  })

  it('handles duplicate email error from API', async () => {
    renderWithProviders(<AddPlayerForm />)

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /create player/i })

    // Try to create player with existing email (from fixtures)
    fireEvent.change(nameInput, { target: { value: 'Different Name' } })
    fireEvent.change(emailInput, { target: { value: 'rookie@example.com' } })
    fireEvent.click(submitButton)

    // Wait for error message
    await waitFor(() => {
      expect(
        screen.getByText(/player with this email already exists/i)
      ).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    renderWithProviders(<AddPlayerForm />)

    const nameInput = screen.getByLabelText(/name/i)
    const submitButton = screen.getByRole('button', { name: /create player/i })

    fireEvent.change(nameInput, { target: { value: 'Loading Test Player' } })
    fireEvent.click(submitButton)

    // Check for loading state (button should be disabled)
    expect(submitButton).toBeDisabled()
    // Disabled styling is handled by CSS pseudo-classes

    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('creates player with only name (email optional)', async () => {
    const onSuccess = vi.fn()
    renderWithProviders(<AddPlayerForm onSuccess={onSuccess} />)

    const nameInput = screen.getByLabelText(/name/i)
    const submitButton = screen.getByRole('button', { name: /create player/i })

    // Fill only name
    fireEvent.change(nameInput, { target: { value: 'Name Only Player' } })
    fireEvent.click(submitButton)

    // Wait for successful submission
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce()
    })
  })

  it('handles network error gracefully', async () => {
    // Import server to override handlers for this test
    const { server } = await import('../../test/mocks/server')
    const { http, HttpResponse } = await import('msw')

    // Override handler to simulate network error
    server.use(
      http.post('http://localhost:8000/api/v1/players', () => {
        return HttpResponse.error()
      })
    )

    renderWithProviders(<AddPlayerForm />)

    const nameInput = screen.getByLabelText(/name/i)
    const submitButton = screen.getByRole('button', { name: /create player/i })

    fireEvent.change(nameInput, { target: { value: 'Network Error Player' } })
    fireEvent.click(submitButton)

    // Wait for error handling
    await waitFor(
      () => {
        expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })
})
