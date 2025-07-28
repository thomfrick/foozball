// ABOUTME: Tests for the main App component
// ABOUTME: Verifies routing and basic app functionality

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'

// Test wrapper with all providers
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
        <ErrorBoundary>{children}</ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getAllByText('Foosball Tracker')).toHaveLength(2) // Header and footer
  })
})
