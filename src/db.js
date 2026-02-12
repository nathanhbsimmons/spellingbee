import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { db } from './firebase'

// --- Helper Functions ---

function generateJoinCode() {
  // Generate a 6-character alphanumeric join code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude ambiguous chars
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function toDateString(date) {
  return date.toISOString().split('T')[0]
}

// --- Family Management ---

export async function createFamily(email = null) {
  const familyId = crypto.randomUUID()
  const joinCode = generateJoinCode()

  const trimmedEmail = email ? email.trim() : null
  await setDoc(doc(db, 'families', familyId), {
    joinCode,
    pin: null,
    email: trimmedEmail,
    emails: trimmedEmail ? [trimmedEmail] : [],
    emailDeliveryStatus: null,
    emailLastSentAt: null,
    createdAt: new Date().toISOString(),
  })

  return { familyId, joinCode }
}

export async function joinFamily(code) {
  // Search for family with this join code
  const familiesRef = collection(db, 'families')
  const q = query(familiesRef, where('joinCode', '==', code.toUpperCase()))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return null
  }

  return snapshot.docs[0].id
}

export async function getFamily(familyId) {
  const familyDoc = await getDoc(doc(db, 'families', familyId))
  if (!familyDoc.exists()) {
    return null
  }
  return { id: familyDoc.id, ...familyDoc.data() }
}

// --- Word Lists ---

export async function loadWordLists(familyId) {
  try {
    const listsRef = collection(db, 'families', familyId, 'wordLists')
    const snapshot = await getDocs(query(listsRef, orderBy('createdAt', 'desc')))
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error loading word lists:', error)
    return []
  }
}

export async function createWordList(familyId, name, words, sentences = {}) {
  const newList = {
    name,
    words,
    sentences,
    createdAt: new Date().toISOString(),
  }

  const listsRef = collection(db, 'families', familyId, 'wordLists')
  const docRef = await addDoc(listsRef, newList)

  return { id: docRef.id, ...newList }
}

export async function updateWordList(familyId, listId, updates) {
  try {
    const listRef = doc(db, 'families', familyId, 'wordLists', listId)
    await updateDoc(listRef, updates)

    const updated = await getDoc(listRef)
    return { id: updated.id, ...updated.data() }
  } catch (error) {
    console.error('Error updating word list:', error)
    return null
  }
}

export async function deleteWordList(familyId, listId) {
  await deleteDoc(doc(db, 'families', familyId, 'wordLists', listId))
}

// --- Sessions ---

