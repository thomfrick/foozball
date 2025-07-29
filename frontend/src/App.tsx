// ABOUTME: Main App component for Foosball ELO Tracker
// ABOUTME: Root component that sets up the application routing

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import AboutPage from './pages/AboutPage'
import GamesPage from './pages/GamesPage'
import HomePage from './pages/HomePage'
import LeaderboardPage from './pages/LeaderboardPage'
import NotFoundPage from './pages/NotFoundPage'
import PlayersPage from './pages/PlayersPage'
import TeamGameHistoryPage from './pages/TeamGameHistoryPage'
import TeamGamesPage from './pages/TeamGamesPage'
import TeamsPage from './pages/TeamsPage'
import TeamStatsPage from './pages/TeamStatsPage'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:teamId" element={<TeamStatsPage />} />
            <Route path="/team-games" element={<TeamGamesPage />} />
            <Route
              path="/team-games/history"
              element={<TeamGameHistoryPage />}
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  )
}

export default App
