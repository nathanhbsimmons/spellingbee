import { useState } from 'react'
import { dismissWelcome } from '../storage'

const STEPS = [
  {
    icon: '👋',
    title: 'Welcome to Spelling Word Collector!',
    description:
      'A fun, low-pressure way to practice spelling words. No grades, no stress — just collecting words and growing together.',
  },
  {
    icon: '📝',
    title: 'Step 1: Enter the Words',
    description:
      'A parent types in this week\'s spelling words (one per line), or saves them as a reusable word list in "Manage Word Lists" so you can come back to them anytime.',
  },
  {
    icon: '🎨',
    title: 'Step 2: Pick a Theme & Practice',
    description:
      'Your child picks a fun theme — Garden, Space, Treasure, or Aquarium — then listens to each word and types it. Every word gets "collected" with a cool animation!',
  },
  {
    icon: '🌸',
    title: 'Step 3: Review Together',
    description:
      'After all words are collected, sit down together to review. Correct words bloom, and any that need a fix can be re-typed right there. No pressure, just growth!',
  },
]

export default function Welcome({ onDone }) {
  const [step, setStep] = useState(0)

  const isFirst = step === 0
  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  function handleNext() {
    if (isLast) {
      dismissWelcome()
      onDone()
    } else {
      setStep(step + 1)
    }
  }

  function handleBack() {
    if (!isFirst) {
      setStep(step - 1)
    }
  }

  function handleSkip() {
    dismissWelcome()
    onDone()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
      <div className="text-center mb-6">
        <span className="text-6xl block mb-4" data-testid="step-icon">{current.icon}</span>
        <h2 className="text-2xl font-bold text-indigo-600 mb-3">{current.title}</h2>
        <p className="text-gray-500 leading-relaxed">{current.description}</p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {STEPS.map((_, i) => (
          <span
            key={i}
            data-testid={`dot-${i}`}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === step ? 'bg-indigo-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="flex gap-3">
        {!isFirst && (
          <button
            onClick={handleBack}
            className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold
                       hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold
                     hover:bg-indigo-700 transition-colors"
        >
          {isLast ? 'Get Started' : 'Next'}
        </button>
      </div>

      {!isLast && (
        <button
          onClick={handleSkip}
          className="mt-3 w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          Skip tutorial
        </button>
      )}
    </div>
  )
}
