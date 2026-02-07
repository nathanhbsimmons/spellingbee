import { useState, useRef, useEffect } from 'react'

export default function Practice({ words, collectedWords, onCollect, onComplete }) {
  const currentIndex = collectedWords.length
  const isLastWord = currentIndex === words.length - 1
  const [typed, setTyped] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [currentIndex])

  function handleNext() {
    if (typed.trim().length === 0) return

    onCollect(typed.trim())
    setTyped('')

    if (isLastWord) {
      onComplete()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleNext()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-6">
        <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Word {currentIndex + 1} of {words.length}
        </span>
        <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentIndex / words.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <p className="text-gray-500 text-sm mb-1">Type what you hear</p>
        <p className="text-5xl font-bold text-indigo-600 tracking-wide select-none">
          {'_ '.repeat(words[currentIndex].length).trim()}
        </p>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type the word here..."
        autoComplete="off"
        spellCheck={false}
        className="w-full border-2 border-indigo-200 rounded-xl p-4 text-2xl text-center
                   font-semibold focus:outline-none focus:border-indigo-500
                   placeholder:text-gray-300 placeholder:text-lg placeholder:font-normal"
      />

      <button
        onClick={handleNext}
        disabled={typed.trim().length === 0}
        className="mt-4 w-full bg-indigo-600 text-white text-lg font-semibold
                   py-3 rounded-xl hover:bg-indigo-700 transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLastWord ? 'Finish Collecting' : 'Next Word'}
      </button>
    </div>
  )
}
