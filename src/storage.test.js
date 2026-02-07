import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadWordLists, saveWordLists, createWordList, updateWordList, deleteWordList,
  loadSessions, saveSession, getPin, setPin, verifyPin,
  loadProfiles, createProfile, deleteProfile, getActiveProfile, setActiveProfile,
  updateStreak, getStreak,
  hasSeenWelcome, dismissWelcome,
} from './storage'

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid-' + Math.random() })
})

describe('Word Lists', () => {
  it('returns empty array when no lists exist', () => {
    expect(loadWordLists()).toEqual([])
  })

  it('creates and loads a word list', () => {
    const list = createWordList('Week 1', ['apple', 'banana'])
    expect(list.name).toBe('Week 1')
    expect(list.words).toEqual(['apple', 'banana'])
    expect(list.id).toBeTruthy()
    expect(list.createdAt).toBeTruthy()

    const lists = loadWordLists()
    expect(lists).toHaveLength(1)
    expect(lists[0].name).toBe('Week 1')
  })

  it('updates a word list', () => {
    const list = createWordList('Week 1', ['apple'])
    const updated = updateWordList(list.id, { name: 'Week 2', words: ['cherry'] })
    expect(updated.name).toBe('Week 2')
    expect(updated.words).toEqual(['cherry'])

    const lists = loadWordLists()
    expect(lists[0].name).toBe('Week 2')
  })

  it('returns null when updating a nonexistent list', () => {
    expect(updateWordList('bad-id', { name: 'x' })).toBeNull()
  })

  it('deletes a word list', () => {
    const list = createWordList('Week 1', ['apple'])
    deleteWordList(list.id)
    expect(loadWordLists()).toHaveLength(0)
  })

  it('saves and loads multiple lists', () => {
    createWordList('Week 1', ['a'])
    createWordList('Week 2', ['b'])
    expect(loadWordLists()).toHaveLength(2)
  })
})

describe('Sessions', () => {
  it('returns empty array when no sessions exist', () => {
    expect(loadSessions()).toEqual([])
  })

  it('saves and loads sessions', () => {
    saveSession({ listName: 'Test', words: ['a'], typedWords: ['a'], theme: 'garden' })
    const sessions = loadSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].listName).toBe('Test')
    expect(sessions[0].completedAt).toBeTruthy()
  })
})

describe('PIN', () => {
  it('returns null when no PIN is set', () => {
    expect(getPin()).toBeNull()
  })

  it('verifyPin returns true when no PIN is set', () => {
    expect(verifyPin('anything')).toBe(true)
  })

  it('sets and verifies a PIN', () => {
    setPin('1234')
    expect(getPin()).toBe('1234')
    expect(verifyPin('1234')).toBe(true)
    expect(verifyPin('wrong')).toBe(false)
  })
})

describe('Word Lists with Sentences', () => {
  it('creates a word list with sentences', () => {
    const sentences = { apple: 'The ___ is red.', banana: 'I ate a ___.' }
    const list = createWordList('Week 1', ['apple', 'banana'], sentences)
    expect(list.sentences).toEqual(sentences)

    const lists = loadWordLists()
    expect(lists[0].sentences).toEqual(sentences)
  })

  it('defaults to empty sentences object', () => {
    const list = createWordList('Week 1', ['apple'])
    expect(list.sentences).toEqual({})
  })
})

describe('Profiles', () => {
  it('returns empty array when no profiles exist', () => {
    expect(loadProfiles()).toEqual([])
  })

  it('creates and loads a profile', () => {
    const profile = createProfile('Alice')
    expect(profile.name).toBe('Alice')
    expect(profile.id).toBeTruthy()

    const profiles = loadProfiles()
    expect(profiles).toHaveLength(1)
    expect(profiles[0].name).toBe('Alice')
  })

  it('deletes a profile', () => {
    const profile = createProfile('Alice')
    deleteProfile(profile.id)
    expect(loadProfiles()).toHaveLength(0)
  })

  it('clears active profile when deleted profile was active', () => {
    const profile = createProfile('Alice')
    setActiveProfile(profile)
    expect(getActiveProfile()).toEqual(profile)
    deleteProfile(profile.id)
    expect(getActiveProfile()).toBeNull()
  })

  it('sets and gets active profile', () => {
    const profile = createProfile('Bob')
    setActiveProfile(profile)
    expect(getActiveProfile()).toEqual(profile)
  })

  it('clears active profile when null is passed', () => {
    const profile = createProfile('Bob')
    setActiveProfile(profile)
    setActiveProfile(null)
    expect(getActiveProfile()).toBeNull()
  })
})

describe('Streaks', () => {
  it('returns 0 when no streak exists', () => {
    expect(getStreak('_default')).toBe(0)
  })

  it('starts a streak of 1 on first practice', () => {
    const count = updateStreak('_default')
    expect(count).toBe(1)
    expect(getStreak('_default')).toBe(1)
  })

  it('does not increment streak if already practiced today', () => {
    updateStreak('_default')
    const count = updateStreak('_default')
    expect(count).toBe(1)
    expect(getStreak('_default')).toBe(1)
  })

  it('tracks separate streaks for different profiles', () => {
    updateStreak('profile-a')
    updateStreak('profile-b')
    expect(getStreak('profile-a')).toBe(1)
    expect(getStreak('profile-b')).toBe(1)
  })
})

describe('Welcome', () => {
  it('returns false when welcome has not been seen', () => {
    expect(hasSeenWelcome()).toBe(false)
  })

  it('returns true after dismissWelcome is called', () => {
    dismissWelcome()
    expect(hasSeenWelcome()).toBe(true)
  })
})
