import { useState } from 'react'
import WordListSetup from './components/WordListSetup'
import Practice from './components/Practice'
import Complete from './components/Complete'

const SCREENS = {
  SETUP: 'setup',
  PRACTICE: 'practice',
  COMPLETE: 'complete',
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.SETUP)
  const [words, setWords] = useState([])
  const [collectedWords, setCollectedWords] = useState([])

  function handleStartPractice(wordList) {
    setWords(wordList)
    setCollectedWords([])
    setScreen(SCREENS.PRACTICE)
  }

  function handleCollectWord(typed) {
    setCollectedWords((prev) => [...prev, typed])
  }

  function handlePracticeComplete() {
    setScreen(SCREENS.COMPLETE)
  }

  function handleStartOver() {
    setWords([])
    setCollectedWords([])
    setScreen(SCREENS.SETUP)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {screen === SCREENS.SETUP && (
          <WordListSetup onStart={handleStartPractice} />
        )}
        {screen === SCREENS.PRACTICE && (
          <Practice
            words={words}
            collectedWords={collectedWords}
            onCollect={handleCollectWord}
            onComplete={handlePracticeComplete}
          />
        )}
        {screen === SCREENS.COMPLETE && (
          <Complete
            words={words}
            collectedWords={collectedWords}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  )
}
