// ABOUTME: Home page component for the Foosball ELO Tracker
// ABOUTME: Landing page that shows basic app information and navigation

import { Link } from 'react-router-dom'
import ApiStatusTest from '../components/ApiStatusTest'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center py-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full mx-4 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          🏓 Foosball ELO Tracker
        </h1>

        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Track your foosball games and see your skill progression with
            TrueSkill ratings!
          </p>

          <div className="space-y-2">
            <Link
              to="/leaderboard"
              className="block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              🏆 Leaderboard
            </Link>
            <Link
              to="/players"
              className="block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              👥 View Players
            </Link>
            <Link
              to="/about"
              className="block bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              ℹ️ About
            </Link>
          </div>
        </div>

        <ApiStatusTest />

        <p className="text-sm text-gray-500 text-center">
          Phase 1.3 TrueSkill System Complete! ✅
        </p>
      </div>
    </div>
  )
}
