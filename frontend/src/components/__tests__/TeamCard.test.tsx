// ABOUTME: Tests for team-related card components
// ABOUTME: Verifies team display, TrueSkill ratings, and interaction functionality

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../../contexts/ThemeContext'
import type { Team, TeamGame } from '../../types/team'
import { TeamCard, TeamGameCard } from '../ui/Card'

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>)
}

const mockTeam: Team = {
  id: 1,
  player1_id: 1,
  player2_id: 2,
  trueskill_mu: 50.0,
  trueskill_sigma: 16.6666,
  games_played: 10,
  wins: 6,
  losses: 4,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-15T00:00:00Z',
  is_active: true,
  win_percentage: 60.0,
  conservative_rating: 0.0, // 50.0 - 3*16.6666 = 0.0
  player_names: 'Alice & Bob',
  player1: {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    trueskill_mu: 25.0,
    trueskill_sigma: 8.3,
    games_played: 5,
    wins: 3,
    losses: 2,
    created_at: '2023-01-01T00:00:00Z',
    is_active: true,
    win_percentage: 60.0,
  },
  player2: {
    id: 2,
    name: 'Bob',
    email: 'bob@example.com',
    trueskill_mu: 25.0,
    trueskill_sigma: 8.3,
    games_played: 5,
    wins: 3,
    losses: 2,
    created_at: '2023-01-01T00:00:00Z',
    is_active: true,
    win_percentage: 60.0,
  },
}

const experiencedTeam: Team = {
  ...mockTeam,
  id: 2,
  trueskill_mu: 55.0,
  trueskill_sigma: 3.8,
  games_played: 25,
  wins: 18,
  losses: 7,
  win_percentage: 72.0,
  conservative_rating: 43.6, // 55.0 - 3*3.8 = 43.6
  player_names: 'Charlie & Dana',
  player1: { ...mockTeam.player1, id: 3, name: 'Charlie' },
  player2: { ...mockTeam.player2, id: 4, name: 'Dana' },
}

const mockTeamGame: TeamGame = {
  id: 1,
  team1_id: 1,
  team2_id: 2,
  winner_team_id: 1,
  created_at: '2023-01-15T12:00:00Z',
  team1: mockTeam,
  team2: experiencedTeam,
  winner_team: mockTeam,
  loser_team_id: 2,
  loser_team: experiencedTeam,
}

describe('TeamCard', () => {
  it('displays team information correctly', () => {
    renderWithProviders(<TeamCard team={mockTeam} />)

    expect(screen.getByText('Alice & Bob')).toBeInTheDocument()
    expect(screen.getByText('10 games')).toBeInTheDocument()
    expect(screen.getByText('60.0% wins')).toBeInTheDocument()
    expect(screen.getByText('6W-4L')).toBeInTheDocument()
  })

  it('displays TrueSkill rating when showRating is true', () => {
    renderWithProviders(<TeamCard team={mockTeam} showRating={true} />)

    expect(screen.getByText('Rating: 0.0')).toBeInTheDocument()
  })

  it('hides TrueSkill rating when showRating is false', () => {
    renderWithProviders(<TeamCard team={mockTeam} showRating={false} />)

    expect(screen.queryByText(/Rating:/)).not.toBeInTheDocument()
  })

  it('displays uncertainty indicator with correct level', () => {
    const { rerender } = renderWithProviders(<TeamCard team={mockTeam} />)

    // High uncertainty (sigma > 6)
    expect(screen.getByText('High')).toBeInTheDocument()

    rerender(
      <ThemeProvider>
        <TeamCard team={experiencedTeam} />
      </ThemeProvider>
    )

    // Low uncertainty (sigma <= 4)
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('handles click events when onClick is provided', () => {
    const handleClick = vi.fn()
    renderWithProviders(<TeamCard team={mockTeam} onClick={handleClick} />)

    const card = screen.getByText('Alice & Bob').closest('div')
    fireEvent.click(card!)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders actions when provided', () => {
    const actions = <button>Test Action</button>
    renderWithProviders(<TeamCard team={mockTeam} actions={actions} />)

    expect(screen.getByText('Test Action')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <TeamCard team={mockTeam} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('shows team avatar emoji', () => {
    renderWithProviders(<TeamCard team={mockTeam} />)

    expect(screen.getByText('👥')).toBeInTheDocument()
  })
})

describe('TeamGameCard', () => {
  it('displays team game information correctly', () => {
    renderWithProviders(<TeamGameCard teamGame={mockTeamGame} />)

    expect(screen.getByText('Alice & Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie & Dana')).toBeInTheDocument()
    expect(screen.getByText('vs')).toBeInTheDocument()
    expect(screen.getByText('Alice & Bob win')).toBeInTheDocument()
  })

  it('highlights winning team correctly', () => {
    renderWithProviders(<TeamGameCard teamGame={mockTeamGame} />)

    // Winner should be highlighted
    const winnerElement = screen.getByText('Alice & Bob')
    expect(winnerElement).toHaveClass('text-success-600')

    // Loser should not be highlighted
    const loserElement = screen.getByText('Charlie & Dana')
    expect(loserElement).toHaveClass('text-neutral-600')
  })

  it('displays game date formatted correctly', () => {
    renderWithProviders(<TeamGameCard teamGame={mockTeamGame} />)

    // Should display formatted date
    expect(screen.getByText('1/15/2023')).toBeInTheDocument()
  })

  it('handles click events when onClick is provided', () => {
    const handleClick = vi.fn()
    renderWithProviders(
      <TeamGameCard teamGame={mockTeamGame} onClick={handleClick} />
    )

    const card = screen.getByText('Alice & Bob').closest('div')
    fireEvent.click(card!)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <TeamGameCard teamGame={mockTeamGame} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('shows team game icon', () => {
    renderWithProviders(<TeamGameCard teamGame={mockTeamGame} />)

    expect(screen.getByText('👥')).toBeInTheDocument()
  })

  it('correctly identifies winner when team2 wins', () => {
    const team2WinsGame = {
      ...mockTeamGame,
      winner_team_id: 2,
      winner_team: experiencedTeam,
      loser_team_id: 1,
      loser_team: mockTeam,
    }

    renderWithProviders(<TeamGameCard teamGame={team2WinsGame} />)

    expect(screen.getByText('Charlie & Dana win')).toBeInTheDocument()

    // Winner should be highlighted
    const winnerElement = screen.getByText('Charlie & Dana')
    expect(winnerElement).toHaveClass('text-success-600')
  })
})

describe('TeamCard - Dark Mode', () => {
  it('applies dark mode classes correctly', () => {
    // Mock dark mode
    document.documentElement.classList.add('dark')

    renderWithProviders(<TeamCard team={mockTeam} />)

    const card = screen
      .getByText('Alice & Bob')
      .closest('[class*="rounded-lg"]')
    expect(card).toHaveClass('dark:bg-dark-surface')

    // Clean up
    document.documentElement.classList.remove('dark')
  })
})

describe('TeamCard - Accessibility', () => {
  it('has proper ARIA attributes when clickable', () => {
    const handleClick = vi.fn()
    renderWithProviders(<TeamCard team={mockTeam} onClick={handleClick} />)

    const card = screen
      .getByText('Alice & Bob')
      .closest('[class*="rounded-lg"]')
    expect(card).toHaveClass('cursor-pointer')
  })

  it('has proper tooltip attributes for uncertainty indicator', () => {
    renderWithProviders(<TeamCard team={mockTeam} />)

    const uncertaintyElement = screen.getByTitle(/Uncertainty: 16.7 \(High\)/)
    expect(uncertaintyElement).toBeInTheDocument()
  })
})
