const FISH_COLORS = ['#f472b6', '#60a5fa', '#fbbf24', '#34d399', '#fb923c', '#a78bfa', '#f87171', '#38bdf8']

function Fish({ index, word, isNew }) {
  const color = FISH_COLORS[index % FISH_COLORS.length]
  const flip = index % 2 === 0

  return (
    <div
      className={`flex flex-col items-center gap-1 ${isNew ? 'animate-[bloom_0.6s_ease-out]' : ''}`}
      data-testid={`theme-item-${index}`}
    >
      <svg
        width="60"
        height="40"
        viewBox="0 0 60 40"
        aria-label={`fish for ${word}`}
        style={flip ? { transform: 'scaleX(-1)' } : undefined}
      >
        {/* Body */}
        <ellipse cx="28" cy="20" rx="18" ry="12" fill={color} />
        {/* Tail */}
        <polygon points="46,20 58,8 58,32" fill={color} opacity="0.8" />
        {/* Eye */}
        <circle cx="18" cy="16" r="3" fill="white" />
        <circle cx="17" cy="15" r="1.5" fill="#1e293b" />
        {/* Stripe */}
        <ellipse cx="30" cy="20" rx="4" ry="10" fill="white" opacity="0.2" />
      </svg>
      <span className="text-xs text-gray-500 max-w-[60px] truncate text-center">{word}</span>
    </div>
  )
}

export default function Aquarium({ collectedWords, latestIndex }) {
  if (collectedWords.length === 0) return null

  return (
    <div className="mt-4 p-4 bg-gradient-to-t from-cyan-200 to-blue-100 rounded-xl border border-cyan-300">
      <div className="flex flex-wrap justify-center gap-3">
        {collectedWords.map((word, i) => (
          <Fish key={i} index={i} word={word} isNew={i === latestIndex} />
        ))}
      </div>
    </div>
  )
}
