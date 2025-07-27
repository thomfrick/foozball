// ABOUTME: Home page component for the Foosball ELO Tracker
// ABOUTME: Landing page that shows basic app information and quick access

import { Link } from 'react-router-dom'
import ApiStatusTest from '../components/ApiStatusTest'
import RecentGamesList from '../components/RecentGamesList'

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 py-12 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Foosball Tracker
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Track your games and watch your TrueSkill rating evolve
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/leaderboard"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🏆 View Leaderboard
            </Link>
            <Link
              to="/players"
              className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              👥 Manage Players
            </Link>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Features Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-colors duration-200">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Features
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    TrueSkill Rating System
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Microsoft's advanced rating algorithm with uncertainty
                    tracking
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Live Leaderboard
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Real-time rankings with conservative rating calculations
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎮</span>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Game Tracking
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Record matches and watch ratings update automatically
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Mobile Friendly
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Responsive design for desktop and mobile devices
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-colors duration-200">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Recent Games
            </h2>
            <RecentGamesList limit={5} />
            <div className="mt-4 text-center">
              <Link
                to="/leaderboard"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                View Full History →
              </Link>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-white">
              <h3 className="font-semibold mb-1">System Status</h3>
              <p className="text-blue-100 text-sm">
                Phase 1.3 TrueSkill System Complete! ✅
              </p>
            </div>
            <div className="flex-shrink-0">
              <ApiStatusTest />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
