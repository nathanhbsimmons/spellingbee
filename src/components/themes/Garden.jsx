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

function GardenBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 200" aria-hidden="true">
      {/* Sun */}
      <circle cx="350" cy="25" r="20" fill="#fbbf24" opacity="0.7" />
      <circle cx="350" cy="25" r="28" fill="#fbbf24" opacity="0.2" />
      {/* Clouds */}
      <ellipse cx="80" cy="20" rx="30" ry="12" fill="white" opacity="0.6" />
      <ellipse cx="100" cy="18" rx="25" ry="10" fill="white" opacity="0.5" />
      <ellipse cx="250" cy="30" rx="35" ry="13" fill="white" opacity="0.5" />
      <ellipse cx="275" cy="28" rx="25" ry="10" fill="white" opacity="0.4" />
      {/* Hills */}
      <ellipse cx="100" cy="200" rx="180" ry="50" fill="#86efac" opacity="0.4" />
      <ellipse cx="320" cy="200" rx="150" ry="40" fill="#4ade80" opacity="0.3" />
      {/* Grass tufts */}
      <path d="M20,185 Q22,175 24,185" stroke="#4ade80" strokeWidth="1.5" fill="none" />
      <path d="M60,188 Q62,178 64,188" stroke="#4ade80" strokeWidth="1.5" fill="none" />
      <path d="M340,182 Q342,172 344,182" stroke="#4ade80" strokeWidth="1.5" fill="none" />
      <path d="M380,186 Q382,176 384,186" stroke="#4ade80" strokeWidth="1.5" fill="none" />
      {/* Small butterfly */}
      <g transform="translate(150,45)" opacity="0.5">
        <ellipse cx="-5" cy="0" rx="5" ry="3" fill="#c084fc" />
        <ellipse cx="5" cy="0" rx="5" ry="3" fill="#c084fc" />
        <line x1="0" y1="-3" x2="0" y2="3" stroke="#7c3aed" strokeWidth="1" />
      </g>
    </svg>
  )
}

export default function Garden({ collectedWords, latestIndex }) {
  if (collectedWords.length === 0) return null

  return (
    <div className="mt-4 p-4 rounded-xl border border-green-200 relative overflow-hidden"
         style={{ background: 'linear-gradient(to top, #dcfce7, #f0fdf4 40%, #ecfeff 70%, #bae6fd)' }}>
      <GardenBackground />
      <div className="flex flex-wrap justify-center gap-2 relative z-10">
        {collectedWords.map((word, i) => (
          <Flower key={i} index={i} word={word} isNew={i === latestIndex} />
        ))}
      </div>
    </div>
  )
}
