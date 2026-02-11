import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminPanel from './AdminPanel'
import { renderWithFamily, createMockWordList, createMockProfile, createMockSession } from '../test/utils'
import { loadWordLists, createWordList, getPin, verifyPin, loadSessions, loadProfiles, createProfile as createProfileDb } from '../db'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('AdminPanel', () => {
  it('shows word lists view when no PIN is set', async () => {
    getPin.mockResolvedValue(null)
    loadWordLists.mockResolvedValue([])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('Word Lists')).toBeInTheDocument()
    })
  })

  it('shows word lists view even when a PIN is set (viewing is free)', async () => {
    getPin.mockResolvedValue('1234')
    const lists = [createMockWordList({ name: 'Week 1', words: ['apple'] })]
    loadWordLists.mockResolvedValue(lists)
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('Word Lists')).toBeInTheDocument()
      expect(screen.getByText('Week 1')).toBeInTheDocument()
    })
  })

  it('prompts for PIN when trying to edit with PIN set', async () => {
    const user = userEvent.setup()
    getPin.mockResolvedValue('1234')
    const lists = [createMockWordList({ name: 'Week 1', words: ['apple'] })]
    loadWordLists.mockResolvedValue(lists)
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByText('Week 1'))
    await user.click(screen.getByText('Edit'))

    await waitFor(() => {
      expect(screen.getByText('Parent Access')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/enter pin/i)).toBeInTheDocument()
    })
  })

  it('unlocks edit with correct PIN', async () => {
    const user = userEvent.setup()
    getPin.mockResolvedValue('1234')
    verifyPin.mockResolvedValue(true)
    const lists = [createMockWordList({ name: 'Week 1', words: ['apple'] })]
    loadWordLists.mockResolvedValue(lists)
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByText('Week 1'))
    await user.click(screen.getByText('Edit'))
    await waitFor(() => screen.getByPlaceholderText(/enter pin/i))
    await user.type(screen.getByPlaceholderText(/enter pin/i), '1234')
    await user.click(screen.getByRole('button', { name: /unlock/i }))

    await waitFor(() => {
      expect(screen.getByText('Edit Word List')).toBeInTheDocument()
    })
  })

  it('shows error on wrong PIN', async () => {
    const user = userEvent.setup()
    getPin.mockResolvedValue('1234')
    verifyPin.mockResolvedValue(false)
    const lists = [createMockWordList({ name: 'Week 1', words: ['apple'] })]
    loadWordLists.mockResolvedValue(lists)
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByText('Week 1'))
    await user.click(screen.getByText('Edit'))
    await waitFor(() => screen.getByPlaceholderText(/enter pin/i))
    await user.type(screen.getByPlaceholderText(/enter pin/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /unlock/i }))

    await waitFor(() => {
      expect(screen.getByText('Incorrect PIN')).toBeInTheDocument()
    })
  })

  it('shows empty state message when no lists', async () => {
    getPin.mockResolvedValue(null)
    loadWordLists.mockResolvedValue([])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText(/no word lists yet/i)).toBeInTheDocument()
    })
  })

  it('shows existing word lists', async () => {
    getPin.mockResolvedValue(null)
    const lists = [createMockWordList({ name: 'Week 1', words: ['apple', 'banana'] })]
    loadWordLists.mockResolvedValue(lists)
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('Week 1')).toBeInTheDocument()
      expect(screen.getByText('2 words')).toBeInTheDocument()
    })
  })

  it('creates a new word list', async () => {
    const user = userEvent.setup()
    getPin.mockResolvedValue(null)
    loadWordLists.mockResolvedValueOnce([]).mockResolvedValueOnce([createMockWordList({ name: 'Week 2', words: ['cherry', 'grape'] })])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])
    createWordList.mockResolvedValue('new-list-id')

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /create new list/i }))
    await user.click(screen.getByRole('button', { name: /create new list/i }))
    await waitFor(() => screen.getByPlaceholderText(/list name/i))
    await user.type(screen.getByPlaceholderText(/list name/i), 'Week 2')
    await user.type(screen.getByPlaceholderText(/beautiful/i), 'cherry\ngrape')
    await user.click(screen.getByRole('button', { name: /create list/i }))

    await waitFor(() => {
      expect(createWordList).toHaveBeenCalledWith(
        'test-family-id',
        'Week 2',
        ['cherry', 'grape'],
        {}
      )
    })
  })

  it('selects a list and calls onSelectList', async () => {
    const user = userEvent.setup()
    const onSelectList = vi.fn()
    getPin.mockResolvedValue(null)
    const list = createMockWordList({ name: 'Week 1', words: ['apple'] })
    loadWordLists.mockResolvedValue([list])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={onSelectList} onClose={() => {}} />)
    await waitFor(() => screen.getByText('Week 1'))
    await user.click(screen.getByText('Week 1'))

    expect(onSelectList).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Week 1', words: ['apple'] })
    )
  })

  it('deletes a word list', async () => {
    const user = userEvent.setup()
    getPin.mockResolvedValue(null)
    const list = createMockWordList({ name: 'Week 1', words: ['apple'] })
    loadWordLists.mockResolvedValueOnce([list]).mockResolvedValueOnce([])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByText('Week 1'))
    await user.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(screen.queryByText('Week 1')).not.toBeInTheDocument()
    })
  })

  it('calls onClose when Back is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    getPin.mockResolvedValue(null)
    loadWordLists.mockResolvedValue([])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={onClose} />)
    await waitFor(() => screen.getByText('Back'))
    await user.click(screen.getByText('Back'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows profiles view with existing profiles', async () => {
    const user = userEvent.setup()
    getPin.mockResolvedValue(null)
    const profiles = [createMockProfile({ name: 'Alice' })]
    loadWordLists.mockResolvedValue([])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue(profiles)

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /profiles/i }))
    await user.click(screen.getByRole('button', { name: /profiles/i }))

    await waitFor(() => {
      expect(screen.getByText('Manage Profiles')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
  })

  it('creates a new profile from profiles view', async () => {
    const user = userEvent.setup()
    getPin.mockResolvedValue(null)
    loadWordLists.mockResolvedValue([])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValueOnce([]).mockResolvedValueOnce([createMockProfile({ name: 'Bob' })])
    createProfileDb.mockResolvedValue('new-profile-id')

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /profiles/i }))
    await user.click(screen.getByRole('button', { name: /profiles/i }))
    await waitFor(() => screen.getByPlaceholderText(/child's name/i))
    await user.type(screen.getByPlaceholderText(/child's name/i), 'Bob')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => {
      expect(createProfileDb).toHaveBeenCalledWith('test-family-id', 'Bob')
    })
  })

  it('shows sentence fields when words are entered in create form', async () => {
    const user = userEvent.setup()
    getPin.mockResolvedValue(null)
    loadWordLists.mockResolvedValue([])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /create new list/i }))
    await user.click(screen.getByRole('button', { name: /create new list/i }))
    await waitFor(() => screen.getByPlaceholderText(/beautiful/i))
    await user.type(screen.getByPlaceholderText(/beautiful/i), 'apple\nbanana')

    expect(screen.getByTestId('sentence-fields')).toBeInTheDocument()
  })

  it('cancels PIN prompt and returns to lists', async () => {
    const user = userEvent.setup()
    getPin.mockResolvedValue('1234')
    const list = createMockWordList({ name: 'Week 1', words: ['apple'] })
    loadWordLists.mockResolvedValue([list])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByText('Week 1'))
    await user.click(screen.getByText('Edit'))
    await waitFor(() => screen.getByText('Parent Access'))
    await user.click(screen.getByText('Cancel'))

    await waitFor(() => {
      expect(screen.getByText('Word Lists')).toBeInTheDocument()
    })
  })

  it('shows history without PIN', async () => {
    const user = userEvent.setup()
    getPin.mockResolvedValue('1234')
    loadWordLists.mockResolvedValue([])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /history/i }))
    await user.click(screen.getByRole('button', { name: /history/i }))

    await waitFor(() => {
      expect(screen.getByText('Practice History')).toBeInTheDocument()
    })
  })

  it('shows Go to Profile Selection button in profiles view when onBackToProfiles is provided', async () => {
    const user = userEvent.setup()
    getPin.mockResolvedValue(null)
    loadWordLists.mockResolvedValue([])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} onBackToProfiles={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /profiles/i }))
    await user.click(screen.getByRole('button', { name: /profiles/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /go to profile selection/i })).toBeInTheDocument()
    })
  })

  it('does not show Go to Profile Selection button when onBackToProfiles is not provided', async () => {
    const user = userEvent.setup()
    getPin.mockResolvedValue(null)
    loadWordLists.mockResolvedValue([])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /profiles/i }))
    await user.click(screen.getByRole('button', { name: /profiles/i }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /go to profile selection/i })).not.toBeInTheDocument()
    })
  })

  it('calls onBackToProfiles when Go to Profile Selection is clicked', async () => {
    const user = userEvent.setup()
    const onBackToProfiles = vi.fn()
    getPin.mockResolvedValue(null)
    loadWordLists.mockResolvedValue([])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} onBackToProfiles={onBackToProfiles} />)
    await waitFor(() => screen.getByRole('button', { name: /profiles/i }))
    await user.click(screen.getByRole('button', { name: /profiles/i }))
    await waitFor(() => screen.getByRole('button', { name: /go to profile selection/i }))
    await user.click(screen.getByRole('button', { name: /go to profile selection/i }))

    expect(onBackToProfiles).toHaveBeenCalled()
  })

  it('allows full flow: add profile then navigate to profile selection', async () => {
    const user = userEvent.setup()
    const onBackToProfiles = vi.fn()
    getPin.mockResolvedValue(null)
    loadWordLists.mockResolvedValue([])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValueOnce([]).mockResolvedValueOnce([createMockProfile({ name: 'Charlie' })])
    createProfileDb.mockResolvedValue('new-profile-id')

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} onBackToProfiles={onBackToProfiles} />)
    await waitFor(() => screen.getByRole('button', { name: /profiles/i }))
    await user.click(screen.getByRole('button', { name: /profiles/i }))
    await waitFor(() => screen.getByPlaceholderText(/child's name/i))
    await user.type(screen.getByPlaceholderText(/child's name/i), 'Charlie')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => screen.getByText('Charlie'))
    await user.click(screen.getByRole('button', { name: /go to profile selection/i }))
    expect(onBackToProfiles).toHaveBeenCalled()
  })
})
