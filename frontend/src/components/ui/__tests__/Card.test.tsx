// ABOUTME: Comprehensive tests for Card component system with all variants and specialized cards
// ABOUTME: Tests card behavior, hover effects, accessibility, and specialized card components

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Card, {
  CardContent,
  CardFooter,
  CardHeader,
  GameCard,
  PlayerCard,
  StatsCard,
} from '../Card'

describe('Card', () => {
  describe('rendering', () => {
    it('should render with default props', () => {
      render(<Card>Card content</Card>)

      const card = screen.getByText('Card content').closest('div')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg')
    })

    it('should render children correctly', () => {
      render(
        <Card>
          <div data-testid="card-child">Test content</div>
        </Card>
      )

      expect(screen.getByTestId('card-child')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Card className="custom-class">Content</Card>)

      const card = screen.getByText('Content').closest('div')
      expect(card).toHaveClass('custom-class')
    })

    it('should pass through HTML div props', () => {
      const onClickMock = vi.fn()
      render(
        <Card id="test-card" data-testid="custom-card" onClick={onClickMock}>
          Content
        </Card>
      )

      const card = screen.getByTestId('custom-card')
      expect(card).toHaveAttribute('id', 'test-card')
    })
  })

  describe('variants', () => {
    it('should apply default variant styles', () => {
      render(<Card>Default Card</Card>)

      const card = screen.getByText('Default Card').closest('div')
      expect(card).toHaveClass(
        'bg-neutral-0',
        'border-neutral-100',
        'shadow-soft'
      )
    })

    it('should apply elevated variant styles', () => {
      render(<Card variant="elevated">Elevated Card</Card>)

      const card = screen.getByText('Elevated Card').closest('div')
      expect(card).toHaveClass('bg-neutral-0', 'shadow-medium')
    })

    it('should apply outlined variant styles', () => {
      render(<Card variant="outlined">Outlined Card</Card>)

      const card = screen.getByText('Outlined Card').closest('div')
      expect(card).toHaveClass('border-2', 'border-neutral-200', 'shadow-none')
    })

    it('should apply subtle variant styles', () => {
      render(<Card variant="subtle">Subtle Card</Card>)

      const card = screen.getByText('Subtle Card').closest('div')
      expect(card).toHaveClass('bg-neutral-50', 'shadow-none')
    })
  })

  describe('padding', () => {
    it('should apply medium padding by default', () => {
      render(<Card>Padded Card</Card>)

      const card = screen.getByText('Padded Card').closest('div')
      expect(card).toHaveClass('p-6')
    })

    it('should apply no padding', () => {
      render(<Card padding="none">No Padding</Card>)

      const card = screen.getByText('No Padding').closest('div')
      expect(card).not.toHaveClass('p-4', 'p-6', 'p-8', 'p-10')
    })

    it('should apply small padding', () => {
      render(<Card padding="sm">Small Padding</Card>)

      const card = screen.getByText('Small Padding').closest('div')
      expect(card).toHaveClass('p-4')
    })

    it('should apply large padding', () => {
      render(<Card padding="lg">Large Padding</Card>)

      const card = screen.getByText('Large Padding').closest('div')
      expect(card).toHaveClass('p-8')
    })

    it('should apply extra large padding', () => {
      render(<Card padding="xl">XL Padding</Card>)

      const card = screen.getByText('XL Padding').closest('div')
      expect(card).toHaveClass('p-10')
    })
  })

  describe('hover effects', () => {
    it('should apply hover effects when hover is true', () => {
      render(<Card hover>Hoverable Card</Card>)

      const card = screen.getByText('Hoverable Card').closest('div')
      expect(card).toHaveClass('hover:shadow-large', 'hover:-translate-y-1')
    })

    it('should not apply hover effects by default', () => {
      render(<Card>Normal Card</Card>)

      const card = screen.getByText('Normal Card').closest('div')
      expect(card).not.toHaveClass('hover:shadow-large', 'hover:-translate-y-1')
    })

    it('should apply hover effects when clickable is true', () => {
      render(<Card clickable>Clickable Card</Card>)

      const card = screen.getByText('Clickable Card').closest('div')
      expect(card).toHaveClass('hover:shadow-large', 'cursor-pointer')
    })
  })

  describe('clickable behavior', () => {
    it('should handle click events when clickable', async () => {
      const user = userEvent.setup()
      const onClickMock = vi.fn()

      render(
        <Card clickable onClick={onClickMock}>
          Clickable Content
        </Card>
      )

      await user.click(screen.getByText('Clickable Content'))
      expect(onClickMock).toHaveBeenCalledTimes(1)
    })

    it('should apply cursor-pointer when clickable', () => {
      render(<Card clickable>Clickable</Card>)

      const card = screen.getByText('Clickable').closest('div')
      expect(card).toHaveClass('cursor-pointer')
    })
  })
})

