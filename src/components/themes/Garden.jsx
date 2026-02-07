const FLOWER_COLORS = [
  { petals: '#f472b6', center: '#fbbf24' },
  { petals: '#a78bfa', center: '#f9a8d4' },
  { petals: '#60a5fa', center: '#fcd34d' },
  { petals: '#fb923c', center: '#fde68a' },
  { petals: '#f87171', center: '#fdba74' },
  { petals: '#34d399', center: '#fbbf24' },
  { petals: '#c084fc', center: '#86efac' },
  { petals: '#38bdf8', center: '#f9a8d4' },
]

function Flower({ index, word, isNew }) {
  const colors = FLOWER_COLORS[index % FLOWER_COLORS.length]
  const cx = 30
  const cy = 30
  const petalR = 10
  const offsets = [
    [0, -14], [14, 0], [0, 14], [-14, 0],
    [10, -10], [10, 10], [-10, 10], [-10, -10],
  ]

  return (
    <div
      className={`flex flex-col items-center gap-1 ${isNew ? 'animate-[bloom_0.6s_ease-out]' : ''}`}
      data-testid={`theme-item-${index}`}
    >
      <svg width="60" height="70" viewBox="0 0 60 70" aria-label={`flower for ${word}`}>
        {/* Stem */}
        <line x1="30" y1="42" x2="30" y2="68" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
        {/* Leaf */}
        <ellipse cx="36" cy="56" rx="7" ry="3" fill="#4ade80" transform="rotate(-30 36 56)" />
        {/* Petals */}
        {offsets.map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx} cy={cy + dy} r={petalR} fill={colors.petals} opacity="0.85" />
        ))}
        {/* Center */}
        <circle cx={cx} cy={cy} r="7" fill={colors.center} />
      </svg>
      <span className="text-xs text-gray-500 max-w-[60px] truncate text-center">
        {word}
      </span>
    </div>
  )
}

export default function Garden({ collectedWords, latestIndex }) {
  if (collectedWords.length === 0) return null

  return (
    <div className="mt-4 p-4 bg-gradient-to-t from-green-100 to-green-50 rounded-xl border border-green-200">
      <div className="flex flex-wrap justify-center gap-2">
        {collectedWords.map((word, i) => (
          <Flower key={i} index={i} word={word} isNew={i === latestIndex} />
        ))}
      </div>
    </div>
  )
}
