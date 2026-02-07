export default function Complete({ words, collectedWords, onStartOver }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <h2 className="text-3xl font-bold text-indigo-600 mb-2">
        All done collecting!
      </h2>
      <p className="text-gray-500 mb-6">
        You collected {collectedWords.length} word{collectedWords.length !== 1 ? 's' : ''}
      </p>

      <ul className="text-left space-y-2 mb-8">
        {words.map((word, i) => {
          const typed = collectedWords[i] ?? ''
          const match = typed.toLowerCase() === word.toLowerCase()
          return (
            <li
              key={i}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
            >
              <span className="text-lg font-medium text-gray-800">{typed}</span>
              {match ? (
                <span className="text-green-500 text-xl">&#10003;</span>
              ) : (
                <span className="text-sm text-gray-400">{word}</span>
              )}
            </li>
          )
        })}
      </ul>

      <button
        onClick={onStartOver}
        className="w-full bg-indigo-600 text-white text-lg font-semibold
                   py-3 rounded-xl hover:bg-indigo-700 transition-colors"
      >
        Collect More Words
      </button>
    </div>
  )
}
