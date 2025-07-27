// ABOUTME: Theme toggle button component for switching between light and dark modes
// ABOUTME: Provides accessible theme switching with proper icons and animations

import { useTheme } from '../contexts/ThemeContext'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export default function ThemeToggle({
  className = '',
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        transition-all duration-200
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon for light mode */}
        <svg
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 transform
            ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}
          `}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>

        {/* Moon icon for dark mode */}
        <svg
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 transform
            ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
          `}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </div>

      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {theme === 'light' ? 'Dark' : 'Light'} mode
        </span>
      )}
    </button>
  )
}
