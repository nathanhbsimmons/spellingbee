import { THEMES } from './themes'

export default function ThemeSelector({ selectedTheme, onSelect }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-[fade-in-up_0.3s_ease-out]">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-2">
        Pick Your Collection Theme
      </h2>
      <p className="text-center text-gray-500 mb-6">
        How do you want to collect your words today?
      </p>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(THEMES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl
                       border-2 transition-all hover:scale-105
                       ${selectedTheme === key
                         ? 'border-indigo-500 bg-indigo-50 shadow-md'
                         : 'border-gray-200 hover:border-indigo-300'
                       }`}
          >
            <span className="text-4xl">{theme.emoji}</span>
            <span className="font-semibold text-gray-700">{theme.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
