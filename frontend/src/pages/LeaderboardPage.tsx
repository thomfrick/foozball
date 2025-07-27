// ABOUTME: Leaderboard page displaying TrueSkill rankings and statistics
// ABOUTME: Main page for viewing player rankings and competitive analysis

import React from 'react'
import Leaderboard from '../components/Leaderboard'

export default function LeaderboardPage() {
  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="mt-2 text-gray-600">
            Player rankings based on TrueSkill rating system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main leaderboard */}
          <div className="lg:col-span-2">
            <Leaderboard limit={20} />
          </div>

          {/* Sidebar with additional info */}
          <div className="space-y-6">
            {/* TrueSkill explanation */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                About TrueSkill Rankings
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>Conservative Rating:</strong> The main ranking number
                  (μ - 3σ) represents a skill level we're 99.7% confident the
                  player exceeds.
                </p>
                <p>
                  <strong>μ (Mu):</strong> The estimated skill level. Higher
                  values indicate better players.
                </p>
                <p>
                  <strong>σ (Sigma):</strong> The uncertainty in our skill
                  estimate. Lower values mean we're more confident about the
                  player's skill level.
                </p>
                <p>
                  <strong>Certainty Levels:</strong>
                </p>
                <ul className="ml-4 space-y-1">
                  <li>
                    <span className="text-green-600">Low σ (≤5):</span> High
                    certainty
                  </li>
                  <li>
                    <span className="text-yellow-600">Medium σ (5-7):</span>{' '}
                    Medium certainty
                  </li>
                  <li>
                    <span className="text-red-600">High σ (&gt;7):</span> Low
                    certainty
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">New Player Rating:</span>
                  <span className="font-medium">25.0 ± 8.3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating Range:</span>
                  <span className="font-medium">0 - 50+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">System:</span>
                  <span className="font-medium">Microsoft TrueSkill</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Explore More
              </h3>
              <div className="space-y-2">
                <a
                  href="/players"
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  → View All Players
                </a>
                <a
                  href="/games"
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  → Game History
                </a>
                <a
                  href="/"
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  → Record New Game
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
