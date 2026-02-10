import { useState, useEffect } from 'react'
import { loadWordLists, loadSessions } from '../db'
import { getActiveProfile } from '../storage'
import { useFamily } from '../contexts/FamilyContext'

export default function WordListSetup({ onStart, onSelectList, onManageLists, onShowTutorial, onBackToProfiles }) {
  const { familyId } = useFamily()
  const [view, setView] = useState('hub') // 'hub' | 'quick' | 'history' | 'session-detail'
  const [input, setInput] = useState('')
  const [lists, setLists] = useState([])
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!familyId) return
      setLoading(true)
      const profile = getActiveProfile()
      const [listsData, sessionsData] = await Promise.all([
        loadWordLists(familyId),
        loadSessions(familyId, profile?.id),
      ])
      setLists(listsData)
      setSessions(sessionsData)
      setLoading(false)
    }
    loadData()
  }, [familyId, view])

  function handleSubmit(e) {
    e.preventDefault()
    const wordList = input
      .split('\n')
      .map((w) => w.trim())
      .filter((w) => w.length > 0)

    if (wordList.length === 0) return
    onStart(wordList)
  }

  if (loading && view !== 'quick') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    )
  }

  if (view === 'quick') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-2">
          Quick Practice
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Enter this week's spelling words to get started
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="word-list"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Spelling words (one per line)
          </label>
          <textarea
            id="word-list"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"beautiful\nbecause\nbelieve\nthrough\nfriend"}
            rows={8}
            autoFocus
            className="w-full border-2 border-indigo-200 rounded-xl p-4 text-lg
                       focus:outline-none focus:border-indigo-500
                       placeholder:text-gray-300 resize-y"
          />

          <button
            type="submit"
            disabled={input.trim().length === 0}
            className="mt-4 w-full bg-indigo-600 text-white text-lg font-semibold
                       py-3 rounded-xl hover:bg-indigo-700 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start Collecting
          </button>
        </form>

        <button
          type="button"
          onClick={() => setView('hub')}
          className="mt-3 w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          Back
        </button>
      </div>
    )
  }

  if (view === 'session-detail' && selectedSession) {
    const s = selectedSession
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-2">
          {s.listName || 'Practice Session'}
        </h2>
        <p className="text-center text-gray-400 text-sm mb-4">
          {new Date(s.completedAt).toLocaleDateString()} · Theme: {s.theme || 'garden'}
          {s.mode === 'scramble' ? ' · Scramble' : ''}
        </p>
        <ul className="space-y-2">
          {(s.words || []).map((word, j) => {
            const typed = s.typedWords?.[j] || ''
            const correct = typed.toLowerCase() === word.toLowerCase()
            return (
              <li
                key={j}
                className={`rounded-lg px-4 py-2 ${correct ? 'bg-green-50' : 'bg-amber-50'}`}
                data-testid={`session-word-${j}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-medium ${correct ? 'text-green-700' : 'text-gray-800'}`}>
                      {typed}
                    </span>
                    {!correct && (
                      <span className="text-sm text-gray-400 ml-2">(correct: {word})</span>
                    )}
                  </div>
                  {correct && (
                    <span className="text-green-500" aria-label="correct">&#10003;</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        <button
          onClick={() => { setSelectedSession(null); setView('history') }}
          className="mt-4 w-full text-gray-400 text-sm hover:text-gray-600"
        >
          Back to History
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
            {[...sessions].reverse().map((s, i) => {
              const correct = s.words?.filter((w, j) =>
                s.typedWords?.[j]?.toLowerCase() === w.toLowerCase()
              ).length || 0
              const total = s.words?.length || 0
              return (
                <li key={i}>
                  <button
                    onClick={() => { setSelectedSession(s); setView('session-detail') }}
                    className="w-full text-left bg-gray-50 rounded-lg p-3 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{s.listName || 'Practice Session'}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(s.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {correct}/{total} correct · Theme: {s.theme || 'garden'}
                      {s.mode === 'scramble' ? ' · Scramble' : ''}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <button
          onClick={() => setView('hub')}
          className="mt-4 w-full text-gray-400 text-sm hover:text-gray-600"
        >
          Back
        </button>
      </div>
    )
  }

  // Hub view (default)
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
      <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
        Spelling Word Collector
      </h1>
      <p className="text-center text-gray-500 mb-6">
        Choose how you'd like to practice
      </p>

      {lists.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
            Your Word Lists
          </h3>
          <ul className="space-y-2">
            {lists.map((list) => (
              <li key={list.id}>
                <button
                  onClick={() => onSelectList(list)}
                  className="w-full text-left bg-gray-50 rounded-lg p-3 hover:bg-indigo-50
                             hover:border-indigo-300 border-2 border-gray-200 transition-all"
                >
                  <span className="font-medium text-indigo-600">{list.name}</span>
                  <span className="text-sm text-gray-400 ml-2">{list.words.length} words</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setView('quick')}
          className="w-full bg-indigo-600 text-white text-lg font-semibold
                     py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Quick Practice
        </button>

        <button
          type="button"
          onClick={() => setView('history')}
          className="w-full bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-medium
                     hover:bg-gray-200 transition-colors"
        >
          View History
        </button>
      </div>

      {onManageLists && (
        <button
          type="button"
          onClick={onManageLists}
          className="mt-3 w-full text-indigo-500 text-sm font-medium hover:text-indigo-700 transition-colors"
        >
          Manage Word Lists
        </button>
      )}

      {onShowTutorial && (
        <button
          type="button"
          onClick={onShowTutorial}
          className="mt-1 w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          How It Works
        </button>
      )}

      {onBackToProfiles && (
        <button
          type="button"
          onClick={onBackToProfiles}
          className="mt-1 w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          Switch Profile
        </button>
      )}
    </div>
  )
}