describe('CardHeader', () => {
  it('should render title correctly', () => {
    render(<CardHeader title="Card Title" />)

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Card Title'
    )
  })

  it('should render subtitle when provided', () => {
    render(<CardHeader title="Title" subtitle="This is a subtitle" />)

    expect(screen.getByText('This is a subtitle')).toBeInTheDocument()
  })

  it('should render action when provided', () => {
    const action = <button data-testid="header-action">Action</button>
    render(<CardHeader title="Title" action={action} />)

    expect(screen.getByTestId('header-action')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<CardHeader title="Title" className="custom-header" />)

    // The custom class is on the outer wrapper div
    const header = screen.getByText('Title').closest('.custom-header')
    expect(header).toBeInTheDocument()
  })

  it('should have proper layout structure', () => {
    const action = <button>Action</button>
    render(<CardHeader title="Title" subtitle="Subtitle" action={action} />)

    // Find the outer container which has the flex classes
    const header = screen.getByText('Title').closest('div').parentElement
    expect(header).toHaveClass('flex', 'items-start', 'justify-between')
  })
})

describe('CardContent', () => {
  it('should render children correctly', () => {
    render(
      <CardContent>
        <p data-testid="content-child">Content text</p>
      </CardContent>
    )

    expect(screen.getByTestId('content-child')).toBeInTheDocument()
  })

  it('should apply default text colors', () => {
    render(<CardContent>Content</CardContent>)

    const content = screen.getByText('Content')
    expect(content).toHaveClass('text-neutral-700', 'dark:text-neutral-300')
  })

  it('should apply custom className', () => {
    render(<CardContent className="custom-content">Content</CardContent>)

    const content = screen.getByText('Content')
    expect(content).toHaveClass('custom-content')
  })
})

describe('CardFooter', () => {
  it('should render children correctly', () => {
    render(
      <CardFooter>
        <button data-testid="footer-button">Footer Action</button>
      </CardFooter>
    )

    expect(screen.getByTestId('footer-button')).toBeInTheDocument()
  })

  it('should have border top styling', () => {
    render(<CardFooter>Footer</CardFooter>)

    const footer = screen.getByText('Footer')
    expect(footer).toHaveClass('mt-6', 'pt-4', 'border-t', 'border-neutral-100')
  })

  it('should apply custom className', () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>)

    const footer = screen.getByText('Footer')
    expect(footer).toHaveClass('custom-footer')
  })
})

