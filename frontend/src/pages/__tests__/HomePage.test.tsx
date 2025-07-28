// ABOUTME: Tests for the HomePage component
// ABOUTME: Verifies the home page renders correctly and has proper navigation

import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '../../contexts/ThemeContext'
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
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

describe('HomePage', () => {
  it('renders the main title', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    expect(screen.getByText('Welcome to Foosball Tracker')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    expect(
      screen.getByRole('link', { name: /view leaderboard/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /manage players/i })
    ).toBeInTheDocument()
  })

  it('shows the success message', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    )

    expect(
      screen.getByText(/phase 1\.5 modern ui design system complete/i)
    ).toBeInTheDocument()
  })
})
