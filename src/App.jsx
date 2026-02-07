import { useState } from 'react'
import Welcome from './components/Welcome'
import WordListSetup from './components/WordListSetup'
import ThemeSelector from './components/ThemeSelector'
import Practice from './components/Practice'
import Complete from './components/Complete'
import AdminPanel from './components/AdminPanel'
import ProfileSelector from './components/ProfileSelector'
import ModeSelector from './components/ModeSelector'
import { THEMES, DEFAULT_THEME } from './components/themes'
import { saveSession, getActiveProfile, getStreak, hasSeenWelcome } from './storage'

const SCREENS = {
  WELCOME: 'welcome',
  PROFILE: 'profile',
  SETUP: 'setup',
  ADMIN: 'admin',
  THEME: 'theme',
  MODE: 'mode',
  PRACTICE: 'practice',
  COMPLETE: 'complete',
}

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function App() {
  const [screen, setScreen] = useState(hasSeenWelcome() ? SCREENS.PROFILE : SCREENS.WELCOME)
  const [words, setWords] = useState([])
  const [sentences, setSentences] = useState({})
  const [listName, setListName] = useState('')
  const [collectedWords, setCollectedWords] = useState([])
  const [theme, setTheme] = useState(DEFAULT_THEME)
  const [practiceMode, setPracticeMode] = useState('standard')
  const [streak, setStreak] = useState(0)

  function handleWelcomeDone() {
    setScreen(SCREENS.PROFILE)
  }

  function handleProfileDone() {
    setScreen(SCREENS.SETUP)
  }

  function handleStartPractice(wordList) {
    setWords(shuffleArray(wordList))
    setSentences({})
    setListName('')
    setCollectedWords([])
    setScreen(SCREENS.THEME)
  }

  function handleSelectList(list) {
    setWords(shuffleArray(list.words))
    setSentences(list.sentences || {})
    setListName(list.name)
    setCollectedWords([])
    setScreen(SCREENS.THEME)
  }

  function handleThemeSelected(themeKey) {
    setTheme(themeKey)
    setScreen(SCREENS.MODE)
  }

  function handleModeSelected(mode) {
    setPracticeMode(mode)
    setScreen(SCREENS.PRACTICE)
  }

  function handleCollectWord(typed) {
    setCollectedWords((prev) => [...prev, typed])
  }

  function handlePracticeComplete(finalCollected) {
    saveSession({
      listName: listName || 'Quick Practice',
      words,
      typedWords: finalCollected,
      theme,
      mode: practiceMode,
    })
    const profile = getActiveProfile()
    setStreak(getStreak(profile?.id))
    setScreen(SCREENS.COMPLETE)
  }

  function handleStartOver() {
    setWords([])
    setCollectedWords([])
    setScreen(SCREENS.SETUP)
  }

  const ThemeComponent = THEMES[theme].component

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {screen === SCREENS.WELCOME && (
          <Welcome onDone={handleWelcomeDone} />
        )}
        {screen === SCREENS.PROFILE && (
          <ProfileSelector onDone={handleProfileDone} />
        )}
        {screen === SCREENS.SETUP && (
          <WordListSetup
            onStart={handleStartPractice}
            onSelectList={handleSelectList}
            onManageLists={() => setScreen(SCREENS.ADMIN)}
            onShowTutorial={() => setScreen(SCREENS.WELCOME)}
          />
        )}
        {screen === SCREENS.ADMIN && (
          <AdminPanel
            onSelectList={handleSelectList}
            onClose={() => setScreen(SCREENS.SETUP)}
          />
        )}
        {screen === SCREENS.THEME && (
          <ThemeSelector selectedTheme={theme} onSelect={handleThemeSelected} onBack={() => setScreen(SCREENS.SETUP)} />
        )}
        {screen === SCREENS.MODE && (
          <ModeSelector onSelect={handleModeSelected} onBack={() => setScreen(SCREENS.THEME)} />
        )}
        {screen === SCREENS.PRACTICE && (
          <Practice
            words={words}
            sentences={sentences}
            collectedWords={collectedWords}
            onCollect={handleCollectWord}
            onComplete={handlePracticeComplete}
            onBack={handleStartOver}
            ThemeVisualization={ThemeComponent}
            mode={practiceMode}
          />
        )}
        {screen === SCREENS.COMPLETE && (
          <Complete
            words={words}
            collectedWords={collectedWords}
            onStartOver={handleStartOver}
            ThemeVisualization={ThemeComponent}
            streak={streak}
          />
        )}
      </div>
    </div>
  )
}
