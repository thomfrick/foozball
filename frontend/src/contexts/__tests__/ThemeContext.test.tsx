// ABOUTME: Comprehensive tests for ThemeContext functionality and state management
// ABOUTME: Tests theme persistence, system preference detection, and context behavior

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '../ThemeContext'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock matchMedia
const matchMediaMock = vi.fn()
Object.defineProperty(window, 'matchMedia', {
  value: matchMediaMock,
  writable: true,
})

// Test component that uses the theme context
function TestComponent() {
  const { theme, toggleTheme, setTheme } = useTheme()

  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    // Clear any existing classes on document
    document.documentElement.classList.remove('dark')
  })

  describe('initialization', () => {
    it('should default to light theme when no stored preference or system preference', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should use defaultTheme prop when provided', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should use stored theme preference from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('dark')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should respect system dark mode preference when no stored preference', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should prioritize stored preference over system preference', () => {
      localStorageMock.getItem.mockReturnValue('light')
      matchMediaMock.mockReturnValue({
        matches: true, // System prefers dark
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('theme switching', () => {
    it('should toggle between light and dark themes', async () => {
      const user = userEvent.setup()

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Initially light
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')

      // Toggle to dark
      await user.click(screen.getByTestId('toggle-theme'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      // Toggle back to light
      await user.click(screen.getByTestId('toggle-theme'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should set specific theme using setTheme', async () => {
      const user = userEvent.setup()

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Set to dark
      await user.click(screen.getByTestId('set-dark'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      // Set to light
      await user.click(screen.getByTestId('set-light'))
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('persistence', () => {
    it('should save theme to localStorage when changed', async () => {
      const user = userEvent.setup()

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await user.click(screen.getByTestId('toggle-theme'))

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'foosball-theme',
          'dark'
        )
      })
    })

    it('should save initial theme to localStorage', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      )

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'foosball-theme',
        'dark'
      )
    })
  })

  describe('system preference changes', () => {
    it('should listen for system theme changes', () => {
      const addEventListenerSpy = vi.fn()
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: addEventListenerSpy,
        removeEventListener: vi.fn(),
      })

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })

    it('should update theme when system preference changes and no stored preference exists', () => {
      let changeHandler: ((e: MediaQueryListEvent) => void) | undefined
      const addEventListenerSpy = vi.fn((event, handler) => {
        if (event === 'change') {
          changeHandler = handler
        }
      })

      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: addEventListenerSpy,
        removeEventListener: vi.fn(),
      })

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Simulate system preference change to dark
      act(() => {
        changeHandler?.({ matches: true } as MediaQueryListEvent)
      })

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    it('should not update theme when system preference changes but stored preference exists', () => {
      localStorageMock.getItem.mockReturnValue('light')

      let changeHandler: ((e: MediaQueryListEvent) => void) | undefined
      const addEventListenerSpy = vi.fn((event, handler) => {
        if (event === 'change') {
          changeHandler = handler
        }
      })

      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: addEventListenerSpy,
        removeEventListener: vi.fn(),
      })

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Simulate system preference change to dark
      act(() => {
        changeHandler?.({ matches: true } as MediaQueryListEvent)
      })

      // Should remain light because of stored preference
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })

    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.fn()
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerSpy,
      })

      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })
  })

  describe('error handling', () => {
    it('should throw error when useTheme is used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useTheme must be used within a ThemeProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('invalid stored values', () => {
    it('should ignore invalid stored theme values', () => {
      localStorageMock.getItem.mockReturnValue('invalid-theme')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })
  })
})
