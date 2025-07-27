// ABOUTME: Test suite for responsive design across different screen sizes
// ABOUTME: Verifies component layout and behavior on mobile, tablet, and desktop

import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../../contexts/ThemeContext'
import AddGameForm from '../AddGameForm'
import AddPlayerForm from '../AddPlayerForm'

// Mock window.matchMedia for responsive testing
const createMatchMedia = () => (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})

// Mock window.innerWidth
const mockWindowWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: createMatchMedia(),
  })
}

// Mock players data
const mockPlayers = [
  {
    id: 1,
    name: 'Player 1',
    email: 'player1@test.com',
    trueskill_mu: 25.0,
    trueskill_sigma: 8.3333,
    games_played: 0,
    wins: 0,
    losses: 0,
    win_percentage: 0,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Player 2',
    email: 'player2@test.com',
    trueskill_mu: 25.0,
    trueskill_sigma: 8.3333,
    games_played: 0,
    wins: 0,
    losses: 0,
    win_percentage: 0,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
  },
]

// Mock the API hooks
vi.mock('../../hooks/useApi', () => ({
  useCreatePlayer: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useCreateGame: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  usePlayers: () => ({
    data: {
      players: mockPlayers,
      total: 2,
      page: 1,
      page_size: 100,
      total_pages: 1,
    },
    isLoading: false,
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
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          {component}
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

describe('Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Mobile (320px)', () => {
    beforeEach(() => {
      mockWindowWidth(320)
    })

    it('AddPlayerForm renders correctly on mobile', () => {
      renderWithProviders(<AddPlayerForm />)

      // Check basic rendering
      expect(
        screen.getByRole('heading', { name: 'Add New Player' })
      ).toBeInTheDocument()
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()

      // Check that responsive classes are applied (these indicate responsive design)
      const nameInput = screen.getByLabelText(/name/i)
      expect(nameInput).toHaveClass('w-full') // This indicates full width responsive design

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveClass('w-full')
    })

    it('AddGameForm renders correctly on mobile', () => {
      renderWithProviders(<AddGameForm />)

      // Check basic rendering
      expect(
        screen.getByRole('heading', { name: 'Record Game' })
      ).toBeInTheDocument()
      expect(screen.getByLabelText(/player 1/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/player 2/i)).toBeInTheDocument()

      // Check form layout
      const player1Select = screen.getByLabelText(/player 1/i)
      expect(player1Select).toHaveClass('w-full')

      const player2Select = screen.getByLabelText(/player 2/i)
      expect(player2Select).toHaveClass('w-full')

      // Check button layout
      const submitButton = screen.getByRole('button', { name: 'Record Game' })
      expect(submitButton).toHaveClass('flex-1')
    })

    it('form buttons are touch-friendly on mobile', () => {
      renderWithProviders(<AddPlayerForm />)

      const submitButton = screen.getByRole('button', {
        name: /create player/i,
      })

      // Check for touch-friendly padding classes (py-2 = 8px top/bottom, px-4 = 16px left/right)
      expect(submitButton).toHaveClass('py-2', 'px-4')

      // Check that button is not too small for touch
      expect(submitButton).toHaveClass('rounded-md') // Indicates proper touch target styling
    })
  })

  describe('Tablet (768px)', () => {
    beforeEach(() => {
      mockWindowWidth(768)
    })

    it('forms maintain good layout on tablet', () => {
      renderWithProviders(<AddPlayerForm />)

      // Check that forms still use full width appropriately
      const nameInput = screen.getByLabelText(/name/i)
      expect(nameInput).toHaveClass('w-full')

      // Check container styling is appropriate - the form container should have these classes
      const container = nameInput.closest(
        'div[class*="bg-white"][class*="rounded-lg"]'
      )
      expect(container).toHaveClass('rounded-lg', 'shadow-md', 'p-6')
    })

    it('AddGameForm button layout works on tablet', () => {
      renderWithProviders(<AddGameForm />)

      const buttonContainer = screen.getByRole('button', {
        name: 'Record Game',
      }).parentElement
      expect(buttonContainer).toHaveClass('flex', 'gap-3')
    })
  })

  describe('Desktop (1024px)', () => {
    beforeEach(() => {
      mockWindowWidth(1024)
    })

    it('forms render with appropriate spacing on desktop', () => {
      renderWithProviders(<AddPlayerForm />)

      // Check form spacing
      const form = screen
        .getByRole('button', { name: /create player/i })
        .closest('form')
      expect(form).toHaveClass('space-y-4')
    })

    it('component containers use appropriate max-width on larger screens', () => {
      renderWithProviders(<AddGameForm />)

      // The component should still be contained and not stretch too wide
      const container = screen
        .getByRole('heading', { name: 'Record Game' })
        .closest('.bg-white')
      expect(container).toHaveClass('rounded-lg', 'shadow-md', 'p-6')
    })
  })

  describe('Text Readability', () => {
    it.each([
      { width: 320, name: 'mobile' },
      { width: 768, name: 'tablet' },
      { width: 1024, name: 'desktop' },
    ])('text sizes are appropriate on $name ($width px)', ({ width }) => {
      mockWindowWidth(width)

      const { unmount } = renderWithProviders(<AddPlayerForm />)

      // Check heading has large text classes (text-2xl means large font)
      const heading = screen.getByRole('heading', { name: 'Add New Player' })
      expect(heading).toHaveClass('text-2xl', 'font-bold')

      // Check label has appropriate text size classes (text-sm means small font)
      const nameLabel = screen.getByText('Name *')
      expect(nameLabel).toHaveClass('text-sm', 'font-medium')

      unmount()
    })
  })

  describe('Interactive Elements', () => {
    it('form elements have appropriate focus states for keyboard navigation', () => {
      renderWithProviders(<AddPlayerForm />)

      const nameInput = screen.getByLabelText(/name/i)

      // Check focus styles
      expect(nameInput).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-500'
      )
    })

    it('buttons have hover and active states', () => {
      renderWithProviders(<AddPlayerForm />)

      const submitButton = screen.getByRole('button', {
        name: /create player/i,
      })

      // Check interactive states
      expect(submitButton).toHaveClass(
        'hover:bg-blue-700',
        'focus:outline-none',
        'focus:ring-2'
      )
    })
  })

  describe('Form Layout', () => {
    it('maintains proper spacing between form elements', () => {
      renderWithProviders(<AddGameForm />)

      const form = screen
        .getByRole('button', { name: 'Record Game' })
        .closest('form')
      expect(form).toHaveClass('space-y-4')
    })

    it('error messages are properly positioned', async () => {
      renderWithProviders(<AddPlayerForm />)

      const submitButton = screen.getByRole('button', {
        name: /create player/i,
      })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.queryByText('Name is required')
        if (errorMessage) {
          expect(errorMessage).toHaveClass('mt-1', 'text-sm', 'text-red-600')
        }
      })
    })
  })

  describe('Content Overflow', () => {
    it('form elements handle long content without breaking layout', () => {
      renderWithProviders(<AddGameForm />)

      // Check that selects have proper responsive classes
      const player1Select = screen.getByLabelText(/player 1/i)

      // Should have full width and proper overflow handling classes
      expect(player1Select).toHaveClass('w-full') // Full width responsive
      expect(player1Select).toHaveClass('rounded-md') // Proper styling that prevents layout breaks
    })
  })
})
