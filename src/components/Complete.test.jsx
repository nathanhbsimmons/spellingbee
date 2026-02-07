import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Complete from './Complete'
import Garden from './themes/Garden'

describe('Complete (Review Mode)', () => {
  const words = ['apple', 'banana', 'cherry']
  const collectedWords = ['apple', 'banan', 'cherry']

  it('shows Review Time when some words are incorrect', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    expect(screen.getByText('Review Time')).toBeInTheDocument()
  })

  it('shows bloomed/to-tend progress', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    expect(screen.getByText('2 bloomed, 1 to tend')).toBeInTheDocument()
  })

  it('shows All flowers bloomed when everything is correct', () => {
    render(
      <Complete words={words} collectedWords={['apple', 'banana', 'cherry']} onStartOver={() => {}} />
    )
    expect(screen.getByText('All flowers bloomed!')).toBeInTheDocument()
  })

  it('shows a checkmark for correctly spelled words', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    const checkmarks = screen.getAllByLabelText('correct')
    expect(checkmarks).toHaveLength(2)
  })

  it('shows the correct spelling next to misspelled words', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    expect(screen.getByText('(correct: banana)')).toBeInTheDocument()
    // "banan" appears in both the garden label and the review list
    expect(screen.getAllByText('banan').length).toBeGreaterThanOrEqual(1)
  })

  it('shows a Fix button for incorrect words', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    expect(screen.getByRole('button', { name: /fix/i })).toBeInTheDocument()
  })

  it('opens a fix input when Fix is clicked', async () => {
    const user = userEvent.setup()
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    await user.click(screen.getByRole('button', { name: /fix/i }))
    expect(screen.getByPlaceholderText(/type "banana" here/i)).toBeInTheDocument()
  })

  it('fixes a word when the correct spelling is submitted', async () => {
    const user = userEvent.setup()
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    await user.click(screen.getByRole('button', { name: /fix/i }))
    await user.type(screen.getByPlaceholderText(/type "banana" here/i), 'banana')
    await user.click(screen.getByRole('button', { name: /save/i }))
    // Now all words should be correct
    expect(screen.getByText('All flowers bloomed!')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /fix/i })).not.toBeInTheDocument()
  })

  it('fixes a word using Enter key', async () => {
    const user = userEvent.setup()
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    await user.click(screen.getByRole('button', { name: /fix/i }))
    await user.type(screen.getByPlaceholderText(/type "banana" here/i), 'banana{Enter}')
    expect(screen.getByText('All flowers bloomed!')).toBeInTheDocument()
  })

  it('renders the theme visualization when provided', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} ThemeVisualization={Garden} />)
    expect(screen.getByTestId('theme-item-0')).toBeInTheDocument()
    expect(screen.getByTestId('theme-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('theme-item-2')).toBeInTheDocument()
  })

  it('calls onStartOver when button is clicked', async () => {
    const user = userEvent.setup()
    const onStartOver = vi.fn()
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={onStartOver} />)
    await user.click(screen.getByRole('button', { name: /collect more words/i }))
    expect(onStartOver).toHaveBeenCalled()
  })

  // Sprint 7: Polish tests
  it('shows confetti when all words are correct', () => {
    render(
      <Complete words={words} collectedWords={['apple', 'banana', 'cherry']} onStartOver={() => {}} />
    )
    expect(screen.getByTestId('confetti')).toBeInTheDocument()
  })

  it('does not show confetti when some words are incorrect', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    expect(screen.queryByTestId('confetti')).not.toBeInTheDocument()
  })

  it('shows a Print Words button', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    expect(screen.getByRole('button', { name: /print words/i })).toBeInTheDocument()
  })

  // Sprint 8: Streak display tests
  it('shows streak display when streak > 0', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} streak={5} />)
    expect(screen.getByTestId('streak-display')).toBeInTheDocument()
    expect(screen.getByText(/5 day streak/)).toBeInTheDocument()
  })

  it('does not show streak display when streak is 0', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} streak={0} />)
    expect(screen.queryByTestId('streak-display')).not.toBeInTheDocument()
  })
})
