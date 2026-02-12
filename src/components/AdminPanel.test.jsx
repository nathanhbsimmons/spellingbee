import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminPanel from './AdminPanel'
import { renderWithFamily, createMockWordList, createMockProfile, createMockSession } from '../test/utils'
import {
  loadWordLists, createWordList, getPin, verifyPin, loadSessions, loadProfiles,
  createProfile as createProfileDb, getFamilyEmails, addFamilyEmail, removeFamilyEmail,
} from '../db'
import { httpsCallable } from 'firebase/functions'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

function setupMocks({ pin = null, lists = [], sessions = [], profiles = [] } = {}) {
  getPin.mockResolvedValue(pin)
  loadWordLists.mockResolvedValue(lists)
  loadSessions.mockResolvedValue(sessions)
  loadProfiles.mockResolvedValue(profiles)
}

describe('AdminPanel', () => {
  it('shows word lists view when no PIN is set', async () => {
    setupMocks()

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('Word Lists')).toBeInTheDocument()
    })
  })

  it('shows word lists view even when a PIN is set (viewing is free)', async () => {
    const lists = [createMockWordList({ name: 'Week 1', words: ['apple'] })]
    setupMocks({ pin: '1234', lists })

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('Word Lists')).toBeInTheDocument()
      expect(screen.getByText('Week 1')).toBeInTheDocument()
    })
  })

  it('lists view only shows word lists and Create New List (no History/Profiles/PIN/Settings grid)', async () => {
    setupMocks()

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByText('Word Lists'))

    expect(screen.getByRole('button', { name: /create new list/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /history/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /profiles/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /set pin/i })).not.toBeInTheDocument()
  })

  it('prompts for PIN when trying to edit with PIN set', async () => {
    const user = userEvent.setup()
    const lists = [createMockWordList({ name: 'Week 1', words: ['apple'] })]
    setupMocks({ pin: '1234', lists })

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
    setupMocks()

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText(/no word lists yet/i)).toBeInTheDocument()
    })
  })

  it('shows existing word lists', async () => {
    const lists = [createMockWordList({ name: 'Week 1', words: ['apple', 'banana'] })]
    setupMocks({ lists })

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
    const list = createMockWordList({ name: 'Week 1', words: ['apple'] })
    setupMocks({ lists: [list] })

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
    loadWordLists.mockResolvedValue([list])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValue([])

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByText('Week 1'))

    // After delete, loadWordLists returns empty
    loadWordLists.mockResolvedValue([])
    await user.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(screen.queryByText('Week 1')).not.toBeInTheDocument()
    })
  })

  it('calls onClose when Back is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    setupMocks()

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={onClose} />)
    await waitFor(() => screen.getByText('Back'))
    await user.click(screen.getByText('Back'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows sentence fields when words are entered in create form', async () => {
    const user = userEvent.setup()
    setupMocks()

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /create new list/i }))
    await user.click(screen.getByRole('button', { name: /create new list/i }))
    await waitFor(() => screen.getByPlaceholderText(/beautiful/i))
    await user.type(screen.getByPlaceholderText(/beautiful/i), 'apple\nbanana')

    expect(screen.getByTestId('sentence-fields')).toBeInTheDocument()
  })

  it('cancels PIN prompt and returns to lists', async () => {
    const user = userEvent.setup()
    const list = createMockWordList({ name: 'Week 1', words: ['apple'] })
    setupMocks({ pin: '1234', lists: [list] })

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByText('Week 1'))
    await user.click(screen.getByText('Edit'))
    await waitFor(() => screen.getByText('Parent Access'))
    await user.click(screen.getByText('Cancel'))

    await waitFor(() => {
      expect(screen.getByText('Word Lists')).toBeInTheDocument()
    })
  })

  // --- Settings Hub tests ---

  it('shows settings-hub view with initialView="settings-hub"', async () => {
    setupMocks()

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /history/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /profiles/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /set pin/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /manage emails/i })).toBeInTheDocument()
    })
  })

  it('shows history from settings-hub without PIN', async () => {
    const user = userEvent.setup()
    setupMocks({ pin: '1234' })

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /history/i }))
    await user.click(screen.getByRole('button', { name: /history/i }))

    await waitFor(() => {
      expect(screen.getByText('Practice History')).toBeInTheDocument()
    })
  })

  it('shows profiles view from settings-hub with existing profiles', async () => {
    const user = userEvent.setup()
    const profiles = [createMockProfile({ name: 'Alice' })]
    setupMocks({ profiles })

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /profiles/i }))
    await user.click(screen.getByRole('button', { name: /profiles/i }))

    await waitFor(() => {
      expect(screen.getByText('Manage Profiles')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
  })

  it('creates a new profile from settings-hub profiles view', async () => {
    const user = userEvent.setup()
    getPin.mockResolvedValue(null)
    loadWordLists.mockResolvedValue([])
    loadSessions.mockResolvedValue([])
    loadProfiles.mockResolvedValueOnce([]).mockResolvedValueOnce([createMockProfile({ name: 'Bob' })])
    createProfileDb.mockResolvedValue('new-profile-id')

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /profiles/i }))
    await user.click(screen.getByRole('button', { name: /profiles/i }))
    await waitFor(() => screen.getByPlaceholderText(/child's name/i))
    await user.type(screen.getByPlaceholderText(/child's name/i), 'Bob')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => {
      expect(createProfileDb).toHaveBeenCalledWith('test-family-id', 'Bob')
    })
  })

  it('shows Go to Profile Selection button in profiles view when onBackToProfiles is provided', async () => {
    const user = userEvent.setup()
    setupMocks()

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} onBackToProfiles={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /profiles/i }))
    await user.click(screen.getByRole('button', { name: /profiles/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /go to profile selection/i })).toBeInTheDocument()
    })
  })

  it('does not show Go to Profile Selection button when onBackToProfiles is not provided', async () => {
    const user = userEvent.setup()
    setupMocks()

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /profiles/i }))
    await user.click(screen.getByRole('button', { name: /profiles/i }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /go to profile selection/i })).not.toBeInTheDocument()
    })
  })

  it('calls onBackToProfiles when Go to Profile Selection is clicked', async () => {
    const user = userEvent.setup()
    const onBackToProfiles = vi.fn()
    setupMocks()

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} onBackToProfiles={onBackToProfiles} />)
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
    loadProfiles.mockResolvedValue([])
    createProfileDb.mockResolvedValue('new-profile-id')

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} onBackToProfiles={onBackToProfiles} />)
    await waitFor(() => screen.getByRole('button', { name: /profiles/i }))
    await user.click(screen.getByRole('button', { name: /profiles/i }))
    await waitFor(() => screen.getByPlaceholderText(/child's name/i))

    // After creating a profile, loadProfiles returns the new profile
    loadProfiles.mockResolvedValue([createMockProfile({ name: 'Charlie' })])
    await user.type(screen.getByPlaceholderText(/child's name/i), 'Charlie')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => screen.getByText('Charlie'))
    await user.click(screen.getByRole('button', { name: /go to profile selection/i }))
    expect(onBackToProfiles).toHaveBeenCalled()
  })

  it('navigates back from subview to settings-hub when started from settings-hub', async () => {
    const user = userEvent.setup()
    setupMocks()

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /history/i }))
    await user.click(screen.getByRole('button', { name: /history/i }))
    await waitFor(() => screen.getByText('Practice History'))
    await user.click(screen.getByText('Back'))

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  // --- Multi-email tests ---

  it('shows emails list in family-settings view', async () => {
    const user = userEvent.setup()
    setupMocks()
    getFamilyEmails.mockResolvedValue(['alice@example.com', 'bob@example.com'])

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /manage emails/i }))
    await user.click(screen.getByRole('button', { name: /manage emails/i }))

    await waitFor(() => {
      expect(screen.getByText('Manage Emails')).toBeInTheDocument()
      expect(screen.getByText('alice@example.com')).toBeInTheDocument()
      expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    })
  })

  it('shows empty state when no emails', async () => {
    const user = userEvent.setup()
    setupMocks()
    getFamilyEmails.mockResolvedValue([])

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /manage emails/i }))
    await user.click(screen.getByRole('button', { name: /manage emails/i }))

    await waitFor(() => {
      expect(screen.getByText(/no emails added yet/i)).toBeInTheDocument()
    })
  })

  it('adds a new email', async () => {
    const user = userEvent.setup()
    setupMocks()
    getFamilyEmails.mockResolvedValue(['existing@example.com'])
    addFamilyEmail.mockResolvedValue(true)

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /manage emails/i }))
    await user.click(screen.getByRole('button', { name: /manage emails/i }))

    await waitFor(() => screen.getByPlaceholderText(/add email/i))
    await user.type(screen.getByPlaceholderText(/add email/i), 'new@example.com')
    await user.click(screen.getByRole('button', { name: /^add$/i }))

    await waitFor(() => {
      expect(addFamilyEmail).toHaveBeenCalledWith('test-family-id', 'new@example.com')
      expect(screen.getByText('new@example.com')).toBeInTheDocument()
    })
  })

  it('removes an email', async () => {
    const user = userEvent.setup()
    setupMocks()
    getFamilyEmails.mockResolvedValue(['alice@example.com', 'bob@example.com'])
    removeFamilyEmail.mockResolvedValue(true)

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /manage emails/i }))
    await user.click(screen.getByRole('button', { name: /manage emails/i }))

    await waitFor(() => screen.getByText('alice@example.com'))

    // Click the first Remove button (for alice@example.com)
    const removeButtons = screen.getAllByText('Remove')
    await user.click(removeButtons[0])

    await waitFor(() => {
      expect(removeFamilyEmail).toHaveBeenCalledWith('test-family-id', 'alice@example.com')
      expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument()
    })
  })

  it('disables remove button when only one email remains', async () => {
    const user = userEvent.setup()
    setupMocks()
    getFamilyEmails.mockResolvedValue(['only@example.com'])

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /manage emails/i }))
    await user.click(screen.getByRole('button', { name: /manage emails/i }))

    await waitFor(() => screen.getByText('only@example.com'))
    expect(screen.getByText('Remove')).toBeDisabled()
  })

  it('shows resend join code button for each email', async () => {
    const user = userEvent.setup()
    setupMocks()
    getFamilyEmails.mockResolvedValue(['alice@example.com'])

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /manage emails/i }))
    await user.click(screen.getByRole('button', { name: /manage emails/i }))

    await waitFor(() => {
      expect(screen.getByText('Resend Join Code')).toBeInTheDocument()
    })
  })

  it('calls resend join code for a specific email', async () => {
    const user = userEvent.setup()
    setupMocks()
    getFamilyEmails.mockResolvedValue(['alice@example.com'])
    const mockCallable = vi.fn().mockResolvedValue({ data: { success: true } })
    httpsCallable.mockReturnValue(mockCallable)

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /manage emails/i }))
    await user.click(screen.getByRole('button', { name: /manage emails/i }))

    await waitFor(() => screen.getByText('Resend Join Code'))
    await user.click(screen.getByText('Resend Join Code'))

    await waitFor(() => {
      expect(mockCallable).toHaveBeenCalledWith({ familyId: 'test-family-id', email: 'alice@example.com' })
    })
  })

  it('navigates back from family-settings to settings-hub', async () => {
    const user = userEvent.setup()
    setupMocks()
    getFamilyEmails.mockResolvedValue([])

    renderWithFamily(<AdminPanel initialView="settings-hub" onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /manage emails/i }))
    await user.click(screen.getByRole('button', { name: /manage emails/i }))
    await waitFor(() => screen.getByText('Manage Emails'))
    await user.click(screen.getByText('Back'))

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  // --- AI Generate Sentences tests ---

  it('shows Generate with AI button when words are entered in create form', async () => {
    const user = userEvent.setup()
    setupMocks()

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /create new list/i }))
    await user.click(screen.getByRole('button', { name: /create new list/i }))
    await waitFor(() => screen.getByPlaceholderText(/beautiful/i))
    await user.type(screen.getByPlaceholderText(/beautiful/i), 'apple\nbanana')

    expect(screen.getByRole('button', { name: /generate with ai/i })).toBeInTheDocument()
  })

  it('does not show Generate with AI button when no words entered', async () => {
    const user = userEvent.setup()
    setupMocks()

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /create new list/i }))
    await user.click(screen.getByRole('button', { name: /create new list/i }))

    expect(screen.queryByRole('button', { name: /generate with ai/i })).not.toBeInTheDocument()
  })

  it('calls generateContextSentences and fills in sentence fields', async () => {
    const user = userEvent.setup()
    setupMocks()
    const mockCallable = vi.fn().mockResolvedValue({
      data: { sentences: { apple: 'The ___ fell from the tree.', banana: 'I ate a ___ for lunch.' } }
    })
    httpsCallable.mockReturnValue(mockCallable)

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /create new list/i }))
    await user.click(screen.getByRole('button', { name: /create new list/i }))
    await waitFor(() => screen.getByPlaceholderText(/beautiful/i))
    await user.type(screen.getByPlaceholderText(/beautiful/i), 'apple\nbanana')

    await user.click(screen.getByRole('button', { name: /generate with ai/i }))

    await waitFor(() => {
      expect(httpsCallable).toHaveBeenCalledWith(expect.anything(), 'generateContextSentences')
      expect(mockCallable).toHaveBeenCalledWith({ words: ['apple', 'banana'] })
    })

    // Verify the generated sentences appear in the input fields
    await waitFor(() => {
      const sentenceFields = screen.getByTestId('sentence-fields')
      const inputs = sentenceFields.querySelectorAll('input')
      expect(inputs[0].value).toBe('The ___ fell from the tree.')
      expect(inputs[1].value).toBe('I ate a ___ for lunch.')
    })
  })

  it('preserves manually-entered sentences when generating', async () => {
    const user = userEvent.setup()
    setupMocks()
    const mockCallable = vi.fn().mockResolvedValue({
      data: { sentences: { apple: 'AI sentence for apple.', banana: 'AI sentence for banana.' } }
    })
    httpsCallable.mockReturnValue(mockCallable)

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /create new list/i }))
    await user.click(screen.getByRole('button', { name: /create new list/i }))
    await waitFor(() => screen.getByPlaceholderText(/beautiful/i))
    await user.type(screen.getByPlaceholderText(/beautiful/i), 'apple\nbanana')

    // Manually type a sentence for apple
    const sentenceFields = screen.getByTestId('sentence-fields')
    const inputs = sentenceFields.querySelectorAll('input')
    await user.type(inputs[0], 'My manual sentence.')

    // Generate - should only fill banana, not overwrite apple
    await user.click(screen.getByRole('button', { name: /generate with ai/i }))

    await waitFor(() => {
      const updatedInputs = screen.getByTestId('sentence-fields').querySelectorAll('input')
      expect(updatedInputs[0].value).toBe('My manual sentence.')
      expect(updatedInputs[1].value).toBe('AI sentence for banana.')
    })
  })

  it('shows Generating... text while AI request is in progress', async () => {
    const user = userEvent.setup()
    setupMocks()
    // Create a promise we can control
    let resolveGenerate
    const mockCallable = vi.fn().mockImplementation(() => new Promise((resolve) => { resolveGenerate = resolve }))
    httpsCallable.mockReturnValue(mockCallable)

    renderWithFamily(<AdminPanel onSelectList={() => {}} onClose={() => {}} />)
    await waitFor(() => screen.getByRole('button', { name: /create new list/i }))
    await user.click(screen.getByRole('button', { name: /create new list/i }))
    await waitFor(() => screen.getByPlaceholderText(/beautiful/i))
    await user.type(screen.getByPlaceholderText(/beautiful/i), 'apple')

    await user.click(screen.getByRole('button', { name: /generate with ai/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generating/i })).toBeDisabled()
    })

    // Resolve the promise
    resolveGenerate({ data: { sentences: { apple: 'Test sentence.' } } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate with ai/i })).not.toBeDisabled()
    })
  })
})
