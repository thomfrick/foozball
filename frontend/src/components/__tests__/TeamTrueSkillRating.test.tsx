// ABOUTME: Tests for team TrueSkill rating display components
// ABOUTME: Verifies team rating calculations, uncertainty indicators, and tooltip functionality

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '../../contexts/ThemeContext'
import type { Team } from '../../types/team'
import TeamTrueSkillRating, {
  CompactTeamTrueSkillRating,
  TeamStatsDisplay,
  TeamTrueSkillChange,
} from '../TeamTrueSkillRating'

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>)
}

const mockTeam: Team = {
  id: 1,
  player1_id: 1,
  player2_id: 2,
  trueskill_mu: 50.0,
  trueskill_sigma: 16.6666,
  games_played: 0,
  wins: 0,
  losses: 0,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: null,
  is_active: true,
  win_percentage: 0.0,
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
  trueskill_mu: 65.0,
  trueskill_sigma: 3.5,
  games_played: 25,
  wins: 18,
  losses: 7,
  win_percentage: 72.0,
  conservative_rating: 54.5, // 65.0 - 3*3.5 = 54.5
  player_names: 'Charlie & Dana',
  player1: { ...mockTeam.player1, id: 3, name: 'Charlie' },
  player2: { ...mockTeam.player2, id: 4, name: 'Dana' },
}

const mediumUncertaintyTeam: Team = {
  ...mockTeam,
  id: 3,
  trueskill_mu: 55.0,
  trueskill_sigma: 5.0,
  games_played: 10,
  wins: 6,
  losses: 4,
  win_percentage: 60.0,
  conservative_rating: 40.0, // 55.0 - 3*5.0 = 40.0
  player_names: 'Eve & Frank',
  player1: { ...mockTeam.player1, id: 5, name: 'Eve' },
  player2: { ...mockTeam.player2, id: 6, name: 'Frank' },
}

