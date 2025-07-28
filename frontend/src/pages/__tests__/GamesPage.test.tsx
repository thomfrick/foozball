// ABOUTME: Comprehensive tests for GamesPage component with form toggling and integration
// ABOUTME: Tests page rendering, form interactions, game submission, and component integration

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GamesPage from '../GamesPage'

// Mock the child components
vi.mock('../../components/AddGameForm', () => ({
  default: ({
    onSuccess,
    onCancel,
  }: {
    onSuccess: () => void
    onCancel: () => void
  }) => (
    <div data-testid="add-game-form">
      <button data-testid="form-success" onClick={onSuccess}>
        Submit Game
      </button>
      <button data-testid="form-cancel" onClick={onCancel}>
        Cancel Form
      </button>
    </div>
  ),
}))

vi.mock('../../components/RecentGamesList', () => ({
  default: ({
    showPagination,
    limit,
  }: {
    showPagination: boolean
    limit: number
  }) => (
    <div
      data-testid="recent-games-list"
      data-pagination={showPagination}
      data-limit={limit}
    >
      Recent Games List
    </div>
  ),
}))

vi.mock('../../components/ui/Button', () => ({
  PrimaryButton: ({
    children,
    onClick,
    className,
    ...props
  }: React.ComponentProps<'button'>) => (
    <button
      data-testid="primary-button"
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
  SecondaryButton: ({
    children,
    onClick,
    className,
    ...props
  }: React.ComponentProps<'button'>) => (
    <button
      data-testid="secondary-button"
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}))

function renderGamesPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <GamesPage />
    </QueryClientProvider>
  )
}

