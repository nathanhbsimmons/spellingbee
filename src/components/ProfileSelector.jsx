import { useState, useEffect } from 'react'
import { loadProfiles, createProfile } from '../db'
import { getActiveProfile, setActiveProfile } from '../storage'
import { useFamily } from '../contexts/FamilyContext'
import { useToast } from './Toast'

export default function ProfileSelector({ onDone }) {
  const { familyId } = useFamily()
  const { showSuccess, showError } = useToast()
  const [profiles, setProfiles] = useState([])
  const [activeProfile, setActive] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [familyId])

  async function loadData() {
    if (!familyId) return
    setLoading(true)
    const profilesData = await loadProfiles(familyId)
    setProfiles(profilesData)
    setActive(getActiveProfile())
    setLoading(false)

    // If no profiles exist, automatically show create form
    if (profilesData.length === 0) {
      setShowCreateForm(true)
    }
  }

  function handleSelect(profile) {
    setActiveProfile(profile)
    setActive(profile)
    onDone()
  }

  function handleSkip() {
    setActiveProfile(null)
    onDone()
  }

  async function handleCreateProfile(e) {
    e.preventDefault()
    if (!newProfileName.trim()) {
      showError('Please enter a name')
      return
    }

    setCreating(true)
    try {
      await createProfile(familyId, newProfileName.trim())
      showSuccess(`Profile "${newProfileName.trim()}" created!`)
      setNewProfileName('')
      setShowCreateForm(false)
      await loadData()
    } catch (err) {
      showError('Failed to create profile. Please try again.')
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-2">
        Who's practicing today?
      </h2>
      <p className="text-center text-gray-500 mb-6">
        {profiles.length > 0 ? 'Pick your name to track your progress' : 'Create a profile to get started'}
      </p>

      {profiles.length > 0 && (
        <div className="space-y-2 mb-4">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`w-full p-4 rounded-xl text-lg font-semibold text-left transition-all
                         hover:scale-[1.02] ${
                           activeProfile?.id === p.id
                             ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-700'
                             : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-indigo-300'
                         }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {showCreateForm ? (
        <form onSubmit={handleCreateProfile} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 border-2 border-indigo-200 rounded-xl p-3 text-lg
                       focus:outline-none focus:border-indigo-500"
              autoFocus
              disabled={creating}
            />
            <button
              type="submit"
              disabled={creating || !newProfileName.trim()}
              className="bg-indigo-600 text-white px-5 rounded-xl font-semibold
                       hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {creating ? '...' : 'Add'}
            </button>
          </div>
          {profiles.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false)
                setNewProfileName('')
              }}
              className="mt-2 text-sm text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          )}
        </form>
      ) : (
        profiles.length > 0 && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full mb-4 py-3 border-2 border-dashed border-indigo-300 rounded-xl
                     text-indigo-600 font-semibold hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            + Create New Profile
          </button>
        )
      )}

      {profiles.length > 0 && (
        <button
          onClick={handleSkip}
          className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          Continue without a profile
        </button>
      )}

      <p className="mt-4 text-center text-gray-300 text-xs" data-testid="storage-notice">
        Your data syncs across all devices connected to your family.
      </p>
    </div>
  )
}
