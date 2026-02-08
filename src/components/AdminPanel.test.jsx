import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminPanel from './AdminPanel'
import { createWordList, setPin, createProfile } from '../storage'

beforeEach(() => {
  localStorage.clear()
})

describe('AdminPanel', () => {
  it('shows word lists view when no PIN is set', () => {
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    expect(screen.getByText('Word Lists')).toBeInTheDocument()
  })

  it('shows word lists view even when a PIN is set (viewing is free)', () => {
    setPin('1234')
    createWordList('Week 1', ['apple'])
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    expect(screen.getByText('Word Lists')).toBeInTheDocument()
    expect(screen.getByText('Week 1')).toBeInTheDocument()
  })

  it('prompts for PIN when trying to edit with PIN set', async () => {
    const user = userEvent.setup()
    setPin('1234')
    createWordList('Week 1', ['apple'])
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await user.click(screen.getByText('Edit'))
    expect(screen.getByText('Parent Access')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter pin/i)).toBeInTheDocument()
  })

  it('unlocks edit with correct PIN', async () => {
    const user = userEvent.setup()
    setPin('1234')
    createWordList('Week 1', ['apple'])
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await user.click(screen.getByText('Edit'))
    await user.type(screen.getByPlaceholderText(/enter pin/i), '1234')
    await user.click(screen.getByRole('button', { name: /unlock/i }))
    expect(screen.getByText('Edit Word List')).toBeInTheDocument()
  })

  it('shows error on wrong PIN', async () => {
    const user = userEvent.setup()
    setPin('1234')
    createWordList('Week 1', ['apple'])
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await user.click(screen.getByText('Edit'))
    await user.type(screen.getByPlaceholderText(/enter pin/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /unlock/i }))
    expect(screen.getByText('Incorrect PIN')).toBeInTheDocument()
  })

  it('shows empty state message when no lists', () => {
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    expect(screen.getByText(/no word lists yet/i)).toBeInTheDocument()
  })

  it('shows existing word lists', () => {
    createWordList('Week 1', ['apple', 'banana'])
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    expect(screen.getByText('Week 1')).toBeInTheDocument()
    expect(screen.getByText('2 words')).toBeInTheDocument()
  })

  it('creates a new word list', async () => {
    const user = userEvent.setup()
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /create new list/i }))
    await user.type(screen.getByPlaceholderText(/list name/i), 'Week 2')
    await user.type(screen.getByPlaceholderText(/beautiful/i), 'cherry\ngrape')
    await user.click(screen.getByRole('button', { name: /create list/i }))
    expect(screen.getByText('Week 2')).toBeInTheDocument()
  })

  it('selects a list and calls onSelectList', async () => {
    const user = userEvent.setup()
    const onSelectList = vi.fn()
    createWordList('Week 1', ['apple'])
    render(<AdminPanel onSelectList={onSelectList} onClose={() => {}} />)
    await user.click(screen.getByText('Week 1'))
    expect(onSelectList).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Week 1', words: ['apple'] })
    )
  })

  it('deletes a word list', async () => {
    const user = userEvent.setup()
    createWordList('Week 1', ['apple'])
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await user.click(screen.getByText('Delete'))
    expect(screen.queryByText('Week 1')).not.toBeInTheDocument()
  })

  it('calls onClose when Back is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AdminPanel onSelectList={() => {}} onClose={onClose} />)
    await user.click(screen.getByText('Back'))
    expect(onClose).toHaveBeenCalled()
  })

  // Profiles view
  it('shows profiles view with existing profiles', async () => {
    const user = userEvent.setup()
    createProfile('Alice')
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /profiles/i }))
    expect(screen.getByText('Manage Profiles')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('creates a new profile from profiles view', async () => {
    const user = userEvent.setup()
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /profiles/i }))
    await user.type(screen.getByPlaceholderText(/child's name/i), 'Bob')
    await user.click(screen.getByRole('button', { name: /add/i }))
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  // Context sentences in create form
  it('shows sentence fields when words are entered in create form', async () => {
    const user = userEvent.setup()
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /create new list/i }))
    await user.type(screen.getByPlaceholderText(/beautiful/i), 'apple\nbanana')
    expect(screen.getByTestId('sentence-fields')).toBeInTheDocument()
  })

  // PIN prompt cancellation
  it('cancels PIN prompt and returns to lists', async () => {
    const user = userEvent.setup()
    setPin('1234')
    createWordList('Week 1', ['apple'])
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await user.click(screen.getByText('Edit'))
    expect(screen.getByText('Parent Access')).toBeInTheDocument()
    await user.click(screen.getByText('Cancel'))
    expect(screen.getByText('Word Lists')).toBeInTheDocument()
  })

  // History accessible without PIN
  it('shows history without PIN', async () => {
    const user = userEvent.setup()
    setPin('1234')
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /history/i }))
    expect(screen.getByText('Practice History')).toBeInTheDocument()
  })

  // Sprint 7: Broken Navigation Loop in Profile Management
  it('shows Go to Profile Selection button in profiles view when onBackToProfiles is provided', async () => {
    const user = userEvent.setup()
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} onBackToProfiles={() => {}} />)
    await user.click(screen.getByRole('button', { name: /profiles/i }))
    expect(screen.getByRole('button', { name: /go to profile selection/i })).toBeInTheDocument()
  })

  it('does not show Go to Profile Selection button when onBackToProfiles is not provided', async () => {
    const user = userEvent.setup()
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /profiles/i }))
    expect(screen.queryByRole('button', { name: /go to profile selection/i })).not.toBeInTheDocument()
  })

  it('calls onBackToProfiles when Go to Profile Selection is clicked', async () => {
    const user = userEvent.setup()
    const onBackToProfiles = vi.fn()
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} onBackToProfiles={onBackToProfiles} />)
    await user.click(screen.getByRole('button', { name: /profiles/i }))
    await user.click(screen.getByRole('button', { name: /go to profile selection/i }))
    expect(onBackToProfiles).toHaveBeenCalled()
  })

  it('allows full flow: add profile then navigate to profile selection', async () => {
    const user = userEvent.setup()
    const onBackToProfiles = vi.fn()
    render(<AdminPanel onSelectList={() => {}} onClose={() => {}} onBackToProfiles={onBackToProfiles} />)
    await user.click(screen.getByRole('button', { name: /profiles/i }))
    // Add a new profile
    await user.type(screen.getByPlaceholderText(/child's name/i), 'Charlie')
    await user.click(screen.getByRole('button', { name: /add/i }))
    expect(screen.getByText('Charlie')).toBeInTheDocument()
    // Navigate to profile selection
    await user.click(screen.getByRole('button', { name: /go to profile selection/i }))
    expect(onBackToProfiles).toHaveBeenCalled()
  })
})
