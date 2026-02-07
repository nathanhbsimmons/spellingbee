import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Practice from './Practice'

// Mock speechSynthesis and SpeechSynthesisUtterance
const mockSpeak = vi.fn()
const mockCancel = vi.fn()

class MockUtterance {
  constructor(text) {
    this.text = text
    this.rate = 1
    this.voice = null
    this.onstart = null
    this.onend = null
    this.onerror = null
  }
}

beforeEach(() => {
  window.SpeechSynthesisUtterance = MockUtterance
  window.speechSynthesis = {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: () => [],
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  mockSpeak.mockClear()
  mockCancel.mockClear()
})

const defaultProps = {
  words: ['apple', 'banana', 'cherry'],
  collectedWords: [],
  onCollect: vi.fn(),
  onComplete: vi.fn(),
}

describe('Practice', () => {
  it('shows the current word counter', () => {
    render(<Practice {...defaultProps} />)
    expect(screen.getByText('Word 1 of 3')).toBeInTheDocument()
  })

  it('shows underscore placeholders matching word length', () => {
    render(<Practice {...defaultProps} />)
    expect(screen.getByText('_ _ _ _ _')).toBeInTheDocument()
  })

  it('disables the Next Word button when input is empty', () => {
    render(<Practice {...defaultProps} />)
    expect(screen.getByRole('button', { name: /next word/i })).toBeDisabled()
  })

  it('calls onCollect with typed word when Next is clicked', async () => {
    const user = userEvent.setup()
    const onCollect = vi.fn()
    render(<Practice {...defaultProps} onCollect={onCollect} />)
    await user.type(screen.getByPlaceholderText(/type the word/i), 'appel')
    await user.click(screen.getByRole('button', { name: /next word/i }))
    expect(onCollect).toHaveBeenCalledWith('appel')
  })

  it('calls onCollect when Enter key is pressed', async () => {
    const user = userEvent.setup()
    const onCollect = vi.fn()
    render(<Practice {...defaultProps} onCollect={onCollect} />)
    await user.type(screen.getByPlaceholderText(/type the word/i), 'appel{Enter}')
    expect(onCollect).toHaveBeenCalledWith('appel')
  })

  it('advances the word counter as words are collected', () => {
    render(<Practice {...defaultProps} collectedWords={['appel']} />)
    expect(screen.getByText('Word 2 of 3')).toBeInTheDocument()
  })

  it('shows Finish Collecting on the last word', () => {
    render(<Practice {...defaultProps} collectedWords={['appel', 'banan']} />)
    expect(screen.getByRole('button', { name: /finish collecting/i })).toBeInTheDocument()
  })

  it('calls onComplete after collecting the last word', async () => {
    const user = userEvent.setup()
    const onCollect = vi.fn()
    const onComplete = vi.fn()
    render(
      <Practice
        {...defaultProps}
        collectedWords={['appel', 'banan']}
        onCollect={onCollect}
        onComplete={onComplete}
      />
    )
    await user.type(screen.getByPlaceholderText(/type the word/i), 'chery')
    await user.click(screen.getByRole('button', { name: /finish collecting/i }))
    expect(onCollect).toHaveBeenCalledWith('chery')
    expect(onComplete).toHaveBeenCalled()
  })

  // Sprint 2: Audio tests
  it('renders the Play Word button when speech is supported', () => {
    render(<Practice {...defaultProps} />)
    expect(screen.getByRole('button', { name: /play word/i })).toBeInTheDocument()
  })

  it('auto-plays the word on mount', () => {
    render(<Practice {...defaultProps} />)
    expect(mockSpeak).toHaveBeenCalled()
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('apple')
  })

  it('plays the word when Play Word button is clicked', async () => {
    const user = userEvent.setup()
    render(<Practice {...defaultProps} />)
    mockSpeak.mockClear()
    await user.click(screen.getByRole('button', { name: /play word/i }))
    expect(mockSpeak).toHaveBeenCalled()
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('apple')
  })

  it('shows auto-play checkbox that is checked by default', () => {
    render(<Practice {...defaultProps} />)
    expect(screen.getByLabelText(/auto-play/i)).toBeChecked()
  })

  it('shows fallback message when speech is not supported', () => {
    delete window.speechSynthesis
    render(<Practice {...defaultProps} />)
    expect(screen.getByText(/audio playback is not supported/i)).toBeInTheDocument()
  })

  // Sprint 8: Scramble mode tests
  it('shows scrambled letters in scramble mode', () => {
    render(<Practice {...defaultProps} mode="scramble" />)
    const scrambled = screen.getByTestId('scrambled-word')
    expect(scrambled).toBeInTheDocument()
    // Scrambled word should have same length as original
    expect(scrambled.textContent).toHaveLength('apple'.length)
    expect(screen.getByText(/unscramble the letters/i)).toBeInTheDocument()
  })

  it('shows Play Word button in scramble mode', () => {
    render(<Practice {...defaultProps} mode="scramble" />)
    expect(screen.getByRole('button', { name: /play word/i })).toBeInTheDocument()
  })

  it('auto-plays audio in scramble mode', () => {
    mockSpeak.mockClear()
    render(<Practice {...defaultProps} mode="scramble" />)
    expect(mockSpeak).toHaveBeenCalled()
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('apple')
  })

  it('still allows typing and collecting in scramble mode', async () => {
    const user = userEvent.setup()
    const onCollect = vi.fn()
    render(<Practice {...defaultProps} mode="scramble" onCollect={onCollect} />)
    await user.type(screen.getByPlaceholderText(/type the word/i), 'apple')
    await user.click(screen.getByRole('button', { name: /next word/i }))
    expect(onCollect).toHaveBeenCalledWith('apple')
  })

  // Sprint 8: Context sentences tests
  it('shows context sentence when provided', () => {
    const sentences = { apple: 'The ___ fell from the tree.' }
    render(<Practice {...defaultProps} sentences={sentences} />)
    expect(screen.getByTestId('context-sentence')).toBeInTheDocument()
    expect(screen.getByText(/"The ___ fell from the tree."/)).toBeInTheDocument()
  })

  it('does not show context sentence when not provided', () => {
    render(<Practice {...defaultProps} />)
    expect(screen.queryByTestId('context-sentence')).not.toBeInTheDocument()
  })

  // Back/quit button tests
  it('shows quit practice button when onBack is provided', () => {
    render(<Practice {...defaultProps} onBack={() => {}} />)
    expect(screen.getByText('Quit Practice')).toBeInTheDocument()
  })

  it('calls onBack when quit practice is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<Practice {...defaultProps} onBack={onBack} />)
    await user.click(screen.getByText('Quit Practice'))
    expect(onBack).toHaveBeenCalled()
  })
})
