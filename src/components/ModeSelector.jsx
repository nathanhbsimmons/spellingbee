export default function ModeSelector({ onSelect }) {
  const modes = [
    {
      key: 'standard',
      name: 'Standard',
      description: 'Listen and type the word',
      emoji: '✏️',
    },
    {
      key: 'scramble',
      name: 'Letter Scramble',
      description: 'Unscramble the letters',
      emoji: '🔀',
    },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-2">
        Choose Practice Mode
      </h2>
      <p className="text-center text-gray-500 mb-6">
        How do you want to practice?
      </p>

      <div className="space-y-3">
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => onSelect(mode.key)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200
                       hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
          >
            <span className="text-3xl">{mode.emoji}</span>
            <div>
              <div className="font-semibold text-gray-800">{mode.name}</div>
              <div className="text-sm text-gray-500">{mode.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
