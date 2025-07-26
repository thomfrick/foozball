// ABOUTME: Tests for the HomePage component
// ABOUTME: Verifies the home page renders correctly and has proper navigation

import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import HomePage from '../HomePage'

// Test wrapper with required providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('HomePage', () => {
  it('renders the main title', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    expect(screen.getByText('🏓 Foosball ELO Tracker')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    expect(
      screen.getByRole('link', { name: /view players/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
  })

  it('shows the success message', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    expect(
      screen.getByText(/phase 1\.3 trueskill system complete/i)
    ).toBeInTheDocument()
  })
})
