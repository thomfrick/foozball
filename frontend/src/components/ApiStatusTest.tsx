// ABOUTME: Component to test API connectivity and display backend status
// ABOUTME: Shows health check results and connection status

import { useHealth, useReadiness } from '../hooks/useApi'

export default function ApiStatusTest() {
  const {
    data: health,
    isLoading: healthLoading,
    error: healthError,
  } = useHealth()
  const {
    data: readiness,
    isLoading: readinessLoading,
    error: readinessError,
  } = useReadiness()

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">API Status</h3>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Health:</span>
          {healthLoading && <span className="text-blue-600">Checking...</span>}
          {healthError && <span className="text-red-600">❌ Failed</span>}
          {health && (
            <span className="text-green-600">
              ✅ {health.status} (v{health.version})
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-medium">Readiness:</span>
          {readinessLoading && (
            <span className="text-blue-600">Checking...</span>
          )}
          {readinessError && <span className="text-red-600">❌ Failed</span>}
          {readiness && (
            <span className="text-green-600">
              ✅ {readiness.status} (DB: {readiness.checks.database})
            </span>
          )}
        </div>
      </div>

      {(healthError || readinessError) && (
        <div className="text-sm text-gray-600">
          <p>💡 Make sure the backend is running on port 8000:</p>
          <code className="bg-gray-200 px-2 py-1 rounded text-xs">
            uv run --project backend uvicorn app.main:app --reload
          </code>
        </div>
      )}
    </div>
  )
}
