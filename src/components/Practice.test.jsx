import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

  it('auto-plays the word on mount', async () => {
    mockSpeak.mockClear()
    render(<Practice {...defaultProps} />)
    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled()
    })
    const lastCall = mockSpeak.mock.calls[mockSpeak.mock.calls.length - 1]
    expect(lastCall[0].text).toBe('apple')
  })

  it('plays the word when Play Word button is clicked', async () => {
    const user = userEvent.setup()
    render(<Practice {...defaultProps} />)
    mockSpeak.mockClear()
    await user.click(screen.getByRole('button', { name: /play word/i }))
    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled()
    })
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

  it('does not auto-play audio in scramble mode', () => {
    mockSpeak.mockClear()
    render(<Practice {...defaultProps} mode="scramble" />)
    expect(mockSpeak).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/auto-play/i)).not.toBeChecked()
  })

  it('shows the sentence button in scramble mode', () => {
    const sentences = { apple: 'The ___ fell from the tree.' }
    render(<Practice {...defaultProps} mode="scramble" sentences={sentences} />)
    expect(screen.getByRole('button', { name: /play in a sentence/i })).toBeInTheDocument()
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

  it('masks the word and its variants in the sentence', () => {
    const sentences = { apple: 'An Apple a day. Apples are red. The applesauce and the apple pie.' }
    render(<Practice {...defaultProps} sentences={sentences} />)
    const shown = screen.getByTestId('context-sentence').textContent
    expect(shown).not.toMatch(/apple/i)
    expect(shown).toBe('"An ____ a day. ____ are red. The ____ and the ____ pie."')
  })

  it('does not mask unrelated words that merely contain the word', () => {
    const sentences = { cat: 'The catalog has a cat and a category.' }
    render(<Practice {...defaultProps} words={['cat', 'dog']} sentences={sentences} />)
    expect(screen.getByTestId('context-sentence').textContent).toBe(
      '"The catalog has a ____ and a category."',
    )
  })

  it('speaks the word then the sentence with the blank filled in', async () => {
    const user = userEvent.setup()
    const sentences = { apple: 'The ___ fell from the tree.' }
    render(<Practice {...defaultProps} sentences={sentences} />)
    mockSpeak.mockClear()
    await user.click(screen.getByRole('button', { name: /play in a sentence/i }))
    expect(mockSpeak.mock.calls[0][0].text).toBe('apple. The apple fell from the tree.')
    expect(screen.getByTestId('context-sentence').textContent).toContain('___')
  })

  it('plays the word slowly with the Slow button', async () => {
    const user = userEvent.setup()
    render(<Practice {...defaultProps} />)
    mockSpeak.mockClear()
    await user.click(screen.getByRole('button', { name: /slow/i }))
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('apple')
    expect(utterance.rate).toBe(0.5)
  })

  it('speaks the next word from the Next click, not from an effect', async () => {
    const user = userEvent.setup()
    render(<Practice {...defaultProps} />)
    await user.type(screen.getByPlaceholderText(/type the word/i), 'appel')
    mockSpeak.mockClear()
    await user.click(screen.getByRole('button', { name: /next word/i }))
    expect(mockSpeak).toHaveBeenCalledTimes(1)
    expect(mockSpeak.mock.calls[0][0].text).toBe('banana')
  })

  it('shows Skip for now and calls onSkip', async () => {
    const user = userEvent.setup()
    const onSkip = vi.fn()
    render(<Practice {...defaultProps} onSkip={onSkip} />)
    await user.click(screen.getByRole('button', { name: /skip for now/i }))
    expect(onSkip).toHaveBeenCalled()
  })

  it('hides Skip for now on the last word', () => {
    render(<Practice {...defaultProps} collectedWords={['appel', 'banan']} onSkip={() => {}} />)
    expect(screen.queryByRole('button', { name: /skip for now/i })).not.toBeInTheDocument()
  })

  it('offers Not sure, move on for a word already skipped, collecting a blank', async () => {
    const user = userEvent.setup()
    const onCollect = vi.fn()
    render(
      <Practice
        {...defaultProps}
        onSkip={() => {}}
        onCollect={onCollect}
        skippedWords={['apple']}
      />
    )
    expect(screen.queryByRole('button', { name: /skip for now/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /not sure, move on/i }))
    expect(onCollect).toHaveBeenCalledWith('')
  })

  it('completes with a blank when left blank on the last word', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(
      <Practice
        {...defaultProps}
        words={['apple', 'banana', 'cherry']}
        collectedWords={['appel', 'banan']}
        onSkip={() => {}}
        onComplete={onComplete}
        skippedWords={['cherry']}
      />
    )
    await user.click(screen.getByRole('button', { name: /not sure, move on/i }))
    expect(onComplete).toHaveBeenCalledWith(['appel', 'banan', ''])
  })

  it('does not pass blank answers to the theme visualization', () => {
    const Viz = vi.fn(() => null)
    render(
      <Practice {...defaultProps} collectedWords={['appel', '']} ThemeVisualization={Viz} />
    )
    expect(Viz.mock.calls[0][0]).toEqual({ collectedWords: ['appel'], latestIndex: -1 })
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
