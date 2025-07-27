// ABOUTME: Test suite for AddPlayerForm component functionality
// ABOUTME: Tests form validation, submission, and error handling

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../../contexts/ThemeContext'
import AddPlayerForm from '../AddPlayerForm'

// Mock the API hooks
vi.mock('../../hooks/useApi', () => ({
  useCreatePlayer: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
}))

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

describe('AddPlayerForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    renderWithProviders(<AddPlayerForm />)

    expect(screen.getByText('Add New Player')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create player/i })
    ).toBeInTheDocument()
  })

  it('shows validation error for empty name', async () => {
    renderWithProviders(<AddPlayerForm />)

    const submitButton = screen.getByRole('button', { name: /create player/i })
    const form = submitButton.closest('form')

    // Submit the form to trigger validation
    fireEvent.submit(form!)

    await waitFor(
      () => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
      },
      { timeout: 2000 }
    )
  })

  it('shows validation error for short name', async () => {
    renderWithProviders(<AddPlayerForm />)

    const nameInput = screen.getByLabelText(/name/i)
    fireEvent.change(nameInput, { target: { value: 'A' } })

    const submitButton = screen.getByRole('button', { name: /create player/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Name must be at least 2 characters')
      ).toBeInTheDocument()
    })
  })

  it('accepts valid form input', async () => {
    renderWithProviders(<AddPlayerForm />)

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)

    fireEvent.change(nameInput, { target: { value: 'Test Player' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    const submitButton = screen.getByRole('button', { name: /create player/i })
    fireEvent.click(submitButton)

    // Should not show validation errors for valid input
    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
      expect(
        screen.queryByText('Please enter a valid email address')
      ).not.toBeInTheDocument()
    })
  })

  it('clears field errors when user starts typing', async () => {
    renderWithProviders(<AddPlayerForm />)

    const nameInput = screen.getByLabelText(/name/i)
    const submitButton = screen.getByRole('button', { name: /create player/i })
    const form = submitButton.closest('form')

    // Trigger validation error
    fireEvent.submit(form!)
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })

    // Start typing to clear error
    fireEvent.change(nameInput, { target: { value: 'T' } })

    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    renderWithProviders(<AddPlayerForm onCancel={onCancel} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(onCancel).toHaveBeenCalledOnce()
  })
})