export async function loadSessions(familyId, profileId = null) {
  try {
    const sessionsRef = collection(db, 'families', familyId, 'sessions')
    let q = query(sessionsRef, orderBy('completedAt', 'desc'))

    if (profileId) {
      q = query(sessionsRef, where('profileId', '==', profileId), orderBy('completedAt', 'desc'))
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error loading sessions:', error)
    return []
  }
}

export async function saveSession(familyId, session, profileId) {
  const newSession = {
    ...session,
    profileId: profileId || null,
    completedAt: new Date().toISOString(),
  }

  const sessionsRef = collection(db, 'families', familyId, 'sessions')
  await addDoc(sessionsRef, newSession)

  // Update streak for profile
  if (profileId) {
    await updateStreak(familyId, profileId)
  }
}

// --- PIN ---

export async function getPin(familyId) {
  const familyDoc = await getDoc(doc(db, 'families', familyId))
  if (!familyDoc.exists()) {
    return null
  }
  return familyDoc.data().pin
}

export async function setPin(familyId, pin) {
  await updateDoc(doc(db, 'families', familyId), { pin })
}

export async function verifyPin(familyId, input) {
  const stored = await getPin(familyId)
  return !stored || stored === input
}

// --- Email Management ---

export async function getFamilyEmail(familyId) {
  try {
    const familyDoc = await getDoc(doc(db, 'families', familyId))
    if (!familyDoc.exists()) {
      return null
    }
    return familyDoc.data().email
  } catch (error) {
    console.error('Error getting family email:', error)
    return null
  }
}

export async function updateFamilyEmail(familyId, email) {
  try {
    await updateDoc(doc(db, 'families', familyId), {
      email: email.trim(),
    })
    return true
  } catch (error) {
    console.error('Error updating family email:', error)
    return false
  }
}

export async function getEmailDeliveryStatus(familyId) {
  try {
    const familyDoc = await getDoc(doc(db, 'families', familyId))
    if (!familyDoc.exists()) {
      return null
    }
    const data = familyDoc.data()
    return {
      email: data.email,
      status: data.emailDeliveryStatus,
      lastSentAt: data.emailLastSentAt,
    }
  } catch (error) {
    console.error('Error getting email delivery status:', error)
    return null
  }
}

export async function getFamilyEmails(familyId) {
  try {
    const familyDoc = await getDoc(doc(db, 'families', familyId))
    if (!familyDoc.exists()) {
      return []
    }
    const data = familyDoc.data()
    if (data.emails && Array.isArray(data.emails)) {
      return data.emails
    }
    // Backward compat: fall back to single email field
    if (data.email) {
      return [data.email]
    }
    return []
  } catch (error) {
    console.error('Error getting family emails:', error)
    return []
  }
}

export async function addFamilyEmail(familyId, email) {
  try {
    const trimmed = email.trim()
    await updateDoc(doc(db, 'families', familyId), {
      emails: arrayUnion(trimmed),
    })
    return true
  } catch (error) {
    console.error('Error adding family email:', error)
    return false
  }
}

export async function removeFamilyEmail(familyId, email) {
  try {
    await updateDoc(doc(db, 'families', familyId), {
      emails: arrayRemove(email),
    })
    return true
  } catch (error) {
    console.error('Error removing family email:', error)
    return false
  }
}

export async function updateEmailDeliveryStatus(familyId, status, error = null) {
  try {
    const updateData = {
      emailDeliveryStatus: status,
      emailLastSentAt: new Date().toISOString(),
    }
    if (error) {
      updateData.emailError = error
    }
    await updateDoc(doc(db, 'families', familyId), updateData)
    return true
  } catch (error) {
    console.error('Error updating email delivery status:', error)
    return false
  }
}

// --- Profiles ---

export async function loadProfiles(familyId) {
  try {
    const profilesRef = collection(db, 'families', familyId, 'profiles')
    const snapshot = await getDocs(query(profilesRef, orderBy('createdAt', 'asc')))
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error loading profiles:', error)
    return []
  }
}

export async function createProfile(familyId, name) {
  const newProfile = {
    name,
    createdAt: new Date().toISOString(),
  }

  const profilesRef = collection(db, 'families', familyId, 'profiles')
  const docRef = await addDoc(profilesRef, newProfile)

  return { id: docRef.id, ...newProfile }
}

export async function deleteProfile(familyId, profileId) {
  await deleteDoc(doc(db, 'families', familyId, 'profiles', profileId))
}

// --- Streaks ---

export async function getStreak(familyId, profileId) {
  try {
    const streakDoc = await getDoc(doc(db, 'families', familyId, 'streaks', profileId))
    if (!streakDoc.exists()) {
      return 0
    }

    const data = streakDoc.data()
    const today = toDateString(new Date())
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = toDateString(yesterday)

    // Streak is still valid if last practice was today or yesterday
    if (data.lastDate === today || data.lastDate === yesterdayStr) {
      return data.count
    }

    return 0
  } catch (error) {
    console.error('Error getting streak:', error)
    return 0
  }
}

export async function updateStreak(familyId, profileId) {
  const streakRef = doc(db, 'families', familyId, 'streaks', profileId)
  const streakDoc = await getDoc(streakRef)

  const today = toDateString(new Date())
  let entry = { count: 0, lastDate: null }

  if (streakDoc.exists()) {
    entry = streakDoc.data()
  }

  if (entry.lastDate === today) {
    // Already practiced today, no change
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
  await setDoc(streakRef, entry)

  return entry.count
}
