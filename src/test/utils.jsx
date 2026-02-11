import { render } from '@testing-library/react'
import { FamilyProvider } from '../contexts/FamilyContext'

// Test wrapper that includes FamilyProvider
export function renderWithFamily(ui, { familyId = 'test-family-id', ...renderOptions } = {}) {
  // Set familyId in localStorage if provided
  if (familyId) {
    localStorage.setItem('spelling-collector-family-id', familyId)
  }

  function Wrapper({ children }) {
    return <FamilyProvider>{children}</FamilyProvider>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock data generators
export const createMockProfile = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: 'Test User',
  createdAt: new Date().toISOString(),
  ...overrides,
})

export const createMockWordList = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: 'Test List',
  words: ['cat', 'dog', 'bird'],
  sentences: {},
  createdAt: new Date().toISOString(),
  ...overrides,
})

export const createMockSession = (overrides = {}) => ({
  id: crypto.randomUUID(),
  listName: 'Test List',
  words: ['cat', 'dog', 'bird'],
  typedWords: ['cat', 'dawg', 'bird'],
  theme: 'garden',
  mode: 'standard',
  profileId: 'test-profile-id',
  completedAt: new Date().toISOString(),
  ...overrides,
})
