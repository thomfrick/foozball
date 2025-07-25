// ABOUTME: Players page component for viewing all players
// ABOUTME: Will eventually show the list of players and their ratings

import { Link } from 'react-router-dom'

export default function PlayersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Players</h1>
          <p className="text-gray-600 mb-6">
            This page will show the list of all players and their ratings.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              🚧 Coming soon: Player list will be implemented in Phase 1.1.F
            </p>
          </div>
          <Link
            to="/"
            className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
