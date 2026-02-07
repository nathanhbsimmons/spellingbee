import { useState, useEffect } from 'react'
import { loadProfiles, getActiveProfile, setActiveProfile } from '../storage'

export default function ProfileSelector({ onDone }) {
  const [profiles, setProfiles] = useState([])
  const [activeProfile, setActive] = useState(null)

  useEffect(() => {
    setProfiles(loadProfiles())
    setActive(getActiveProfile())
  }, [])

  function handleSelect(profile) {
    setActiveProfile(profile)
    setActive(profile)
    onDone()
  }

  function handleSkip() {
    setActiveProfile(null)
    onDone()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-2">
        Who's practicing today?
      </h2>
      <p className="text-center text-gray-500 mb-6">
        Pick your name to track your progress
      </p>

      {profiles.length > 0 ? (
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
      ) : (
        <p className="text-center text-gray-400 mb-4">
          No profiles yet. Add them in Manage Word Lists.
        </p>
      )}

      <button
        onClick={handleSkip}
        className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
      >
        Continue without a profile
      </button>
    </div>
  )
}
