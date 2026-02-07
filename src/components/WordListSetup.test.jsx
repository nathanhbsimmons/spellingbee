import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WordListSetup from './WordListSetup'
import { createWordList, saveSession } from '../storage'

beforeEach(() => {
  localStorage.clear()
})

describe('WordListSetup', () => {
  // Hub view tests
  it('renders the hub with title', () => {
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    expect(screen.getByText('Spelling Word Collector')).toBeInTheDocument()
    expect(screen.getByText(/choose how you'd like to practice/i)).toBeInTheDocument()
  })

  it('shows Quick Practice and View History buttons on hub', () => {
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    expect(screen.getByRole('button', { name: /quick practice/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view history/i })).toBeInTheDocument()
  })

  it('shows saved word lists on hub when they exist', () => {
    createWordList('Week 1', ['apple', 'banana'])
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    expect(screen.getByText('Week 1')).toBeInTheDocument()
    expect(screen.getByText('2 words')).toBeInTheDocument()
  })

  it('calls onSelectList when a saved word list is clicked', async () => {
    const user = userEvent.setup()
    const onSelectList = vi.fn()
    createWordList('Week 1', ['apple'])
    render(<WordListSetup onStart={() => {}} onSelectList={onSelectList} />)
    await user.click(screen.getByText('Week 1'))
    expect(onSelectList).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Week 1', words: ['apple'] })
    )
  })

  it('does not show word lists section when no lists exist', () => {
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    expect(screen.queryByText('Your Word Lists')).not.toBeInTheDocument()
  })

  // Quick Practice view tests
  it('navigates to quick practice view and shows textarea', async () => {
    const user = userEvent.setup()
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /quick practice/i }))
    expect(screen.getByLabelText(/spelling words/i)).toBeInTheDocument()
  })

  it('disables the button when input is empty in quick practice', async () => {
    const user = userEvent.setup()
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /quick practice/i }))
    expect(screen.getByRole('button', { name: /start collecting/i })).toBeDisabled()
  })

  it('enables the button when words are entered', async () => {
    const user = userEvent.setup()
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /quick practice/i }))
    await user.type(screen.getByLabelText(/spelling words/i), 'hello')
    expect(screen.getByRole('button', { name: /start collecting/i })).toBeEnabled()
  })

  it('calls onStart with parsed word list on submit', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<WordListSetup onStart={onStart} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /quick practice/i }))
    await user.type(screen.getByLabelText(/spelling words/i), 'apple\nbanana\ncherry')
    await user.click(screen.getByRole('button', { name: /start collecting/i }))
    expect(onStart).toHaveBeenCalledWith(['apple', 'banana', 'cherry'])
  })

  it('trims whitespace and filters empty lines', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<WordListSetup onStart={onStart} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /quick practice/i }))
    await user.type(screen.getByLabelText(/spelling words/i), '  apple  \n\n  banana  ')
    await user.click(screen.getByRole('button', { name: /start collecting/i }))
    expect(onStart).toHaveBeenCalledWith(['apple', 'banana'])
  })

  it('does not call onStart if all lines are empty', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<WordListSetup onStart={onStart} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /quick practice/i }))
    await user.type(screen.getByLabelText(/spelling words/i), '   ')
    await user.click(screen.getByRole('button', { name: /start collecting/i }))
    expect(onStart).not.toHaveBeenCalled()
  })

  it('navigates back from quick practice to hub', async () => {
    const user = userEvent.setup()
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /quick practice/i }))
    expect(screen.getByLabelText(/spelling words/i)).toBeInTheDocument()
    await user.click(screen.getByText('Back'))
    expect(screen.getByText('Spelling Word Collector')).toBeInTheDocument()
  })

  // History view tests
  it('navigates to history view', async () => {
    const user = userEvent.setup()
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /view history/i }))
    expect(screen.getByText('Practice History')).toBeInTheDocument()
  })

  it('shows empty history message when no sessions', async () => {
    const user = userEvent.setup()
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /view history/i }))
    expect(screen.getByText(/no practice sessions yet/i)).toBeInTheDocument()
  })

  it('shows practice sessions in history', async () => {
    const user = userEvent.setup()
    saveSession({
      listName: 'Week 1',
      words: ['apple', 'banana'],
      typedWords: ['apple', 'bananna'],
      theme: 'garden',
      mode: 'standard',
    })
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /view history/i }))
    expect(screen.getByText('Week 1')).toBeInTheDocument()
    expect(screen.getByText(/1\/2 correct/)).toBeInTheDocument()
  })

  it('navigates back from history to hub', async () => {
    const user = userEvent.setup()
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /view history/i }))
    await user.click(screen.getByText('Back'))
    expect(screen.getByText('Spelling Word Collector')).toBeInTheDocument()
  })

  // Manage and tutorial tests
  it('shows How It Works button when onShowTutorial is provided', () => {
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} onShowTutorial={() => {}} />)
    expect(screen.getByText('How It Works')).toBeInTheDocument()
  })

  it('calls onShowTutorial when How It Works is clicked', async () => {
    const user = userEvent.setup()
    const onShowTutorial = vi.fn()
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} onShowTutorial={onShowTutorial} />)
    await user.click(screen.getByText('How It Works'))
    expect(onShowTutorial).toHaveBeenCalled()
  })

  it('does not show How It Works when onShowTutorial is not provided', () => {
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    expect(screen.queryByText('How It Works')).not.toBeInTheDocument()
  })

  it('shows Manage Word Lists button when onManageLists is provided', () => {
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} onManageLists={() => {}} />)
    expect(screen.getByText('Manage Word Lists')).toBeInTheDocument()
  })
})
