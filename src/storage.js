const LISTS_KEY = 'spelling-collector-lists'
const SESSIONS_KEY = 'spelling-collector-sessions'
const PIN_KEY = 'spelling-collector-pin'
const PROFILES_KEY = 'spelling-collector-profiles'
const ACTIVE_PROFILE_KEY = 'spelling-collector-active-profile'
const STREAK_KEY = 'spelling-collector-streak'

// --- Word Lists ---

export function loadWordLists() {
  try {
    return JSON.parse(localStorage.getItem(LISTS_KEY)) || []
  } catch {
    return []
  }
}

export function saveWordLists(lists) {
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists))
}

export function createWordList(name, words, sentences = {}) {
  const lists = loadWordLists()
  const newList = {
    id: crypto.randomUUID(),
    name,
    words,
    sentences,
    createdAt: new Date().toISOString(),
  }
  lists.push(newList)
  saveWordLists(lists)
  return newList
}

export function updateWordList(id, updates) {
  const lists = loadWordLists()
  const index = lists.findIndex((l) => l.id === id)
  if (index === -1) return null
  lists[index] = { ...lists[index], ...updates }
  saveWordLists(lists)
  return lists[index]
}

export function deleteWordList(id) {
  const lists = loadWordLists().filter((l) => l.id !== id)
  saveWordLists(lists)
}

// --- Sessions ---

export function loadSessions(profileId = null) {
  try {
    const all = JSON.parse(localStorage.getItem(SESSIONS_KEY)) || []
    if (profileId) {
      return all.filter((s) => s.profileId === profileId)
    }
    return all
  } catch {
    return []
  }
}

export function saveSession(session) {
  const sessions = loadSessions()
  const activeProfile = getActiveProfile()
  sessions.push({
    ...session,
    profileId: activeProfile?.id || null,
    completedAt: new Date().toISOString(),
  })
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))

  // Update streak for active profile
  if (activeProfile) {
    updateStreak(activeProfile.id)
  } else {
    updateStreak('_default')
  }
}

// --- PIN ---

export function getPin() {
  return localStorage.getItem(PIN_KEY)
}

export function setPin(pin) {
  localStorage.setItem(PIN_KEY, pin)
}

export function verifyPin(input) {
  const stored = getPin()
  return !stored || stored === input
}

// --- Profiles ---

export function loadProfiles() {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY)) || []
  } catch {
    return []
  }
}

export function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export function createProfile(name) {
  const profiles = loadProfiles()
  const newProfile = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  }
  profiles.push(newProfile)
  saveProfiles(profiles)
  return newProfile
}

export function deleteProfile(id) {
  const profiles = loadProfiles().filter((p) => p.id !== id)
  saveProfiles(profiles)
  // Clear active profile if it was the deleted one
  const active = getActiveProfile()
  if (active && active.id === id) {
    localStorage.removeItem(ACTIVE_PROFILE_KEY)
  }
}

export function getActiveProfile() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_PROFILE_KEY))
  } catch {
    return null
  }
}

export function setActiveProfile(profile) {
  if (profile) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile))
  } else {
    localStorage.removeItem(ACTIVE_PROFILE_KEY)
  }
}

// --- Streaks ---

function getStreakData() {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY)) || {}
  } catch {
    return {}
  }
}

function saveStreakData(data) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data))
}

function toDateString(date) {
  return date.toISOString().split('T')[0]
}

export function updateStreak(profileId) {
  const data = getStreakData()
  const today = toDateString(new Date())
  const entry = data[profileId] || { count: 0, lastDate: null }

  if (entry.lastDate === today) {
    // Already practiced today, no change
    saveStreakData(data)
    return entry.count
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = toDateString(yesterday)

  if (entry.lastDate === yesterdayStr) {
    // Practiced yesterday, extend streak
    entry.count += 1
  } else {
    // Streak broken or first time
    entry.count = 1
  }

  entry.lastDate = today
  data[profileId] = entry
  saveStreakData(data)
  return entry.count
}

export function getStreak(profileId) {
  const data = getStreakData()
  const entry = data[profileId || '_default']
  if (!entry) return 0

  const today = toDateString(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = toDateString(yesterday)

  // Streak is still valid if last practice was today or yesterday
  if (entry.lastDate === today || entry.lastDate === yesterdayStr) {
    return entry.count
  }

  return 0
}
