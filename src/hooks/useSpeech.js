import { useState, useCallback, useEffect, useRef } from 'react'

export default function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const synthRef = useRef(supported ? window.speechSynthesis : null)
  // Keep a ref to the current utterance to prevent garbage collection (Chrome bug)
  const utteranceRef = useRef(null)
  const speakTimeoutRef = useRef(null)

  useEffect(() => {
    if (!supported) return

    function loadVoices() {
      const available = synthRef.current.getVoices()
      setVoices(available)
    }

    loadVoices()
    synthRef.current.addEventListener('voiceschanged', loadVoices)
    return () => {
      synthRef.current?.removeEventListener('voiceschanged', loadVoices)
    }
  }, [supported])

  const speak = useCallback(
    (text) => {
      if (!supported || !text) return

      const synth = synthRef.current
      synth.cancel()

      // Clear any pending delayed speak call (handles StrictMode double-fire)
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current)
      }

      // Delay speak after cancel to work around Chrome bug where
      // cancel() immediately followed by speak() silently fails
      speakTimeoutRef.current = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.85
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }

        utterance.onstart = () => setSpeaking(true)
        utterance.onend = () => setSpeaking(false)
        utterance.onerror = () => setSpeaking(false)

        // Store in ref to prevent garbage collection from killing speech mid-playback
        utteranceRef.current = utterance
        synth.speak(utterance)
      }, 50)
    },
    [supported, selectedVoice],
  )

  const stop = useCallback(() => {
    if (supported) {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current)
      }
      synthRef.current.cancel()
      setSpeaking(false)
    }
  }, [supported])

  return { speak, stop, speaking, supported, voices, selectedVoice, setSelectedVoice }
}
