// ABOUTME: About page component with project information
// ABOUTME: Shows details about the application and tech stack

import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            About Foosball ELO Tracker
          </h1>
          <div className="space-y-4 text-gray-600">
            <p>
              A modern web application for tracking foosball games and managing
              player ratings using the TrueSkill rating system.
            </p>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Tech Stack
              </h2>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Frontend:</strong> React 19 + TypeScript + Vite
                </li>
                <li>
                  <strong>Styling:</strong> Tailwind CSS
                </li>
                <li>
                  <strong>State Management:</strong> TanStack Query
                </li>
                <li>
                  <strong>Routing:</strong> React Router
                </li>
                <li>
                  <strong>Backend:</strong> FastAPI + PostgreSQL
                </li>
                <li>
                  <strong>Rating System:</strong> TrueSkill
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Current Status
              </h2>
              <p>
                ✅ Phase 0.1 Backend Foundation - Complete
                <br />
                ✅ Phase 1.1 Player Management API - Complete
                <br />
                🔄 Phase 0.2 Frontend Foundation - In Progress
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
