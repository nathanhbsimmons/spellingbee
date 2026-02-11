import { createWordList, createProfile, saveSession, setPin } from './db'

const LISTS_KEY = 'spelling-collector-lists'
const SESSIONS_KEY = 'spelling-collector-sessions'
const PIN_KEY = 'spelling-collector-pin'
const PROFILES_KEY = 'spelling-collector-profiles'
const MIGRATION_DONE_KEY = 'spelling-collector-migration-done'

export function hasLocalStorageData() {
  // Check if there's any data to migrate
  const lists = localStorage.getItem(LISTS_KEY)
  const sessions = localStorage.getItem(SESSIONS_KEY)
  const profiles = localStorage.getItem(PROFILES_KEY)
  const pin = localStorage.getItem(PIN_KEY)

  return !!(lists || sessions || profiles || pin)
}

export function hasMigrated() {
  return localStorage.getItem(MIGRATION_DONE_KEY) === 'true'
}

export function markMigrationDone() {
  localStorage.setItem(MIGRATION_DONE_KEY, 'true')
}

export async function migrateLocalStorageToFirestore(familyId) {
  try {
    // Migrate word lists
    const listsJson = localStorage.getItem(LISTS_KEY)
    if (listsJson) {
      const lists = JSON.parse(listsJson)
      for (const list of lists) {
        await createWordList(familyId, list.name, list.words, list.sentences || {})
      }
    }

    // Migrate profiles
    const profilesJson = localStorage.getItem(PROFILES_KEY)
    const profileIdMap = {} // Map old IDs to new IDs
    if (profilesJson) {
      const profiles = JSON.parse(profilesJson)
      for (const profile of profiles) {
        const newProfile = await createProfile(familyId, profile.name)
        profileIdMap[profile.id] = newProfile.id
      }
    }

    // Migrate sessions
    const sessionsJson = localStorage.getItem(SESSIONS_KEY)
    if (sessionsJson) {
      const sessions = JSON.parse(sessionsJson)
      for (const session of sessions) {
        // Map old profile ID to new profile ID
        const newProfileId = session.profileId ? profileIdMap[session.profileId] : null
        await saveSession(familyId, {
          listName: session.listName,
          words: session.words,
          typedWords: session.typedWords,
          theme: session.theme,
          mode: session.mode,
        }, newProfileId)
      }
    }

    // Migrate PIN
    const pin = localStorage.getItem(PIN_KEY)
    if (pin) {
      await setPin(familyId, pin)
    }

    markMigrationDone()
    return true
  } catch (error) {
    console.error('Migration failed:', error)
    return false
  }
}
