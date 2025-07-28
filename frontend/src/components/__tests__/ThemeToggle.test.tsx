// ABOUTME: Comprehensive tests for ThemeToggle component functionality and accessibility
// ABOUTME: Tests theme switching, icon animations, accessibility features, and visual states

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '../../contexts/ThemeContext'
import ThemeToggle from '../ThemeToggle'

// Mock localStorage and matchMedia for theme context
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }),
})

// Helper to render ThemeToggle with ThemeProvider
function renderThemeToggle(props = {}) {
  return render(
    <ThemeProvider>
      <ThemeToggle {...props} />
    </ThemeProvider>
  )
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    document.documentElement.classList.remove('dark')
  })

  describe('rendering', () => {
    it('should render toggle button with proper accessibility attributes', () => {
      renderThemeToggle()

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
      expect(button).toHaveAttribute('title', 'Switch to dark mode')
    })

    it('should show sun icon in light mode', () => {
      renderThemeToggle()

      const sunIcon = screen.getByRole('button').querySelector('svg')
      expect(sunIcon).toHaveClass('rotate-0', 'scale-100', 'opacity-100')
    })

    it('should update aria-label for dark mode', () => {
      localStorageMock.getItem.mockReturnValue('dark')
      renderThemeToggle()

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
      expect(button).toHaveAttribute('title', 'Switch to light mode')
    })

    it('should show moon icon in dark mode', () => {
      localStorageMock.getItem.mockReturnValue('dark')
      renderThemeToggle()

      const svgs = screen.getByRole('button').querySelectorAll('svg')
      const moonIcon = svgs[1] // Second SVG is the moon icon
      expect(moonIcon).toHaveClass('rotate-0', 'scale-100', 'opacity-100')
    })

    it('should apply custom className when provided', () => {
      renderThemeToggle({ className: 'custom-class' })

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('label display', () => {
    it('should not show label by default', () => {
      renderThemeToggle()

      expect(screen.queryByText('Dark mode')).not.toBeInTheDocument()
      expect(screen.queryByText('Light mode')).not.toBeInTheDocument()
    })

    it('should show label when showLabel is true', () => {
      renderThemeToggle({ showLabel: true })

      expect(screen.getByText('Dark mode')).toBeInTheDocument()
    })

    it('should update label text based on current theme', () => {
      localStorageMock.getItem.mockReturnValue('dark')
      renderThemeToggle({ showLabel: true })

      expect(screen.getByText('Light mode')).toBeInTheDocument()
      expect(screen.queryByText('Dark mode')).not.toBeInTheDocument()
    })
  })

  describe('theme switching', () => {
    it('should toggle theme when clicked', async () => {
      const user = userEvent.setup()
      renderThemeToggle()

      const button = screen.getByRole('button')

      // Initially in light mode
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')

      // Click to switch to dark mode
      await user.click(button)

      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should update icons when theme changes', async () => {
      const user = userEvent.setup()
      renderThemeToggle()

      const button = screen.getByRole('button')
      const svgs = button.querySelectorAll('svg')
      const sunIcon = svgs[0]
      const moonIcon = svgs[1]

      // Initially sun icon is visible
      expect(sunIcon).toHaveClass('rotate-0', 'scale-100', 'opacity-100')
      expect(moonIcon).toHaveClass('-rotate-90', 'scale-0', 'opacity-0')

      // Click to switch to dark mode
      await user.click(button)

      // Now moon icon should be visible
      expect(sunIcon).toHaveClass('rotate-90', 'scale-0', 'opacity-0')
      expect(moonIcon).toHaveClass('rotate-0', 'scale-100', 'opacity-100')
    })

    it('should update label when theme changes and showLabel is true', async () => {
      const user = userEvent.setup()
      renderThemeToggle({ showLabel: true })

      // Initially shows "Dark mode"
      expect(screen.getByText('Dark mode')).toBeInTheDocument()

      // Click to switch to dark mode
      await user.click(screen.getByRole('button'))

      // Now shows "Light mode"
      expect(screen.getByText('Light mode')).toBeInTheDocument()
      expect(screen.queryByText('Dark mode')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      renderThemeToggle()

      const button = screen.getByRole('button')

      // Should be focusable
      await user.tab()
      expect(button).toHaveFocus()

      // Should activate with Enter key
      await user.keyboard('{Enter}')
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    })

    it('should activate with Space key', async () => {
      const user = userEvent.setup()
      renderThemeToggle()

      const button = screen.getByRole('button')
      button.focus()

      await user.keyboard(' ')
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    })

    it('should have proper focus styles', () => {
      renderThemeToggle()

      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-500'
      )
    })

    it('should have proper button role and type', () => {
      renderThemeToggle()

      const button = screen.getByRole('button')
      expect(button.tagName).toBe('BUTTON')
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  describe('visual states', () => {
    it('should have proper base styling classes', () => {
      renderThemeToggle()

      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'relative',
        'inline-flex',
        'items-center',
        'justify-center',
        'w-10',
        'h-10',
        'rounded-lg'
      )
    })

    it('should have hover state classes', () => {
      renderThemeToggle()

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-gray-200', 'dark:hover:bg-gray-700')
    })

    it('should have transition classes for smooth animations', () => {
      renderThemeToggle()

      const button = screen.getByRole('button')
      expect(button).toHaveClass('transition-all', 'duration-200')
    })

    it('should have proper icon container dimensions', () => {
      renderThemeToggle()

      const iconContainer = screen
        .getByRole('button')
        .querySelector('.relative.w-5.h-5')
      expect(iconContainer).toBeInTheDocument()
      expect(iconContainer).toHaveClass('relative', 'w-5', 'h-5')
    })

    it('should have animation classes on icons', () => {
      renderThemeToggle()

      const svgs = screen.getByRole('button').querySelectorAll('svg')

      svgs.forEach((svg) => {
        expect(svg).toHaveClass('transition-all', 'duration-300', 'transform')
      })
    })
  })

  describe('dark mode specific styling', () => {
    it('should have dark mode background classes', () => {
      renderThemeToggle()

      const button = screen.getByRole('button')
      expect(button).toHaveClass('dark:bg-gray-800', 'dark:text-gray-200')
    })

    it('should have dark mode focus ring offset', () => {
      renderThemeToggle()

      const button = screen.getByRole('button')
      expect(button).toHaveClass('dark:focus:ring-offset-gray-800')
    })
  })

  describe('integration with theme context', () => {
    it('should respond to external theme changes', async () => {
      // Start with light theme
      renderThemeToggle()

      const user = userEvent.setup()
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')

      // Toggle to dark theme by clicking
      await user.click(button)

      // Now it should say switch to light mode
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    })
  })
})
