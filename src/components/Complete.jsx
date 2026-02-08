import { useState } from 'react'
import Confetti from './Confetti'
import { THEMES, DEFAULT_THEME } from './themes'

export default function Complete({ words, collectedWords, onStartOver, ThemeVisualization, streak = 0, theme = DEFAULT_THEME, hasProfile = true, onCreateProfile }) {
  const [fixes, setFixes] = useState({})
  const [fixingIndex, setFixingIndex] = useState(null)
  const [fixInput, setFixInput] = useState('')
  const [parentReviewed, setParentReviewed] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  function getTyped(i) {
    return fixes[i] ?? collectedWords[i] ?? ''
  }

  function isCorrect(i) {
    return getTyped(i).toLowerCase() === words[i].toLowerCase()
  }

  const bloomed = words.filter((_, i) => isCorrect(i)).length
  const toTend = words.length - bloomed
  const allBloomed = toTend === 0

  const themeConfig = THEMES[theme] || THEMES[DEFAULT_THEME]
  const { doneLabel, todoLabel, allDoneText } = themeConfig

  function handleStartFix(i) {
    setFixingIndex(i)
    setFixInput('')
  }

  function handleSubmitFix(i) {
    if (fixInput.trim().length === 0) return
    setFixes((prev) => ({ ...prev, [i]: fixInput.trim() }))
    setFixingIndex(null)
    setFixInput('')
  }

  function handleFixKeyDown(e, i) {
    if (e.key === 'Enter') {
      handleSubmitFix(i)
    } else if (e.key === 'Escape') {
      setFixingIndex(null)
    }
  }

  function handleCollectMore() {
    if (!hasProfile) {
      setShowProfileModal(true)
    } else {
      onStartOver()
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <>
      {allBloomed && <Confetti theme={theme} />}
      <div className={`bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out] ${allBloomed ? 'animate-[celebrate_0.5s_ease-in-out]' : ''}`}>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-indigo-600 mb-2">
            {allBloomed ? allDoneText : 'Review Time'}
          </h2>
          <p className="text-gray-500">
            {allBloomed
              ? `All ${words.length} words spelled correctly!`
              : `${bloomed} ${doneLabel}, ${toTend} ${todoLabel}`}
          </p>
        </div>

        {streak > 0 && (
          <div className="text-center mb-4" data-testid="streak-display">
            <span className="inline-block bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold">
              🔥 {streak} day streak!
            </span>
          </div>
        )}

        {ThemeVisualization && (
          <ThemeVisualization
            collectedWords={words.map((_, i) => getTyped(i))}
            latestIndex={-1}
          />
        )}

        <ul className="mt-6 space-y-2">
          {words.map((word, i) => {
            const typed = getTyped(i)
            const correct = isCorrect(i)
            const isFixing = fixingIndex === i

            return (
              <li
                key={i}
                className={`rounded-lg px-4 py-3 ${
                  correct ? 'bg-green-50' : 'bg-amber-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-lg font-medium ${correct ? 'text-green-700' : 'text-gray-800'}`}>
                      {typed}
                    </span>
                    {!correct && (
                      <span className="text-sm text-gray-400 ml-2">
                        (correct: {word})
                      </span>
                    )}
                  </div>
                  {correct ? (
                    <span className="text-green-500 text-xl" aria-label="correct">&#10003;</span>
                  ) : (
                    !isFixing && (
                      <button
                        onClick={() => handleStartFix(i)}
                        className="text-sm bg-amber-400 text-white px-3 py-1 rounded-lg
                                   hover:bg-amber-500 transition-colors font-medium no-print"
                      >
                        Fix
                      </button>
                    )
                  )}
                </div>

                {isFixing && (
                  <div className="mt-2 flex gap-2 no-print">
                    <input
                      type="text"
                      value={fixInput}
                      onChange={(e) => setFixInput(e.target.value)}
                      onKeyDown={(e) => handleFixKeyDown(e, i)}
                      placeholder={`Type "${word}" here...`}
                      autoFocus
                      autoComplete="off"
                      spellCheck={false}
                      className="flex-1 border-2 border-amber-300 rounded-lg px-3 py-2
                                 text-lg focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => handleSubmitFix(i)}
                      disabled={fixInput.trim().length === 0}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg
                                 hover:bg-indigo-700 transition-colors font-medium
                                 disabled:opacity-40"
                    >
                      Save
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        <div className="mt-6 space-y-2 no-print">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
            <input
              type="checkbox"
              checked={parentReviewed}
              onChange={(e) => setParentReviewed(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 cursor-pointer"
              data-testid="parent-reviewed-checkbox"
            />
            <span className="text-sm font-medium text-indigo-700">Reviewed with parent</span>
          </label>
          <button
            onClick={handleCollectMore}
            disabled={!parentReviewed}
            className="w-full bg-indigo-600 text-white text-lg font-semibold
                       py-3 rounded-xl hover:bg-indigo-700 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Collect More Words
          </button>
          <button
            onClick={handlePrint}
            className="w-full bg-gray-100 text-gray-600 text-sm font-medium
                       py-2 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Print Words
          </button>
        </div>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="profile-modal">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full animate-[fade-in-up_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-indigo-600 mb-2">Save your progress?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create a profile to keep track of your practice history and streaks.
            </p>
            {onCreateProfile && (
              <button
                onClick={onCreateProfile}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold
                           hover:bg-indigo-700 transition-colors mb-2"
              >
                Create a Profile
              </button>
            )}
            <button
              onClick={() => { setShowProfileModal(false); onStartOver() }}
              className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors py-2"
            >
              Continue without a profile
            </button>
          </div>
        </div>
      )}
    </>
  )
}
