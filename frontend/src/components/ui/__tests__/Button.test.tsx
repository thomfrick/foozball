// ABOUTME: Comprehensive tests for Button component system with all variants and states
// ABOUTME: Tests button behavior, loading states, accessibility, and specialized button components

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button, {
  DangerButton,
  GhostButton,
  IconButton,
  OutlineButton,
  PrimaryButton,
  SecondaryButton,
  SuccessButton,
} from '../Button'

// Mock LoadingSpinner component
vi.mock('../../LoadingSpinner', () => ({
  default: ({ size, className }: { size: string; className: string }) => (
    <div data-testid="loading-spinner" data-size={size} className={className}>
      Loading...
    </div>
  ),
}))

describe('Button', () => {
  describe('rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>)

      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center'
      )
    })

    it('should render children correctly', () => {
      render(<Button>Test Button</Button>)

      expect(screen.getByText('Test Button')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should pass through HTML button props', () => {
      const onClickMock = vi.fn()
      render(
        <Button
          id="test-button"
          data-testid="custom-button"
          onClick={onClickMock}
        >
          Button
        </Button>
      )

      const button = screen.getByTestId('custom-button')
      expect(button).toHaveAttribute('id', 'test-button')
    })
  })

  describe('variants', () => {
    it('should apply primary variant styles by default', () => {
      render(<Button>Primary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'bg-primary-600',
        'text-white',
        'font-semibold'
      )
    })

    it('should apply secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'bg-neutral-0',
        'text-primary-600',
        'border-primary-600'
      )
    })

    it('should apply success variant styles', () => {
      render(<Button variant="success">Success</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-success-600', 'text-white')
    })

    it('should apply danger variant styles', () => {
      render(<Button variant="danger">Danger</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-danger-600', 'text-white')
    })

    it('should apply outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent', 'border-neutral-300')
    })

    it('should apply ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent', 'border-transparent')
    })
  })

  describe('sizes', () => {
    it('should apply medium size by default', () => {
      render(<Button>Medium</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-6', 'py-3', 'text-base', 'min-h-[44px]')
    })

    it('should apply small size', () => {
      render(<Button size="sm">Small</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-3', 'py-2', 'text-sm', 'min-h-[36px]')
    })

    it('should apply large size', () => {
      render(<Button size="lg">Large</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-8', 'py-4', 'text-lg', 'min-h-[52px]')
    })
  })

  describe('loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<Button isLoading>Loading Button</Button>)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByText('Loading Button')).toBeInTheDocument()
    })

    it('should show loading text when provided', () => {
      render(
        <Button isLoading loadingText="Please wait...">
          Submit
        </Button>
      )

      expect(screen.getByText('Please wait...')).toBeInTheDocument()
      expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    })

    it('should disable button when loading', () => {
      render(<Button isLoading>Loading</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should pass correct size to loading spinner', () => {
      render(
        <Button isLoading size="lg">
          Loading
        </Button>
      )

      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveAttribute('data-size', 'lg')
    })

    it('should hide left icon when loading', () => {
      const leftIcon = <span data-testid="left-icon">←</span>
      render(
        <Button isLoading leftIcon={leftIcon}>
          Loading
        </Button>
      )

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should hide right icon when loading', () => {
      const rightIcon = <span data-testid="right-icon">→</span>
      render(
        <Button isLoading rightIcon={rightIcon}>
          Loading
        </Button>
      )

      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  describe('icons', () => {
    it('should render left icon', () => {
      const leftIcon = <span data-testid="left-icon">←</span>
      render(<Button leftIcon={leftIcon}>With Left Icon</Button>)

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByText('With Left Icon')).toBeInTheDocument()
    })

    it('should render right icon', () => {
      const rightIcon = <span data-testid="right-icon">→</span>
      render(<Button rightIcon={rightIcon}>With Right Icon</Button>)

      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      expect(screen.getByText('With Right Icon')).toBeInTheDocument()
    })

    it('should render both left and right icons', () => {
      const leftIcon = <span data-testid="left-icon">←</span>
      const rightIcon = <span data-testid="right-icon">→</span>
      render(
        <Button leftIcon={leftIcon} rightIcon={rightIcon}>
          Both Icons
        </Button>
      )

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass(
        'disabled:opacity-50',
        'disabled:cursor-not-allowed'
      )
    })

    it('should not trigger onClick when disabled', async () => {
      const user = userEvent.setup()
      const onClickMock = vi.fn()

      render(
        <Button disabled onClick={onClickMock}>
          Disabled
        </Button>
      )

      await user.click(screen.getByRole('button'))
      expect(onClickMock).not.toHaveBeenCalled()
    })
  })

  describe('fullWidth', () => {
    it('should apply full width class when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-full')
    })

    it('should not apply full width class by default', () => {
      render(<Button>Normal Width</Button>)

      const button = screen.getByRole('button')
      expect(button).not.toHaveClass('w-full')
    })
  })

  describe('interactions', () => {
    it('should handle click events', async () => {
      const user = userEvent.setup()
      const onClickMock = vi.fn()

      render(<Button onClick={onClickMock}>Clickable</Button>)

      await user.click(screen.getByRole('button'))
      expect(onClickMock).toHaveBeenCalledTimes(1)
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      const onClickMock = vi.fn()

      render(<Button onClick={onClickMock}>Keyboard Button</Button>)

      const button = screen.getByRole('button')
      await user.tab()
      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(onClickMock).toHaveBeenCalledTimes(1)
    })

    it('should handle Space key activation', async () => {
      const user = userEvent.setup()
      const onClickMock = vi.fn()

      render(<Button onClick={onClickMock}>Space Button</Button>)

      const button = screen.getByRole('button')
      button.focus()

      await user.keyboard(' ')
      expect(onClickMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    it('should have proper button role', () => {
      render(<Button>Accessible Button</Button>)

      const button = screen.getByRole('button')
      expect(button.tagName).toBe('BUTTON')
    })

    it('should have focus styles', () => {
      render(<Button>Focus Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus:outline-none', 'focus:scale-105')
    })

    it('should have proper aria attributes when disabled', () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })
  })
})

describe('Specialized Button Components', () => {
  describe('PrimaryButton', () => {
    it('should render with primary variant', () => {
      render(<PrimaryButton>Primary</PrimaryButton>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary-600')
    })
  })

  describe('SecondaryButton', () => {
    it('should render with secondary variant', () => {
      render(<SecondaryButton>Secondary</SecondaryButton>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-neutral-0')
    })
  })

  describe('SuccessButton', () => {
    it('should render with success variant', () => {
      render(<SuccessButton>Success</SuccessButton>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-success-600')
    })
  })

  describe('DangerButton', () => {
    it('should render with danger variant', () => {
      render(<DangerButton>Danger</DangerButton>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-danger-600')
    })
  })

  describe('OutlineButton', () => {
    it('should render with outline variant', () => {
      render(<OutlineButton>Outline</OutlineButton>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent', 'border-neutral-300')
    })
  })

  describe('GhostButton', () => {
    it('should render with ghost variant', () => {
      render(<GhostButton>Ghost</GhostButton>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent', 'border-transparent')
    })
  })

  describe('IconButton', () => {
    it('should render with icon only', () => {
      const icon = <span data-testid="icon">★</span>
      render(<IconButton icon={icon} aria-label="Star button" />)

      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByLabelText('Star button')).toBeInTheDocument()
    })

    it('should have proper aria-label', () => {
      const icon = <span>⚠️</span>
      render(<IconButton icon={icon} aria-label="Warning button" />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Warning button')
    })

    it('should apply custom padding for icon button', () => {
      const icon = <span>✓</span>
      render(
        <IconButton icon={icon} aria-label="Check" className="test-class" />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('!px-3', 'test-class')
    })
  })
})

describe('Button Complex Scenarios', () => {
  it('should handle all props together', () => {
    const leftIcon = <span data-testid="left">←</span>
    const rightIcon = <span data-testid="right">→</span>
    const onClickMock = vi.fn()

    render(
      <Button
        variant="success"
        size="lg"
        fullWidth
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        onClick={onClickMock}
        className="custom-class"
        data-testid="complex-button"
      >
        Complex Button
      </Button>
    )

    const button = screen.getByTestId('complex-button')
    expect(button).toHaveClass(
      'bg-success-600',
      'px-8',
      'py-4',
      'text-lg',
      'w-full',
      'custom-class'
    )
    expect(screen.getByTestId('left')).toBeInTheDocument()
    expect(screen.getByTestId('right')).toBeInTheDocument()
    expect(screen.getByText('Complex Button')).toBeInTheDocument()
  })

  it('should prioritize loading state over disabled', () => {
    render(
      <Button isLoading disabled>
        Loading and Disabled
      </Button>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('should truncate long text', () => {
    render(
      <Button>
        This is a very long button text that should be truncated if it exceeds
        the container width
      </Button>
    )

    const textSpan = screen.getByText(/This is a very long button text/)
    expect(textSpan).toHaveClass('truncate')
  })
})
