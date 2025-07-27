// ABOUTME: Main layout component providing consistent navigation and structure
// ABOUTME: Wraps all pages with header navigation, main content area, and footer

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const navLinkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive(path)
        ? 'bg-white text-blue-600'
        : 'text-white hover:bg-blue-700 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      {/* Header Navigation */}
      <header
        className="bg-blue-600 dark:bg-blue-800 shadow-lg transition-colors duration-200"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <Link
              to="/"
              className="flex items-center space-x-2 text-white font-bold text-xl hover:text-blue-200 transition-colors"
            >
              <span>🏓</span>
              <span>Foosball Tracker</span>
            </Link>

            {/* Navigation Links */}
            <nav
              className="hidden md:flex space-x-4"
              role="navigation"
              aria-label="Main navigation"
            >
              <Link to="/" className={navLinkClass('/')}>
                Home
              </Link>
              <Link to="/leaderboard" className={navLinkClass('/leaderboard')}>
                🏆 Leaderboard
              </Link>
              <Link to="/players" className={navLinkClass('/players')}>
                👥 Players
              </Link>
              <Link to="/about" className={navLinkClass('/about')}>
                ℹ️ About
              </Link>
            </nav>

            {/* Theme Toggle & Mobile Menu */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-white hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 rounded-md"
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Toggle navigation menu"
                >
                  <svg
                    className="h-6 w-6"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <nav
              className="md:hidden"
              id="mobile-menu"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-blue-700">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive('/')
                      ? 'bg-white text-blue-600'
                      : 'text-white hover:bg-blue-700'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/leaderboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive('/leaderboard')
                      ? 'bg-white text-blue-600'
                      : 'text-white hover:bg-blue-700'
                  }`}
                >
                  🏆 Leaderboard
                </Link>
                <Link
                  to="/players"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive('/players')
                      ? 'bg-white text-blue-600'
                      : 'text-white hover:bg-blue-700'
                  }`}
                >
                  👥 Players
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive('/about')
                      ? 'bg-white text-blue-600'
                      : 'text-white hover:bg-blue-700'
                  }`}
                >
                  ℹ️ About
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1" role="main">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="bg-gray-800 dark:bg-gray-950 text-white py-8 transition-colors duration-200"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                🏓 Foosball Tracker
              </h3>
              <p className="text-gray-400 text-sm">
                Track your foosball games and skill progression with TrueSkill
                ratings.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/leaderboard"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/players"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Players
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
              </ul>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Status</h3>
              <p className="text-gray-400 text-sm">
                Phase 1.3 TrueSkill System Complete! ✅
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Now implementing Phase 1.4 UI/UX enhancements.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Foosball Tracker. Built with React, FastAPI, and
              TrueSkill.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
