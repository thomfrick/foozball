// ABOUTME: About page component with project information
// ABOUTME: Shows details about the application and tech stack

export default function AboutPage() {
  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            About Foosball Tracker
          </h1>

          <div className="space-y-6 text-gray-600">
            <p className="text-lg">
              A modern web application for tracking foosball games and managing
              player ratings using Microsoft's TrueSkill rating system.
            </p>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Features
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc list-inside space-y-1">
                <li>🎯 TrueSkill rating algorithm</li>
                <li>📊 Live leaderboard rankings</li>
                <li>🎮 Game recording and history</li>
                <li>📱 Mobile-responsive design</li>
                <li>👥 Player management system</li>
                <li>🔍 Search and filtering</li>
                <li>📈 Rating uncertainty tracking</li>
                <li>♿ Accessibility compliance</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Tech Stack
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Frontend</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• React 19 + TypeScript</li>
                    <li>• Vite (build tool)</li>
                    <li>• Tailwind CSS</li>
                    <li>• TanStack Query</li>
                    <li>• React Router</li>
                    <li>• Vitest + Testing Library</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Backend</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• FastAPI (Python)</li>
                    <li>• PostgreSQL database</li>
                    <li>• SQLAlchemy ORM</li>
                    <li>• TrueSkill library</li>
                    <li>• Docker containers</li>
                    <li>• Pytest testing</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Development Status
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div>✅ Phase 0: Foundation Setup & Testing</div>
                  <div>✅ Phase 1.1: Player Management System</div>
                  <div>✅ Phase 1.2: Game Recording System</div>
                  <div>✅ Phase 1.3: TrueSkill Rating System</div>
                  <div>🔄 Phase 1.4: UI/UX Polish & Navigation</div>
                </div>
                <p className="mt-3 text-green-700 font-medium">
                  Core functionality complete! Now focusing on user experience
                  enhancements.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                About TrueSkill
              </h2>
              <p>
                TrueSkill is a Bayesian ranking system developed by Microsoft
                Research. Unlike simple Elo systems, TrueSkill tracks both skill
                (μ) and uncertainty (σ), allowing for more accurate rankings
                especially for new players. Our conservative rating (μ - 3σ)
                represents a skill level we're 99.7% confident the player
                exceeds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
