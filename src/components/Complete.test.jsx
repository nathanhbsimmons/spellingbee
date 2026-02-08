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

  it('calls onStartOver when button is clicked after parent review', async () => {
    const user = userEvent.setup()
    const onStartOver = vi.fn()
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={onStartOver} />)
    await user.click(screen.getByTestId('parent-reviewed-checkbox'))
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

  // Sprint 2: Theme-specific review text
  it('shows aquarium-themed text for aquarium theme', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} theme="aquarium" />)
    expect(screen.getByText('2 caught, 1 to catch')).toBeInTheDocument()
  })

  it('shows space-themed text for space theme', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} theme="space" />)
    expect(screen.getByText('2 launched, 1 to launch')).toBeInTheDocument()
  })

  it('shows treasure-themed text for treasure theme', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} theme="treasure" />)
    expect(screen.getByText('2 collected, 1 to find')).toBeInTheDocument()
  })

  it('shows theme-specific all-done text for aquarium', () => {
    render(<Complete words={words} collectedWords={['apple', 'banana', 'cherry']} onStartOver={() => {}} theme="aquarium" />)
    expect(screen.getByText('All fish caught!')).toBeInTheDocument()
  })

  it('shows garden-themed text by default', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    expect(screen.getByText('2 bloomed, 1 to tend')).toBeInTheDocument()
  })

  // Sprint 4: Parent review validation
  it('shows a Reviewed with parent checkbox', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    expect(screen.getByTestId('parent-reviewed-checkbox')).toBeInTheDocument()
    expect(screen.getByText(/reviewed with parent/i)).toBeInTheDocument()
  })

  it('disables Collect More Words button until parent review checkbox is checked', () => {
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    expect(screen.getByRole('button', { name: /collect more words/i })).toBeDisabled()
  })

  it('enables Collect More Words button after checking parent review', async () => {
    const user = userEvent.setup()
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} />)
    await user.click(screen.getByTestId('parent-reviewed-checkbox'))
    expect(screen.getByRole('button', { name: /collect more words/i })).toBeEnabled()
  })

  it('does not call onStartOver when Collect More Words is clicked without parent review', async () => {
    const user = userEvent.setup()
    const onStartOver = vi.fn()
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={onStartOver} />)
    await user.click(screen.getByRole('button', { name: /collect more words/i }))
    expect(onStartOver).not.toHaveBeenCalled()
  })

  // Sprint 5: Profile conversion modal
  it('shows profile modal when clicking Collect More Words without a profile', async () => {
    const user = userEvent.setup()
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} hasProfile={false} onCreateProfile={() => {}} />)
    await user.click(screen.getByTestId('parent-reviewed-checkbox'))
    await user.click(screen.getByRole('button', { name: /collect more words/i }))
    expect(screen.getByTestId('profile-modal')).toBeInTheDocument()
    expect(screen.getByText(/save your progress/i)).toBeInTheDocument()
  })

  it('does not show profile modal when user has a profile', async () => {
    const user = userEvent.setup()
    const onStartOver = vi.fn()
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={onStartOver} hasProfile={true} />)
    await user.click(screen.getByTestId('parent-reviewed-checkbox'))
    await user.click(screen.getByRole('button', { name: /collect more words/i }))
    expect(screen.queryByTestId('profile-modal')).not.toBeInTheDocument()
    expect(onStartOver).toHaveBeenCalled()
  })

  it('calls onCreateProfile from profile modal', async () => {
    const user = userEvent.setup()
    const onCreateProfile = vi.fn()
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={() => {}} hasProfile={false} onCreateProfile={onCreateProfile} />)
    await user.click(screen.getByTestId('parent-reviewed-checkbox'))
    await user.click(screen.getByRole('button', { name: /collect more words/i }))
    await user.click(screen.getByRole('button', { name: /create a profile/i }))
    expect(onCreateProfile).toHaveBeenCalled()
  })

  it('allows continuing without profile from modal', async () => {
    const user = userEvent.setup()
    const onStartOver = vi.fn()
    render(<Complete words={words} collectedWords={collectedWords} onStartOver={onStartOver} hasProfile={false} onCreateProfile={() => {}} />)
    await user.click(screen.getByTestId('parent-reviewed-checkbox'))
    await user.click(screen.getByRole('button', { name: /collect more words/i }))
    await user.click(screen.getByText(/continue without a profile/i))
    expect(onStartOver).toHaveBeenCalled()
  })
})
