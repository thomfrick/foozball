// ABOUTME: Tests for TrueSkill rating display components
// ABOUTME: Verifies rating calculations, uncertainty indicators, and tooltip functionality

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Player } from '../../types/player'
import TrueSkillRating, {
  CompactTrueSkillRating,
  TrueSkillChange,
} from '../TrueSkillRating'

const mockPlayer: Player = {
  id: 1,
  name: 'Test Player',
  email: 'test@example.com',
  trueskill_mu: 25.0,
  trueskill_sigma: 8.3333,
  games_played: 0,
  wins: 0,
  losses: 0,
  created_at: '2023-01-01T00:00:00Z',
  is_active: true,
  win_percentage: 0.0,
}

const experiencedPlayer: Player = {
  ...mockPlayer,
  id: 2,
  name: 'Experienced Player',
  trueskill_mu: 28.5,
  trueskill_sigma: 4.2,
  games_played: 15,
  wins: 10,
  losses: 5,
  win_percentage: 66.7,
}

describe('TrueSkillRating', () => {
  it('displays conservative rating correctly', () => {
    render(<TrueSkillRating player={mockPlayer} />)

    // Conservative rating = mu - 3*sigma = 25.0 - 3*8.3333 = 0.0
    expect(screen.getByText('0.0')).toBeInTheDocument()
  })

  it('displays mu and sigma values', () => {
    render(<TrueSkillRating player={mockPlayer} />)

    expect(screen.getByText('μ')).toBeInTheDocument()
    expect(screen.getByText('25.0')).toBeInTheDocument()
    expect(screen.getByText('σ')).toBeInTheDocument()
    expect(screen.getByText('8.3')).toBeInTheDocument()
  })

  it('shows low certainty for new players (high sigma)', () => {
    render(<TrueSkillRating player={mockPlayer} />)

    expect(screen.getByText('Low certainty')).toBeInTheDocument()
    expect(screen.getByText('New Player')).toBeInTheDocument()
  })

  it('shows high certainty for experienced players (low sigma)', () => {
    render(<TrueSkillRating player={experiencedPlayer} />)

    expect(screen.getByText('High certainty')).toBeInTheDocument()
    expect(screen.queryByText('New Player')).not.toBeInTheDocument()
  })

  it('can hide conservative rating when requested', () => {
    render(<TrueSkillRating player={mockPlayer} showConservative={false} />)

    expect(screen.queryByText('0.0')).not.toBeInTheDocument()
    expect(screen.getByText('μ')).toBeInTheDocument()
    expect(screen.getByText('25.0')).toBeInTheDocument()
  })
})

describe('CompactTrueSkillRating', () => {
  it('displays compact rating format', () => {
    render(<CompactTrueSkillRating player={experiencedPlayer} />)

    // Conservative rating = 28.5 - 3*4.2 = 15.9
    expect(screen.getByText('15.9')).toBeInTheDocument()
    expect(screen.getByText('(μ28.5 σ4.2)')).toBeInTheDocument()
  })
})

describe('TrueSkillChange', () => {
  it('displays rating improvement correctly', () => {
    render(
      <TrueSkillChange
        beforeMu={25.0}
        beforeSigma={8.3}
        afterMu={27.5}
        afterSigma={7.1}
      />
    )

    // Before: 25.0 - 3*8.3 = 0.1
    // After: 27.5 - 3*7.1 = 6.2
    // Change: +6.1
    expect(screen.getByText('0.1')).toBeInTheDocument()
    expect(screen.getByText('6.2')).toBeInTheDocument()
    expect(screen.getByText('(+6.1)')).toBeInTheDocument()
    expect(screen.getByText('↗')).toBeInTheDocument()
  })

  it('displays rating decline correctly', () => {
    render(
      <TrueSkillChange
        beforeMu={25.0}
        beforeSigma={7.0}
        afterMu={22.5}
        afterSigma={6.8}
      />
    )

    // Before: 25.0 - 3*7.0 = 4.0
    // After: 22.5 - 3*6.8 = 2.1
    // Change: -1.9
    expect(screen.getByText('4.0')).toBeInTheDocument()
    expect(screen.getByText('2.1')).toBeInTheDocument()
    expect(screen.getByText('(-1.9)')).toBeInTheDocument()
    expect(screen.getByText('↘')).toBeInTheDocument()
  })
})

describe('TrueSkill certainty levels', () => {
  it('correctly categorizes certainty levels', () => {
    const highSigma = { ...mockPlayer, trueskill_sigma: 8.0 } // High uncertainty = Low certainty
    const mediumSigma = { ...mockPlayer, trueskill_sigma: 6.0 } // Medium uncertainty = Medium certainty
    const lowSigma = { ...mockPlayer, trueskill_sigma: 4.0 } // Low uncertainty = High certainty

    const { rerender } = render(<TrueSkillRating player={highSigma} />)
    expect(screen.getByText('Low certainty')).toBeInTheDocument()

    rerender(<TrueSkillRating player={mediumSigma} />)
    expect(screen.getByText('Medium certainty')).toBeInTheDocument()

    rerender(<TrueSkillRating player={lowSigma} />)
    expect(screen.getByText('High certainty')).toBeInTheDocument()
  })
})
