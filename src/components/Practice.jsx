import { useState, useRef, useEffect, useMemo } from 'react'
import useSpeech from '../hooks/useSpeech'
import EncouragingMessage from './EncouragingMessage'

function scrambleWord(word) {
  const letters = word.split('')
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[letters[i], letters[j]] = [letters[j], letters[i]]
  }
  // If scramble is same as original, swap first two letters
  const result = letters.join('')
  if (result === word && word.length > 1) {
    return word[1] + word[0] + word.slice(2)
  }
  return result
}

function maskSentence(sentence, word) {
  const parts = word.toLowerCase().split(/[^a-z']+/).filter(Boolean)
  return sentence.replace(/[A-Za-z']+/g, (token) => {
    const lower = token.toLowerCase()
    const leaks = parts.some((part) => {
      if (lower === part) return true
      if (part.length <= 3) return false
      return lower.startsWith(part.slice(0, Math.max(3, part.length - 2)))
    })
    return leaks ? '____' : token
  })
}

function sentenceForSpeech(sentence, word) {
  return sentence.replace(/_{2,}/g, word)
}

export default function Practice({ words, sentences = {}, collectedWords, onCollect, onComplete, onBack, ThemeVisualization, mode = 'standard' }) {
  const currentIndex = collectedWords.length
  const isLastWord = currentIndex === words.length - 1
  const [typed, setTyped] = useState('')
  const [autoPlay, setAutoPlay] = useState(mode !== 'scramble')
  const inputRef = useRef(null)
  const { speak, speaking, supported, blocked, voices, selectedVoice, setSelectedVoice } = useSpeech()

  // Memoize scrambled words so they don't change on re-render
  const scrambledWords = useMemo(() => {
    if (mode !== 'scramble') return []
    return words.map((w) => scrambleWord(w))
  }, [words, mode])

  useEffect(() => {
    inputRef.current?.focus()
    if (currentIndex === 0 && autoPlay && supported) {
      speak(words[currentIndex])
    }
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleNext() {
    if (typed.trim().length === 0) return

    const trimmed = typed.trim()
    onCollect(trimmed)
    setTyped('')

    if (isLastWord) {
      onComplete([...collectedWords, trimmed])
    } else if (autoPlay && supported && !blocked) {
      speak(words[currentIndex + 1])
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleNext()
    }
  }

  // Guard against out-of-bounds after collecting the last word
  // (parent re-renders with updated collectedWords before transitioning away)
  if (currentIndex >= words.length) return null

  const currentWord = words[currentIndex]
  const currentSentence = sentences[currentWord]
  const maskedSentence = currentSentence && maskSentence(currentSentence, currentWord)

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start animate-[fade-in-up_0.3s_ease-out]">
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
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

      <div className="text-center mb-6">
        {mode === 'scramble' ? (
          <>
            <p className="text-gray-500 text-sm mb-1">Unscramble the letters</p>
            <p className="text-4xl font-bold text-amber-500 tracking-widest select-none" data-testid="scrambled-word">
              {scrambledWords[currentIndex]}
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-1">Type what you hear</p>
            <p className="text-5xl font-bold text-indigo-600 tracking-wide select-none">
              {'_ '.repeat(currentWord.length).trim()}
            </p>
          </>
        )}
      </div>

      {currentSentence && (
        <p className="text-center text-gray-400 text-sm mb-4 italic" data-testid="context-sentence">
          "{maskedSentence}"
        </p>
      )}

      {supported ? (
        <div className="mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => speak(currentWord)}
            disabled={speaking}
            className={`flex-1 flex items-center justify-center gap-2 bg-emerald-500
                       text-white font-semibold py-3 rounded-xl hover:bg-emerald-600
                       transition-colors disabled:opacity-60 ${blocked ? 'animate-pulse' : ''}`}
          >
            <span className="text-xl">{speaking ? '🔊' : '🔈'}</span>
            {speaking ? 'Playing...' : 'Play Word'}
          </button>
          <button
            type="button"
            onClick={() => speak(currentWord, { rate: 0.5 })}
            disabled={speaking}
            className="flex items-center justify-center gap-1 bg-white border-2 border-emerald-500
                       text-emerald-700 font-semibold py-3 px-4 rounded-xl hover:bg-emerald-50
                       transition-colors disabled:opacity-60"
          >
            <span className="text-lg">🐢</span>
            Slow
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(e) => setAutoPlay(e.target.checked)}
              className="accent-indigo-600 w-4 h-4"
            />
            Auto-play
          </label>
        </div>
        {currentSentence && (
          <button
            type="button"
            onClick={() => speak(`${currentWord}. ${sentenceForSpeech(currentSentence, currentWord)}`)}
            disabled={speaking}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-white border-2 border-emerald-500
                       text-emerald-700 font-semibold py-2 rounded-xl hover:bg-emerald-50
                       transition-colors disabled:opacity-60"
          >
            <span className="text-lg">💬</span>
            Play in a Sentence
          </button>
        )}
        {blocked && (
          <p className="mt-3 text-center text-amber-600 text-sm">
            Tap "Play Word" to turn on sound.
          </p>
        )}
        {voices.length > 1 && (
          <label className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            Voice
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="flex-1 min-w-0 border border-gray-200 rounded-lg p-1.5 text-gray-700 bg-white"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>
        )}
        </div>
      ) : (
        <p className="text-center text-amber-600 text-sm mb-6">
          Audio playback is not supported in this browser.
        </p>
      )}

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

      <EncouragingMessage currentIndex={currentIndex} />

      {onBack && (
        <button
          onClick={onBack}
          className="mt-4 w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          Quit Practice
        </button>
      )}
    </div>

    {ThemeVisualization && (
      <div className="lg:sticky lg:top-4">
        <ThemeVisualization
          collectedWords={collectedWords}
          latestIndex={collectedWords.length - 1}
        />
      </div>
    )}
    </div>
  )
}
