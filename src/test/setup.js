import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Mock Firebase db module
vi.mock('../db', () => ({
  createFamily: vi.fn().mockResolvedValue({
    familyId: 'test-family-id',
    joinCode: 'ABC123'
  }),
  joinFamily: vi.fn().mockResolvedValue('test-family-id'),
  getFamily: vi.fn().mockResolvedValue({
    joinCode: 'ABC123',
    pin: null
  }),
  loadWordLists: vi.fn().mockResolvedValue([]),
  createWordList: vi.fn().mockResolvedValue('test-list-id'),
  updateWordList: vi.fn().mockResolvedValue(),
  deleteWordList: vi.fn().mockResolvedValue(),
  loadSessions: vi.fn().mockResolvedValue([]),
  saveSession: vi.fn().mockResolvedValue('test-session-id'),
  loadProfiles: vi.fn().mockResolvedValue([]),
  createProfile: vi.fn().mockResolvedValue('test-profile-id'),
  deleteProfile: vi.fn().mockResolvedValue(),
  getPin: vi.fn().mockResolvedValue(null),
  setPin: vi.fn().mockResolvedValue(),
  verifyPin: vi.fn().mockResolvedValue(true),
  getStreak: vi.fn().mockResolvedValue(0),
  updateStreak: vi.fn().mockResolvedValue(1),
}))

afterEach(() => {
  cleanup()
  localStorage.clear()
})