describe('GamesPage', () => {
  describe('rendering', () => {
    it('should render the page header', () => {
      renderGamesPage()

      expect(
        screen.getByRole('heading', { level: 1, name: 'Games' })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Record new games and view match history')
      ).toBeInTheDocument()
    })

    it('should render the Record New Game button initially', () => {
      renderGamesPage()

      const recordButton = screen.getByTestId('primary-button')
      expect(recordButton).toBeInTheDocument()
      expect(recordButton).toHaveTextContent('🎮 Record New Game')
    })

    it('should render the RecentGamesList component', () => {
      renderGamesPage()

      const gamesList = screen.getByTestId('recent-games-list')
      expect(gamesList).toBeInTheDocument()
      expect(gamesList).toHaveAttribute('data-pagination', 'true')
      expect(gamesList).toHaveAttribute('data-limit', '20')
    })

    it('should not show the add game form initially', () => {
      renderGamesPage()

      expect(screen.queryByTestId('add-game-form')).not.toBeInTheDocument()
      expect(screen.queryByText('Record New Game')).not.toBeInTheDocument()
    })

    it('should have proper responsive layout classes', () => {
      renderGamesPage()

      const container = screen.getByText('Games').closest('.max-w-7xl')
      expect(container).toHaveClass(
        'max-w-7xl',
        'mx-auto',
        'px-4',
        'sm:px-6',
        'lg:px-8'
      )
    })

    it('should have proper dark mode classes', () => {
      renderGamesPage()

      const background = screen.getByText('Games').closest('.min-h-screen')
      expect(background).toHaveClass('bg-gray-50', 'dark:bg-gray-900')
    })
  })

  describe('form toggling', () => {
    it('should show add game form when Record New Game button is clicked', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Initially form is not visible
      expect(screen.queryByTestId('add-game-form')).not.toBeInTheDocument()

      // Click the Record New Game button
      await user.click(screen.getByTestId('primary-button'))

      // Form should now be visible
      expect(screen.getByTestId('add-game-form')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { level: 2, name: 'Record New Game' })
      ).toBeInTheDocument()
    })

    it('should hide Record New Game button when form is shown', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Click to show form
      await user.click(screen.getByTestId('primary-button'))

      // Record New Game button should be hidden
      expect(screen.queryByText('🎮 Record New Game')).not.toBeInTheDocument()
    })

    it('should show cancel button when form is displayed', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Click to show form
      await user.click(screen.getByTestId('primary-button'))

      // Cancel button should be visible
      const cancelButton = screen.getByTestId('secondary-button')
      expect(cancelButton).toBeInTheDocument()
      expect(cancelButton).toHaveTextContent('Cancel')
    })

    it('should hide form when cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Show form
      await user.click(screen.getByTestId('primary-button'))
      expect(screen.getByTestId('add-game-form')).toBeInTheDocument()

      // Click cancel
      await user.click(screen.getByTestId('secondary-button'))

      // Form should be hidden
      expect(screen.queryByTestId('add-game-form')).not.toBeInTheDocument()
      expect(screen.getByText('🎮 Record New Game')).toBeInTheDocument()
    })

    it('should hide form when form cancel is triggered', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Show form
      await user.click(screen.getByTestId('primary-button'))
      expect(screen.getByTestId('add-game-form')).toBeInTheDocument()

      // Trigger form cancel
      await user.click(screen.getByTestId('form-cancel'))

      // Form should be hidden
      expect(screen.queryByTestId('add-game-form')).not.toBeInTheDocument()
      expect(screen.getByText('🎮 Record New Game')).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should hide form when game is successfully submitted', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Show form
      await user.click(screen.getByTestId('primary-button'))
      expect(screen.getByTestId('add-game-form')).toBeInTheDocument()

      // Submit game
      await user.click(screen.getByTestId('form-success'))

      // Form should be hidden
      await waitFor(() => {
        expect(screen.queryByTestId('add-game-form')).not.toBeInTheDocument()
      })
      expect(screen.getByText('🎮 Record New Game')).toBeInTheDocument()
    })

    it('should reset to initial state after successful submission', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Show form and submit
      await user.click(screen.getByTestId('primary-button'))
      await user.click(screen.getByTestId('form-success'))

      // Should be back to initial state
      await waitFor(() => {
        expect(screen.queryByTestId('add-game-form')).not.toBeInTheDocument()
        expect(screen.getByText('🎮 Record New Game')).toBeInTheDocument()
        expect(screen.getByTestId('recent-games-list')).toBeInTheDocument()
      })
    })
  })

  describe('form container styling', () => {
    it('should have proper form container styling', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Show form
      await user.click(screen.getByTestId('primary-button'))

      // Check form container styling
      const formContainer = screen
        .getByRole('heading', { level: 2 })
        .closest('.bg-white')
      expect(formContainer).toHaveClass(
        'bg-white',
        'dark:bg-gray-800',
        'rounded-lg',
        'shadow-lg',
        'p-6'
      )
    })

    it('should have proper form header layout', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Show form
      await user.click(screen.getByTestId('primary-button'))

      // Check header layout
      const formHeader = screen
        .getByRole('heading', { level: 2 })
        .closest('.flex')
      expect(formHeader).toHaveClass(
        'flex',
        'items-center',
        'justify-between',
        'mb-6'
      )
    })
  })

  describe('responsive design', () => {
    it('should have responsive button width', () => {
      renderGamesPage()

      const recordButton = screen.getByTestId('primary-button')
      expect(recordButton).toHaveClass('w-full', 'sm:w-auto')
    })

    it('should have responsive header layout', () => {
      renderGamesPage()

      const headerContainer = screen.getByText('Games').closest('.flex')
      expect(headerContainer).toHaveClass(
        'flex',
        'flex-col',
        'sm:flex-row',
        'sm:items-center',
        'sm:justify-between'
      )
    })

    it('should have responsive margin for button container', () => {
      renderGamesPage()

      const buttonContainer = screen
        .getByTestId('primary-button')
        .closest('.mt-4')
      expect(buttonContainer).toHaveClass('mt-4', 'sm:mt-0')
    })
  })

  describe('accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Main heading
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Games'
      )

      // Show form to test form heading
      await user.click(screen.getByTestId('primary-button'))
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Record New Game'
      )
    })

    it('should have descriptive text for the page', () => {
      renderGamesPage()

      expect(
        screen.getByText('Record new games and view match history')
      ).toBeInTheDocument()
    })

    it('should have proper button labels', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Initial record button
      expect(screen.getByText('🎮 Record New Game')).toBeInTheDocument()

      // Show form to test cancel button
      await user.click(screen.getByTestId('primary-button'))
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Tab to the record button
      await user.tab()
      expect(screen.getByTestId('primary-button')).toHaveFocus()

      // Activate with Enter
      await user.keyboard('{Enter}')
      expect(screen.getByTestId('add-game-form')).toBeInTheDocument()

      // Tab to cancel button
      await user.tab()
      expect(screen.getByTestId('secondary-button')).toHaveFocus()
    })
  })

  describe('integration with child components', () => {
    it('should pass correct props to RecentGamesList', () => {
      renderGamesPage()

      const gamesList = screen.getByTestId('recent-games-list')
      expect(gamesList).toHaveAttribute('data-pagination', 'true')
      expect(gamesList).toHaveAttribute('data-limit', '20')
    })

    it('should pass onSuccess and onCancel to AddGameForm', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Show form
      await user.click(screen.getByTestId('primary-button'))

      // Verify form receives callbacks
      expect(screen.getByTestId('form-success')).toBeInTheDocument()
      expect(screen.getByTestId('form-cancel')).toBeInTheDocument()
    })

    it('should handle AddGameForm success callback', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Show form and trigger success
      await user.click(screen.getByTestId('primary-button'))
      await user.click(screen.getByTestId('form-success'))

      // Form should be hidden
      await waitFor(() => {
        expect(screen.queryByTestId('add-game-form')).not.toBeInTheDocument()
      })
    })

    it('should handle AddGameForm cancel callback', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Show form and trigger cancel
      await user.click(screen.getByTestId('primary-button'))
      await user.click(screen.getByTestId('form-cancel'))

      // Form should be hidden
      expect(screen.queryByTestId('add-game-form')).not.toBeInTheDocument()
    })
  })

  describe('layout and spacing', () => {
    it('should have proper page spacing', () => {
      renderGamesPage()

      const pageContainer = screen.getByText('Games').closest('.py-8')
      expect(pageContainer).toHaveClass('min-h-screen', 'py-8')
    })

    it('should have proper section spacing', async () => {
      const user = userEvent.setup()
      renderGamesPage()

      // Header section
      const headerSection = screen.getByText('Games').closest('.mb-8')
      expect(headerSection).toHaveClass('mb-8')

      // Show form to test form section spacing
      await user.click(screen.getByTestId('primary-button'))
      const formSection = screen.getByTestId('add-game-form').closest('.mb-8')
      expect(formSection).toHaveClass('mb-8')

      // Games list section
      const gamesSection = screen
        .getByTestId('recent-games-list')
        .closest('.space-y-6')
      expect(gamesSection).toHaveClass('space-y-6')
    })

    it('should have proper text spacing', () => {
      renderGamesPage()

      const subtitle = screen.getByText(
        'Record new games and view match history'
      )
      expect(subtitle).toHaveClass('mt-2')
    })
  })
})
