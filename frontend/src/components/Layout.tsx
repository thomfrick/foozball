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
    `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
      isActive(path)
        ? 'bg-neutral-0 text-primary-600 shadow-sm'
        : 'text-white hover:bg-primary-700 hover:text-white hover:shadow-md'
    }`

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      {/* Header Navigation */}
      <header
        className="bg-primary-600 dark:bg-primary-700 shadow-large transition-colors duration-200"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <Link
              to="/"
              className="flex items-center space-x-3 text-white font-bold text-xl hover:text-primary-100 transition-all duration-200 transform hover:scale-105"
            >
              <span className="text-2xl">🏓</span>
              <span className="font-extrabold tracking-tight">
                Foosball Tracker
              </span>
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
              <Link to="/teams" className={navLinkClass('/teams')}>
                👥 Teams
              </Link>
              <Link to="/games" className={navLinkClass('/games')}>
                🎮 Games
              </Link>
              <Link to="/team-games" className={navLinkClass('/team-games')}>
                🤝 Team Games
              </Link>
              <Link to="/analytics" className={navLinkClass('/analytics')}>
                📊 Analytics
              </Link>
              <Link to="/players" className={navLinkClass('/players')}>
                🧑‍🤝‍🧑 Players
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
                  className="text-white hover:text-primary-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 rounded-lg p-2 transition-all duration-200 transform hover:scale-105"
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
              <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3 border-t border-primary-700">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive('/')
                      ? 'bg-neutral-0 text-primary-600 shadow-sm'
                      : 'text-white hover:bg-primary-700 hover:shadow-md'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/leaderboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive('/leaderboard')
                      ? 'bg-neutral-0 text-primary-600 shadow-sm'
                      : 'text-white hover:bg-primary-700 hover:shadow-md'
                  }`}
                >
                  🏆 Leaderboard
                </Link>
                <Link
                  to="/teams"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive('/teams')
                      ? 'bg-neutral-0 text-primary-600 shadow-sm'
                      : 'text-white hover:bg-primary-700 hover:shadow-md'
                  }`}
                >
                  👥 Teams
                </Link>
                <Link
                  to="/games"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive('/games')
                      ? 'bg-neutral-0 text-primary-600 shadow-sm'
                      : 'text-white hover:bg-primary-700 hover:shadow-md'
                  }`}
                >
                  🎮 Games
                </Link>
                <Link
                  to="/team-games"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive('/team-games')
                      ? 'bg-neutral-0 text-primary-600 shadow-sm'
                      : 'text-white hover:bg-primary-700 hover:shadow-md'
                  }`}
                >
                  🤝 Team Games
                </Link>
                <Link
                  to="/analytics"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive('/analytics')
                      ? 'bg-neutral-0 text-primary-600 shadow-sm'
                      : 'text-white hover:bg-primary-700 hover:shadow-md'
                  }`}
                >
                  📊 Analytics
                </Link>
                <Link
                  to="/players"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive('/players')
                      ? 'bg-neutral-0 text-primary-600 shadow-sm'
                      : 'text-white hover:bg-primary-700 hover:shadow-md'
                  }`}
                >
                  🧑‍🤝‍🧑 Players
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive('/about')
                      ? 'bg-neutral-0 text-primary-600 shadow-sm'
                      : 'text-white hover:bg-primary-700 hover:shadow-md'
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
      <main
        className="flex-1 bg-neutral-50 dark:bg-dark-background"
        role="main"
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        className="bg-neutral-800 dark:bg-dark-background text-white py-8 transition-colors duration-200 border-t border-neutral-200 dark:border-dark-border"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-xl">🏓</span>
                <span>Foosball Tracker</span>
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Track your foosball games and skill progression with TrueSkill
                ratings.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/leaderboard"
                    className="text-neutral-400 hover:text-primary-300 transition-colors duration-200 flex items-center gap-2"
                  >
                    <span>🏆</span>
                    <span>Leaderboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/teams"
                    className="text-neutral-400 hover:text-primary-300 transition-colors duration-200 flex items-center gap-2"
                  >
                    <span>👥</span>
                    <span>Teams</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/games"
                    className="text-neutral-400 hover:text-primary-300 transition-colors duration-200 flex items-center gap-2"
                  >
                    <span>🎮</span>
                    <span>Games</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/team-games"
                    className="text-neutral-400 hover:text-primary-300 transition-colors duration-200 flex items-center gap-2"
                  >
                    <span>🤝</span>
                    <span>Team Games</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/analytics"
                    className="text-neutral-400 hover:text-primary-300 transition-colors duration-200 flex items-center gap-2"
                  >
                    <span>📊</span>
                    <span>Analytics</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/players"
                    className="text-neutral-400 hover:text-primary-300 transition-colors duration-200 flex items-center gap-2"
                  >
                    <span>🧑‍🤝‍🧑</span>
                    <span>Players</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-neutral-400 hover:text-primary-300 transition-colors duration-200 flex items-center gap-2"
                  >
                    <span>ℹ️</span>
                    <span>About</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-lg font-bold mb-4">Status</h3>
              <div className="space-y-2">
                <p className="text-success-400 text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-success-400 rounded-full"></span>
                  Phase 1.4 Complete!
                </p>
                <p className="text-primary-400 text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></span>
                  Phase 1.5 Modern UI System
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-700 dark:border-dark-border mt-8 pt-6 text-center">
            <p className="text-neutral-400 text-sm">
              © 2025 Foosball Tracker. Built with React, FastAPI, and
              TrueSkill.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
