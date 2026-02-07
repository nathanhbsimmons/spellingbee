import { useState } from 'react'

export default function WordListSetup({ onStart, onManageLists, onShowTutorial }) {
  const [input, setInput] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const wordList = input
      .split('\n')
      .map((w) => w.trim())
      .filter((w) => w.length > 0)

    if (wordList.length === 0) return
    onStart(wordList)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
      <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
        Spelling Word Collector
      </h1>
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
    </div>
  )
}
