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

  // Sprint 1: Navigation & Profile Options on Main Menu
  it('shows Switch Profile button when onBackToProfiles is provided', () => {
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} onBackToProfiles={() => {}} />)
    expect(screen.getByRole('button', { name: /switch profile/i })).toBeInTheDocument()
  })

  it('does not show Switch Profile button when onBackToProfiles is not provided', () => {
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    expect(screen.queryByRole('button', { name: /switch profile/i })).not.toBeInTheDocument()
  })

  it('calls onBackToProfiles when Switch Profile is clicked', async () => {
    const user = userEvent.setup()
    const onBackToProfiles = vi.fn()
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} onBackToProfiles={onBackToProfiles} />)
    await user.click(screen.getByRole('button', { name: /switch profile/i }))
    expect(onBackToProfiles).toHaveBeenCalled()
  })

  // Sprint 6: Practice History Drill-Down
  it('navigates to session detail when a history entry is clicked', async () => {
    const user = userEvent.setup()
    saveSession({
      listName: 'Week 2',
      words: ['apple', 'banana'],
      typedWords: ['appel', 'banana'],
      theme: 'garden',
      mode: 'standard',
    })
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /view history/i }))
    await user.click(screen.getByText('Week 2'))
    // Should show session detail view
    expect(screen.getByTestId('session-word-0')).toBeInTheDocument()
    expect(screen.getByTestId('session-word-1')).toBeInTheDocument()
  })

  it('shows correct/incorrect breakdown in session detail', async () => {
    const user = userEvent.setup()
    saveSession({
      listName: 'Week 3',
      words: ['apple', 'banana'],
      typedWords: ['appel', 'banana'],
      theme: 'garden',
      mode: 'standard',
    })
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /view history/i }))
    await user.click(screen.getByText('Week 3'))
    // banana is correct
    expect(screen.getByText('banana')).toBeInTheDocument()
    // appel is incorrect, should show correct spelling
    expect(screen.getByText('appel')).toBeInTheDocument()
    expect(screen.getByText('(correct: apple)')).toBeInTheDocument()
  })

  it('navigates back from session detail to history', async () => {
    const user = userEvent.setup()
    saveSession({
      listName: 'Week 4',
      words: ['cat'],
      typedWords: ['cat'],
      theme: 'garden',
      mode: 'standard',
    })
    render(<WordListSetup onStart={() => {}} onSelectList={() => {}} />)
    await user.click(screen.getByRole('button', { name: /view history/i }))
    await user.click(screen.getByText('Week 4'))
    await user.click(screen.getByText('Back to History'))
    expect(screen.getByText('Practice History')).toBeInTheDocument()
  })
})
