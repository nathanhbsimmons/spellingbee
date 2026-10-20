import { useState, useCallback, useEffect, useRef } from 'react'

const VOICE_KEY = 'spelling-collector-voice'

const PREFERRED_NAMES = [
  'samantha', 'ava', 'allison', 'susan', 'zoe', 'nicky', 'karen', 'moira', 'serena', 'daniel', 'google us english', 'google uk english female',
]

function scoreVoice(v) {
  const name = v.name.toLowerCase()
  let score = 0
  if (/^en[-_]us/i.test(v.lang)) score += 20
  else if (/^en/i.test(v.lang)) score += 10
  if (/premium/.test(name)) score += 100
  else if (/enhanced/.test(name)) score += 80
  if (/siri/.test(name)) score += 90
  if (/natural|online/.test(name)) score += 95
  if (/google/.test(name)) score += 40
  const preferred = PREFERRED_NAMES.findIndex((n) => name.includes(n))
  if (preferred !== -1) score += 30 - preferred
  if (v.localService) score += 5
  if (/novelty|zarvox|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|trinoids|whisper|wobble|albert|fred|junior|kathy|ralph|superstar/.test(name)) score -= 200
  if (/espeak/.test(name)) score -= 150
  return score
}

export function rankVoices(voices) {
  return voices
    .filter((v) => /^en/i.test(v.lang))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a))
}

function readSavedVoice() {
  try {
    return localStorage.getItem(VOICE_KEY)
  } catch {
    return null
  }
}

export function unlockSpeech() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  if (typeof SpeechSynthesisUtterance === 'undefined') return
  const utterance = new SpeechSynthesisUtterance(' ')
  utterance.volume = 0
  window.speechSynthesis.speak(utterance)
}

export default function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)
  const [voices, setVoices] = useState([])
  const [voiceName, setVoiceName] = useState(readSavedVoice)
  const [blocked, setBlocked] = useState(false)
  const synthRef = useRef(supported ? window.speechSynthesis : null)
  // Keep a ref to the current utterance to prevent garbage collection (Chrome bug)
  const utteranceRef = useRef(null)
  const watchdogRef = useRef(null)

  useEffect(() => {
    if (!supported) return
    const synth = synthRef.current

    function loadVoices() {
      setVoices(rankVoices(synth.getVoices()))
    }

    loadVoices()
    synth.addEventListener?.('voiceschanged', loadVoices)
    // iOS Safari often populates voices without firing voiceschanged
    const retry = setTimeout(loadVoices, 500)
    return () => {
      clearTimeout(retry)
      clearTimeout(watchdogRef.current)
      synth.removeEventListener?.('voiceschanged', loadVoices)
    }
  }, [supported])

  const selectedVoice =
    voices.find((v) => v.name === voiceName) || voices[0] || null

  const setSelectedVoice = useCallback((name) => {
    setVoiceName(name)
    try {
      localStorage.setItem(VOICE_KEY, name)
    } catch {
      // storage unavailable; choice lasts for this session only
    }
  }, [])

  // Must run synchronously inside the click handler: iOS Safari drops
  // speech that is queued after a timeout or outside a user gesture.
  // iOS also fails silently (no error event), so a watchdog retries once
  // with the default voice, then flags the page as blocked.
  const speak = useCallback(
    (text, { rate = 0.9 } = {}) => {
      if (!supported || !text) return

      const synth = synthRef.current
      clearTimeout(watchdogRef.current)
      if (synth.speaking || synth.pending) synth.cancel()
      if (synth.paused) synth.resume()

      const attempt = (voice, retriesLeft) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = rate
        utterance.lang = voice?.lang || 'en-US'
        if (voice) utterance.voice = voice

        let started = false
        utterance.onstart = () => {
          started = true
          clearTimeout(watchdogRef.current)
          setBlocked(false)
          setSpeaking(true)
        }
        utterance.onend = () => setSpeaking(false)
        utterance.onerror = (e) => {
          setSpeaking(false)
          if (e?.error === 'not-allowed') setBlocked(true)
        }

        utteranceRef.current = utterance
        synth.speak(utterance)

        watchdogRef.current = setTimeout(() => {
          if (started) return
          synth.cancel()
          if (retriesLeft > 0) {
            attempt(null, retriesLeft - 1)
          } else {
            setSpeaking(false)
            setBlocked(true)
          }
        }, 1500)
      }

      attempt(selectedVoice, 1)
    },
    [supported, selectedVoice],
  )

  const stop = useCallback(() => {
    if (supported) {
      clearTimeout(watchdogRef.current)
      synthRef.current.cancel()
      setSpeaking(false)
    }
  }, [supported])

  return {
    speak,
    stop,
    speaking,
    supported,
    blocked,
    voices,
    selectedVoice,
    setSelectedVoice,
  }
}
