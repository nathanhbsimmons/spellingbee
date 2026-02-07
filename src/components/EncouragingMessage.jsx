import { useState, useEffect } from 'react'

const MESSAGES = [
  'Great job collecting!',
  'You\'re doing awesome!',
  'Keep going!',
  'Nice work!',
  'You\'re a word collector!',
  'Almost there!',
  'Looking good!',
  'Fantastic effort!',
]

export default function EncouragingMessage({ currentIndex }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (currentIndex > 0 && currentIndex % 3 === 0) {
      setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)])
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [currentIndex])

  if (!visible) return null

  return (
    <div
      className="text-center text-indigo-500 font-medium text-sm mt-3 animate-[fade-in-up_0.3s_ease-out]"
      data-testid="encouraging-message"
    >
      {message}
    </div>
  )
}
