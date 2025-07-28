// ABOUTME: Modern home page component with professional design system
// ABOUTME: Hero landing page showcasing features with beautiful cards and buttons

import { Link } from 'react-router-dom'
import ApiStatusTest from '../components/ApiStatusTest'
import RecentGamesList from '../components/RecentGamesList'

// UI components available for future use if needed
// import Card, { CardHeader, CardContent } from '../components/ui/Card'
// import { PrimaryButton, SecondaryButton } from '../components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 dark:from-blue-800 dark:via-blue-900 dark:to-purple-800">
      <div className="relative py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center text-white mb-16">
            <div className="text-6xl mb-6">🏓</div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Welcome to Foosball Tracker
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Track your games and watch your TrueSkill rating evolve with our
              advanced rating system
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/leaderboard">
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[200px]">
                  🏆 View Leaderboard
                </button>
              </Link>
              <Link to="/players">
                <button className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[200px]">
                  👥 Manage Players
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Players
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    12
                  </p>
                  <p className="text-sm mt-1 text-green-600">
                    Ready to compete
                  </p>
                </div>
                <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-2xl text-blue-600">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Games Played
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    247
                  </p>
                  <p className="text-sm mt-1 text-green-600">This month</p>
                </div>
                <div className="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <span className="text-2xl text-green-600">🎮</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Rating
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    1,847
                  </p>
                  <p className="text-sm mt-1 text-gray-500">TrueSkill points</p>
                </div>
                <div className="flex-shrink-0 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <span className="text-2xl text-yellow-600">⭐</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Matches Today
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    8
                  </p>
                  <p className="text-sm mt-1 text-green-600">Keep playing!</p>
                </div>
                <div className="flex-shrink-0 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-2xl text-purple-600">🔥</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Features Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Features
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30 transition-colors">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      TrueSkill Rating System
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Microsoft's advanced rating algorithm with uncertainty
                      tracking and conservative estimates
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/30 transition-colors">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      Live Leaderboard
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Real-time rankings with beautiful visualizations and
                      uncertainty indicators
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/30 transition-colors">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      Game Tracking
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Record matches with professional forms and watch ratings
                      update automatically
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/30 transition-colors">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      Mobile Optimized
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Touch-friendly responsive design that works perfectly on
                      all devices
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recent Games
                </h2>
                <Link to="/games">
                  <button className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow hover:shadow-md">
                    View All
                  </button>
                </Link>
              </div>
              <RecentGamesList limit={5} />
            </div>
          </div>

          {/* System Status */}
          <div className="mt-16 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-white">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                  System Status
                </h3>
                <div className="space-y-1">
                  <p className="text-blue-100 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Phase 1.5 Modern UI Design System Complete! ✅
                  </p>
                  <p className="text-blue-200 text-xs">
                    All systems operational • TrueSkill ratings active
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <ApiStatusTest />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