describe('TeamTrueSkillRating', () => {
  it('displays conservative rating correctly', () => {
    renderWithProviders(<TeamTrueSkillRating team={mockTeam} />)

    // Conservative rating = mu - 3*sigma = 50.0 - 3*16.6666 = 0.0
    expect(screen.getByText('0.0')).toBeInTheDocument()
  })

  it('displays mu and sigma values correctly', () => {
    renderWithProviders(<TeamTrueSkillRating team={mockTeam} />)

    expect(screen.getByText('μ')).toBeInTheDocument()
    expect(screen.getByText('50.0')).toBeInTheDocument()
    expect(screen.getByText('σ')).toBeInTheDocument()
    expect(screen.getByText('16.7')).toBeInTheDocument()
  })

  it('shows correct uncertainty level for high uncertainty', () => {
    renderWithProviders(<TeamTrueSkillRating team={mockTeam} />)

    // High uncertainty (sigma > 6)
    expect(screen.getByText('High uncertainty')).toBeInTheDocument()
  })

  it('shows correct uncertainty level for low uncertainty', () => {
    renderWithProviders(<TeamTrueSkillRating team={experiencedTeam} />)

    // Low uncertainty (sigma <= 4)
    expect(screen.getByText('Low uncertainty')).toBeInTheDocument()
  })

  it('shows correct uncertainty level for medium uncertainty', () => {
    renderWithProviders(<TeamTrueSkillRating team={mediumUncertaintyTeam} />)

    // Medium uncertainty (4 < sigma <= 6)
    expect(screen.getByText('Medium uncertainty')).toBeInTheDocument()
  })

  it('displays "New Team" badge for teams with no games', () => {
    renderWithProviders(<TeamTrueSkillRating team={mockTeam} />)

    expect(screen.getByText('New Team')).toBeInTheDocument()
  })

  it('does not display "New Team" badge for experienced teams', () => {
    renderWithProviders(<TeamTrueSkillRating team={experiencedTeam} />)

    expect(screen.queryByText('New Team')).not.toBeInTheDocument()
  })

  it('hides conservative rating when showConservative is false', () => {
    renderWithProviders(
      <TeamTrueSkillRating team={mockTeam} showConservative={false} />
    )

    expect(screen.queryByText('0.0')).not.toBeInTheDocument()
    expect(screen.getByText('μ')).toBeInTheDocument()
    expect(screen.getByText('50.0')).toBeInTheDocument()
  })

  it('shows tooltip on hover when showTooltip is true', async () => {
    renderWithProviders(
      <TeamTrueSkillRating team={mockTeam} showTooltip={true} />
    )

    const container = screen.getByText('μ').closest('.group')
    expect(container).toBeInTheDocument()

    // Hover to show tooltip
    if (container) {
      fireEvent.mouseEnter(container)

      // Should show tooltip content
      expect(
        screen.getByText('Team TrueSkill Rating System')
      ).toBeInTheDocument()
      expect(screen.getByText('Team:')).toBeInTheDocument()
    }
  })

  it('applies different sizes correctly', () => {
    const { rerender } = renderWithProviders(
      <TeamTrueSkillRating team={mockTeam} size="small" />
    )

    let ratingElement = screen.getByText('0.0')
    expect(ratingElement).toHaveClass('text-lg')

    rerender(
      <ThemeProvider>
        <TeamTrueSkillRating team={mockTeam} size="large" />
      </ThemeProvider>
    )

    ratingElement = screen.getByText('0.0')
    expect(ratingElement).toHaveClass('text-2xl')
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <TeamTrueSkillRating team={mockTeam} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('CompactTeamTrueSkillRating', () => {
  it('displays rating in compact format', () => {
    renderWithProviders(<CompactTeamTrueSkillRating team={experiencedTeam} />)

    expect(screen.getByText('54.5')).toBeInTheDocument()
    expect(screen.getByText('(μ65.0 σ3.5)')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <CompactTeamTrueSkillRating team={mockTeam} className="compact-custom" />
    )

    expect(container.firstChild).toHaveClass('compact-custom')
  })
})

describe('TeamTrueSkillChange', () => {
  it('displays positive rating change correctly', () => {
    renderWithProviders(
      <TeamTrueSkillChange
        beforeMu={50.0}
        beforeSigma={5.0}
        afterMu={53.0}
        afterSigma={4.8}
      />
    )

    // Before: 50.0 - 3*5.0 = 35.0
    // After: 53.0 - 3*4.8 = 38.6
    // Change: 38.6 - 35.0 = +3.6
    expect(screen.getByText('35.0')).toBeInTheDocument()
    expect(screen.getByText('38.6')).toBeInTheDocument()
    expect(screen.getByText('↗')).toBeInTheDocument()
    expect(screen.getByText('(+3.6)')).toBeInTheDocument()
  })

  it('displays negative rating change correctly', () => {
    renderWithProviders(
      <TeamTrueSkillChange
        beforeMu={50.0}
        beforeSigma={5.0}
        afterMu={47.0}
        afterSigma={5.2}
      />
    )

    // Before: 50.0 - 3*5.0 = 35.0
    // After: 47.0 - 3*5.2 = 31.4
    // Change: 31.4 - 35.0 = -3.6
    expect(screen.getByText('35.0')).toBeInTheDocument()
    expect(screen.getByText('31.4')).toBeInTheDocument()
    expect(screen.getByText('↘')).toBeInTheDocument()
    expect(screen.getByText('(-3.6)')).toBeInTheDocument()
  })

  it('applies correct color classes for positive change', () => {
    renderWithProviders(
      <TeamTrueSkillChange
        beforeMu={50.0}
        beforeSigma={5.0}
        afterMu={53.0}
        afterSigma={4.8}
      />
    )

    const changeIcon = screen.getByText('↗')
    expect(changeIcon).toHaveClass('text-green-600')
  })

  it('applies correct color classes for negative change', () => {
    renderWithProviders(
      <TeamTrueSkillChange
        beforeMu={50.0}
        beforeSigma={5.0}
        afterMu={47.0}
        afterSigma={5.2}
      />
    )

    const changeIcon = screen.getByText('↘')
    expect(changeIcon).toHaveClass('text-red-600')
  })
})

describe('TeamStatsDisplay', () => {
  it('displays comprehensive team statistics', () => {
    renderWithProviders(
      <TeamStatsDisplay team={experiencedTeam} showDetailedStats={true} />
    )

    expect(screen.getByText('25')).toBeInTheDocument() // Games played
    expect(screen.getByText('72.0%')).toBeInTheDocument() // Win percentage
    expect(screen.getByText('18W-7L')).toBeInTheDocument() // Record
    expect(screen.getByText('Low')).toBeInTheDocument() // Uncertainty level
  })

  it('displays team composition correctly', () => {
    renderWithProviders(<TeamStatsDisplay team={experiencedTeam} />)

    expect(screen.getByText('Charlie')).toBeInTheDocument()
    expect(screen.getByText('Dana')).toBeInTheDocument()
    expect(screen.getByText('Team Composition')).toBeInTheDocument()
  })

  it('hides detailed stats when showDetailedStats is false', () => {
    renderWithProviders(
      <TeamStatsDisplay team={experiencedTeam} showDetailedStats={false} />
    )

    expect(screen.queryByText('Games Played')).not.toBeInTheDocument()
    expect(screen.queryByText('Win Percentage')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <TeamStatsDisplay team={mockTeam} className="stats-custom" />
    )

    expect(container.firstChild).toHaveClass('stats-custom')
  })

  it('displays player initials in team composition', () => {
    renderWithProviders(<TeamStatsDisplay team={experiencedTeam} />)

    expect(screen.getByText('C')).toBeInTheDocument() // Charlie's initial
    expect(screen.getByText('D')).toBeInTheDocument() // Dana's initial
  })
})

describe('TeamTrueSkillRating - Dark Mode', () => {
  it('applies dark mode classes correctly', () => {
    // Mock dark mode
    document.documentElement.classList.add('dark')

    renderWithProviders(<TeamTrueSkillRating team={mockTeam} />)

    const uncertaintyElement = screen.getByText('High uncertainty')
    expect(uncertaintyElement).toHaveClass(
      'dark:text-amber-400',
      'text-amber-600'
    )

    // Clean up
    document.documentElement.classList.remove('dark')
  })
})

describe('TeamTrueSkillRating - Accessibility', () => {
  it('has proper tooltip structure for screen readers', () => {
    renderWithProviders(
      <TeamTrueSkillRating team={mockTeam} showTooltip={true} />
    )

    const container = screen.getByText('μ').closest('.group')
    expect(container).toHaveAttribute('class', expect.stringContaining('group'))
  })

  it('provides meaningful uncertainty level information', () => {
    renderWithProviders(<TeamTrueSkillRating team={experiencedTeam} />)

    const uncertaintyElement = screen.getByText('Low uncertainty')
    expect(uncertaintyElement).toBeInTheDocument()
  })
})
