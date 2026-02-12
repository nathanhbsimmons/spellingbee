import { useState, useEffect } from 'react'
import {
  loadWordLists, createWordList, updateWordList, deleteWordList,
  loadSessions, getPin, setPin, verifyPin,
  loadProfiles, createProfile, deleteProfile,
  getFamilyEmail, updateFamilyEmail, getEmailDeliveryStatus,
} from '../db'
import { useFamily } from '../contexts/FamilyContext'

export default function AdminPanel({ onSelectList, onClose, onBackToProfiles }) {
  const { familyId } = useFamily()
  const [lists, setLists] = useState([])
  const [sessions, setSessions] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('lists') // 'lists' | 'history' | 'create' | 'edit' | 'pin' | 'profiles' | 'family-settings' | 'pin-prompt'
  const [authenticated, setAuthenticated] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)

  // Edit/create state
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editWords, setEditWords] = useState('')
  const [editSentences, setEditSentences] = useState({})
  const [newPin, setNewPin] = useState('')

  // Profile create state
  const [newProfileName, setNewProfileName] = useState('')

  // Email management state
  const [familyEmail, setFamilyEmail] = useState('')
  const [editingEmail, setEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailSendStatus, setEmailSendStatus] = useState(null) // null | 'pending' | 'success' | 'error'

  useEffect(() => {
    async function checkPin() {
      const hasPin = await getPin(familyId)
      if (!hasPin) {
        setAuthenticated(true)
      }
    }
    if (familyId) {
      checkPin()
    }
  }, [familyId])

  // Always load data regardless of authentication
  useEffect(() => {
    async function loadData() {
      if (!familyId) return
      setLoading(true)
      const [listsData, sessionsData, profilesData] = await Promise.all([
        loadWordLists(familyId),
        loadSessions(familyId),
        loadProfiles(familyId),
      ])
      setLists(listsData)
      setSessions(sessionsData)
      setProfiles(profilesData)
      setLoading(false)
    }
    loadData()
  }, [familyId, view, authenticated])

  // Load family email when family-settings view is accessed
  useEffect(() => {
    async function loadFamilySettings() {
      if (!familyId || view !== 'family-settings') return
      const email = await getFamilyEmail(familyId)
      if (email) {
        setFamilyEmail(email)
      }
    }
    loadFamilySettings()
  }, [familyId, view])

  function requireAuth(action) {
    if (authenticated) {
      action()
    } else {
      setPendingAction(() => action)
      setPinInput('')
      setPinError('')
      setView('pin-prompt')
    }
  }

  async function handlePinSubmit(e) {
    e.preventDefault()
    const isValid = await verifyPin(familyId, pinInput)
    if (isValid) {
      setAuthenticated(true)
      setPinError('')
      if (pendingAction) {
        pendingAction()
        setPendingAction(null)
      }
    } else {
      setPinError('Incorrect PIN')
    }
  }

  function parseSentencesFromWords(wordsText) {
    const words = wordsText.split('\n').map((w) => w.trim()).filter((w) => w.length > 0)
    return words
  }

  async function handleCreate(e) {
    e.preventDefault()
    const words = parseSentencesFromWords(editWords)
    if (!editName.trim() || words.length === 0) return
    await createWordList(familyId, editName.trim(), words, editSentences)
    setEditName('')
    setEditWords('')
    setEditSentences({})
    setView('lists')
  }

  async function handleEdit(e) {
    e.preventDefault()
    const words = parseSentencesFromWords(editWords)
    if (!editName.trim() || words.length === 0) return
    await updateWordList(familyId, editId, { name: editName.trim(), words, sentences: editSentences })
    setEditId(null)
    setEditName('')
    setEditWords('')
    setEditSentences({})
    setView('lists')
  }

  function startEdit(list) {
    requireAuth(() => {
      setEditId(list.id)
      setEditName(list.name)
      setEditWords(list.words.join('\n'))
      setEditSentences(list.sentences || {})
      setView('edit')
    })
  }

  function handleDelete(id) {
    requireAuth(async () => {
      await deleteWordList(familyId, id)
      const listsData = await loadWordLists(familyId)
      setLists(listsData)
    })
  }

  async function handleSetPin(e) {
    e.preventDefault()
    await setPin(familyId, newPin)
    setNewPin('')
    setView('lists')
  }

  function handleSentenceChange(word, sentence) {
    setEditSentences((prev) => {
      const next = { ...prev }
      if (sentence.trim()) {
        next[word] = sentence
      } else {
        delete next[word]
      }
      return next
    })
  }

  async function handleCreateProfile(e) {
    e.preventDefault()
    if (!newProfileName.trim()) return
    await createProfile(familyId, newProfileName.trim())
    setNewProfileName('')
    const profilesData = await loadProfiles(familyId)
    setProfiles(profilesData)
  }

  async function handleDeleteProfile(id) {
    await deleteProfile(familyId, id)
    const profilesData = await loadProfiles(familyId)
    setProfiles(profilesData)
  }

  async function handleUpdateEmail(e) {
    e.preventDefault()
    if (!newEmail.includes('@')) return
    const success = await updateFamilyEmail(familyId, newEmail)
    if (success) {
      setFamilyEmail(newEmail)
      setNewEmail('')
      setEditingEmail(false)
    }
  }

  async function handleResendJoinCode() {
    setEmailSendStatus('pending')
    try {
      // Import and call the resend function
      const { resendJoinCodeEmail } = await import('firebase/functions')
      const { getFirestoreFunctions } = await import('../firebase')
      const { httpsCallable } = await import('firebase/functions')

      const resendFunction = httpsCallable(getFirestoreFunctions(), 'resendFamilyJoinCode')
      await resendFunction({ familyId, email: familyEmail })
      setEmailSendStatus('success')
      setTimeout(() => setEmailSendStatus(null), 3000)
    } catch (error) {
      console.error('Error resending email:', error)
      setEmailSendStatus('error')
      setTimeout(() => setEmailSendStatus(null), 3000)
    }
  }

  // Get current words from the edit textarea for sentence fields
  const currentWords = editWords.split('\n').map((w) => w.trim()).filter((w) => w.length > 0)

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    )
  }

  if (view === 'pin-prompt') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">Parent Access</h2>
        <p className="text-center text-gray-500 mb-4 text-sm">Enter PIN to make changes</p>
        <form onSubmit={handlePinSubmit}>
          <input
            type="password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="Enter PIN"
            autoFocus
            className="w-full border-2 border-indigo-200 rounded-xl p-3 text-lg text-center mb-3
                       focus:outline-none focus:border-indigo-500"
          />
          {pinError && <p className="text-red-500 text-sm text-center mb-3">{pinError}</p>}
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            Unlock
          </button>
        </form>
        <button onClick={() => { setPendingAction(null); setView('lists') }} className="mt-3 w-full text-gray-400 text-sm hover:text-gray-600">
          Cancel
        </button>
      </div>
    )
  }

  if (view === 'create' || view === 'edit') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">
          {view === 'create' ? 'New Word List' : 'Edit Word List'}
        </h2>
        <form onSubmit={view === 'create' ? handleCreate : handleEdit}>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="List name (e.g., Week of Jan 15)"
            autoFocus
            className="w-full border-2 border-indigo-200 rounded-xl p-3 text-lg mb-3
                       focus:outline-none focus:border-indigo-500"
          />
          <textarea
            value={editWords}
            onChange={(e) => setEditWords(e.target.value)}
            placeholder={"beautiful\nbecause\nbelieve"}
            rows={6}
            className="w-full border-2 border-indigo-200 rounded-xl p-3 text-lg mb-3
                       focus:outline-none focus:border-indigo-500 resize-y"
          />

          {currentWords.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Context sentences (optional)
              </p>
              <div className="space-y-2" data-testid="sentence-fields">
                {currentWords.map((word) => (
                  <div key={word} className="flex items-start gap-2">
                    <span className="text-sm font-medium text-indigo-600 w-24 pt-2 truncate shrink-0">
                      {word}
                    </span>
                    <input
                      type="text"
                      value={editSentences[word] || ''}
                      onChange={(e) => handleSentenceChange(word, e.target.value)}
                      placeholder={`e.g., The ___ is lovely.`}
                      className="flex-1 border border-indigo-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!editName.trim() || !editWords.trim()}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold
                       hover:bg-indigo-700 transition-colors disabled:opacity-40"
          >
            {view === 'create' ? 'Create List' : 'Save Changes'}
          </button>
        </form>
        <button onClick={() => setView('lists')} className="mt-3 w-full text-gray-400 text-sm hover:text-gray-600">
          Cancel
        </button>
      </div>
    )
  }

  if (view === 'pin') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">Set Parent PIN</h2>
        <form onSubmit={handleSetPin}>
          <input
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Choose a PIN"
            autoFocus
            className="w-full border-2 border-indigo-200 rounded-xl p-3 text-lg text-center mb-3
                       focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!newPin.trim()}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold
                       hover:bg-indigo-700 transition-colors disabled:opacity-40"
          >
            Save PIN
          </button>
        </form>
        <button onClick={() => setView('lists')} className="mt-3 w-full text-gray-400 text-sm hover:text-gray-600">
          Cancel
        </button>
      </div>
    )
  }

  if (view === 'profiles') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">Manage Profiles</h2>

        {profiles.length === 0 ? (
          <p className="text-center text-gray-400 mb-4">No profiles yet.</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {profiles.map((p) => (
              <li key={p.id} className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between items-center">
                <span className="font-medium text-gray-700">{p.name}</span>
                <button
                  onClick={() => handleDeleteProfile(p.id)}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleCreateProfile} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            placeholder="Child's name"
            className="flex-1 border-2 border-indigo-200 rounded-xl p-3 text-lg
                       focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!newProfileName.trim()}
            className="bg-indigo-600 text-white px-5 rounded-xl font-semibold
                       hover:bg-indigo-700 transition-colors disabled:opacity-40"
          >
            Add
          </button>
        </form>

        {onBackToProfiles && (
          <button
            onClick={onBackToProfiles}
            className="w-full bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold
                       hover:bg-indigo-700 transition-colors mb-2"
          >
            Go to Profile Selection
          </button>
        )}
        <button onClick={() => setView('lists')} className="w-full text-gray-400 text-sm hover:text-gray-600">
          Back to Lists
        </button>
      </div>
    )
  }

  if (view === 'history') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">Practice History</h2>
        {sessions.length === 0 ? (
          <p className="text-center text-gray-400">No practice sessions yet.</p>
        ) : (
          <ul className="space-y-3">
            {[...sessions].reverse().map((s, i) => (
              <li key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{s.listName || 'Practice Session'}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(s.completedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {s.words?.length || 0} words &middot; Theme: {s.theme || 'garden'}
                </p>
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => setView('lists')} className="mt-4 w-full text-gray-400 text-sm hover:text-gray-600">
          Back to Lists
        </button>
      </div>
    )
  }

  if (view === 'family-settings') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">Family Settings</h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Email Address</h3>

          {!editingEmail ? (
            <div>
              <p className="text-gray-600 bg-gray-50 rounded-lg px-4 py-3 mb-3">
                {familyEmail || 'No email set'}
              </p>
              <button
                onClick={() => {
                  setEditingEmail(true)
                  setNewEmail(familyEmail || '')
                }}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 mb-2"
              >
                Update Email
              </button>
              {familyEmail && (
                <button
                  onClick={handleResendJoinCode}
                  disabled={emailSendStatus === 'pending'}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {emailSendStatus === 'pending' ? 'Sending...' : 'Resend Join Code'}
                </button>
              )}
              {emailSendStatus === 'success' && (
                <p className="text-green-600 text-sm text-center mt-2">✓ Email sent successfully!</p>
              )}
              {emailSendStatus === 'error' && (
                <p className="text-red-600 text-sm text-center mt-2">⚠ Failed to send email</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleUpdateEmail}>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@email.com"
                className="w-full border-2 border-indigo-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={!newEmail.includes('@')}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 mb-2"
              >
                Save Email
              </button>
              <button
                type="button"
                onClick={() => setEditingEmail(false)}
                className="w-full text-gray-400 text-sm hover:text-gray-600"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        <button onClick={() => setView('lists')} className="w-full text-gray-400 text-sm hover:text-gray-600">
          Back to Lists
        </button>
      </div>
    )
  }

  // Default: lists view (always accessible without PIN)
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">Word Lists</h2>

      {lists.length === 0 ? (
        <p className="text-center text-gray-400 mb-4">No word lists yet. Create one!</p>
      ) : (
        <ul className="space-y-3 mb-4">
          {lists.map((list) => (
            <li key={list.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => onSelectList(list)}
                  className="text-left flex-1"
                >
                  <span className="font-medium text-indigo-600 hover:text-indigo-800">
                    {list.name}
                  </span>
                  <span className="text-sm text-gray-400 ml-2">{list.words.length} words</span>
                </button>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(list)} className="text-xs text-gray-400 hover:text-indigo-600">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(list.id)} className="text-xs text-gray-400 hover:text-red-500">
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <button
          onClick={() => requireAuth(() => setView('create'))}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold
                     hover:bg-indigo-700 transition-colors"
        >
          Create New List
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setView('history')}
            className="bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-medium
                       hover:bg-gray-200 transition-colors"
          >
            History
          </button>
          <button
            onClick={() => requireAuth(() => setView('profiles'))}
            className="bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-medium
                       hover:bg-gray-200 transition-colors"
          >
            Profiles
          </button>
          <button
            onClick={() => requireAuth(() => setView('pin'))}
            className="bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-medium
                       hover:bg-gray-200 transition-colors"
          >
            Set PIN
          </button>
          <button
            onClick={() => requireAuth(() => setView('family-settings'))}
            className="bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-medium
                       hover:bg-gray-200 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>

      <button onClick={onClose} className="mt-3 w-full text-gray-400 text-sm hover:text-gray-600">
        Back
      </button>
    </div>
  )
}