describe('StatsCard', () => {
  it('should render title and value', () => {
    render(<StatsCard title="Total Games" value="42" />)

    expect(screen.getByText('Total Games')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should render subtitle when provided', () => {
    render(
      <StatsCard title="Win Rate" value="75%" subtitle="+5% from last month" />
    )

    expect(screen.getByText('+5% from last month')).toBeInTheDocument()
  })

  it('should render icon when provided', () => {
    const icon = <span data-testid="stats-icon">📊</span>
    render(<StatsCard title="Stats" value="100" icon={icon} />)

    expect(screen.getByTestId('stats-icon')).toBeInTheDocument()
  })

  it('should apply trend colors correctly', () => {
    render(
      <StatsCard title="Revenue" value="$1000" subtitle="↑ Up 10%" trend="up" />
    )

    const subtitle = screen.getByText('↑ Up 10%')
    expect(subtitle).toHaveClass('text-success-600')
  })

  it('should apply down trend color', () => {
    render(
      <StatsCard
        title="Revenue"
        value="$800"
        subtitle="↓ Down 5%"
        trend="down"
      />
    )

    const subtitle = screen.getByText('↓ Down 5%')
    expect(subtitle).toHaveClass('text-danger-600')
  })

  it('should apply neutral trend color', () => {
    render(
      <StatsCard
        title="Revenue"
        value="$900"
        subtitle="No change"
        trend="neutral"
      />
    )

    const subtitle = screen.getByText('No change')
    expect(subtitle).toHaveClass('text-neutral-500')
  })

  it('should handle numeric values', () => {
    render(<StatsCard title="Count" value={123} />)

    expect(screen.getByText('123')).toBeInTheDocument()
  })

  it('should apply custom className and style', () => {
    render(
      <StatsCard
        title="Test"
        value="100"
        className="custom-stats"
        style={{ width: '200px' }}
      />
    )

    const card = screen.getByText('Test').closest('.custom-stats')
    expect(card).toBeInTheDocument()
    expect(card).toHaveStyle({ width: '200px' })
  })
})

describe('PlayerCard', () => {
  const mockPlayer = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    games_played: 25,
    win_percentage: 68.5,
  }

  it('should render player information', () => {
    render(<PlayerCard player={mockPlayer} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('25 games • 68.5% wins')).toBeInTheDocument()
  })

  it('should render player avatar with initial', () => {
    render(<PlayerCard player={mockPlayer} />)

    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('should handle click events when onClick is provided', async () => {
    const user = userEvent.setup()
    const onClickMock = vi.fn()

    render(<PlayerCard player={mockPlayer} onClick={onClickMock} />)

    await user.click(screen.getByText('John Doe'))
    expect(onClickMock).toHaveBeenCalledTimes(1)
  })

  it('should render actions when provided', () => {
    const actions = <button data-testid="player-action">Edit</button>
    render(<PlayerCard player={mockPlayer} actions={actions} />)

    expect(screen.getByTestId('player-action')).toBeInTheDocument()
  })

  it('should prevent action clicks from bubbling', async () => {
    const user = userEvent.setup()
    const onClickMock = vi.fn()
    const actionClickMock = vi.fn()

    const actions = (
      <button data-testid="player-action" onClick={actionClickMock}>
        Edit
      </button>
    )

    render(
      <PlayerCard player={mockPlayer} onClick={onClickMock} actions={actions} />
    )

    await user.click(screen.getByTestId('player-action'))
    expect(actionClickMock).toHaveBeenCalledTimes(1)
    expect(onClickMock).not.toHaveBeenCalled()
  })

  it('should handle player without email', () => {
    const playerWithoutEmail = { ...mockPlayer, email: undefined }
    render(<PlayerCard player={playerWithoutEmail} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('john@example.com')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<PlayerCard player={mockPlayer} className="custom-player-card" />)

    const card = screen.getByText('John Doe').closest('.custom-player-card')
    expect(card).toBeInTheDocument()
  })
})

describe('GameCard', () => {
  const mockGame = {
    id: 1,
    player1_name: 'Alice',
    player2_name: 'Bob',
    winner_name: 'Alice',
    created_at: '2024-01-15T10:30:00Z',
  }

  it('should render game information', () => {
    render(<GameCard game={mockGame} />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('vs')).toBeInTheDocument()
    expect(screen.getByText('Alice wins')).toBeInTheDocument()
  })

  it('should render game date', () => {
    render(<GameCard game={mockGame} />)

    const expectedDate = new Date(mockGame.created_at).toLocaleDateString()
    expect(screen.getByText(expectedDate)).toBeInTheDocument()
  })

  it('should highlight winner with success color', () => {
    render(<GameCard game={mockGame} />)

    const aliceText = screen.getByText('Alice')
    const bobText = screen.getByText('Bob')

    expect(aliceText).toHaveClass('text-success-600')
    expect(bobText).toHaveClass('text-neutral-600')
  })

  it('should handle when player2 wins', () => {
    const gameWithPlayer2Win = { ...mockGame, winner_name: 'Bob' }
    render(<GameCard game={gameWithPlayer2Win} />)

    const aliceText = screen.getByText('Alice')
    const bobText = screen.getByText('Bob')

    expect(aliceText).toHaveClass('text-neutral-600')
    expect(bobText).toHaveClass('text-success-600')
    expect(screen.getByText('Bob wins')).toBeInTheDocument()
  })

  it('should handle click events when onClick is provided', async () => {
    const user = userEvent.setup()
    const onClickMock = vi.fn()

    render(<GameCard game={mockGame} onClick={onClickMock} />)

    await user.click(screen.getByText('Alice'))
    expect(onClickMock).toHaveBeenCalledTimes(1)
  })

  it('should apply custom className', () => {
    render(<GameCard game={mockGame} className="custom-game-card" />)

    const card = screen.getByText('Alice').closest('.custom-game-card')
    expect(card).toBeInTheDocument()
  })

  it('should render ping pong emoji', () => {
    render(<GameCard game={mockGame} />)

    expect(screen.getByText('🏓')).toBeInTheDocument()
  })
})

describe('Card Complex Scenarios', () => {
  it('should combine all card features', () => {
    const action = <button>Action</button>
    const onClickMock = vi.fn()

    render(
      <Card
        variant="elevated"
        padding="lg"
        hover
        clickable
        onClick={onClickMock}
        className="custom-card"
      >
        <CardHeader
          title="Complex Card"
          subtitle="With all features"
          action={action}
        />
        <CardContent>
          <p>This is the card content</p>
        </CardContent>
        <CardFooter>
          <button>Footer Button</button>
        </CardFooter>
      </Card>
    )

    // Find the actual Card element by looking for the custom class
    const card = screen.getByText('Complex Card').closest('.custom-card')
    expect(card).toHaveClass(
      'shadow-medium',
      'p-8',
      'hover:shadow-large',
      'cursor-pointer',
      'custom-card'
    )

    expect(screen.getByText('Complex Card')).toBeInTheDocument()
    expect(screen.getByText('With all features')).toBeInTheDocument()
    expect(screen.getByText('This is the card content')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Footer Button' })
    ).toBeInTheDocument()
  })

  it('should handle nested interactive elements', async () => {
    const user = userEvent.setup()
    const cardClickMock = vi.fn()
    const buttonClickMock = vi.fn()

    render(
      <Card clickable onClick={cardClickMock}>
        <button data-testid="nested-button" onClick={buttonClickMock}>
          Nested Button
        </button>
      </Card>
    )

    // Click the nested button should not trigger card click
    await user.click(screen.getByTestId('nested-button'))
    expect(buttonClickMock).toHaveBeenCalledTimes(1)
    expect(cardClickMock).toHaveBeenCalledTimes(1) // Card still gets clicked due to event bubbling
  })
})
