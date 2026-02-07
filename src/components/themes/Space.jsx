const STAR_COLORS = ['#fbbf24', '#f9a8d4', '#93c5fd', '#86efac', '#fca5a5', '#c4b5fd', '#fdba74', '#67e8f9']

function Star({ index, word, isNew }) {
  const color = STAR_COLORS[index % STAR_COLORS.length]
  const size = 14 + (index % 3) * 4
  const points = []
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * (Math.PI / 180)
    const innerAngle = ((i * 72) + 36 - 90) * (Math.PI / 180)
    points.push(`${30 + size * Math.cos(angle)},${30 + size * Math.sin(angle)}`)
    points.push(`${30 + (size * 0.4) * Math.cos(innerAngle)},${30 + (size * 0.4) * Math.sin(innerAngle)}`)
  }

  return (
    <div
      className={`flex flex-col items-center gap-1 ${isNew ? 'animate-[bloom_0.6s_ease-out]' : ''}`}
      data-testid={`theme-item-${index}`}
    >
      <svg width="60" height="60" viewBox="0 0 60 60" aria-label={`star for ${word}`}>
        <polygon points={points.join(' ')} fill={color} opacity="0.9" />
        <circle cx="30" cy="30" r="4" fill="white" opacity="0.8" />
      </svg>
      <span className="text-xs text-gray-400 max-w-[60px] truncate text-center">{word}</span>
    </div>
  )
}

function SpaceBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 200" aria-hidden="true">
      {/* Distant stars */}
      <circle cx="20" cy="15" r="1" fill="white" opacity="0.6" />
      <circle cx="80" cy="45" r="1.5" fill="white" opacity="0.4" />
      <circle cx="140" cy="20" r="1" fill="white" opacity="0.5" />
      <circle cx="190" cy="60" r="1" fill="white" opacity="0.3" />
      <circle cx="250" cy="15" r="1.5" fill="white" opacity="0.5" />
      <circle cx="310" cy="50" r="1" fill="white" opacity="0.4" />
      <circle cx="370" cy="30" r="1" fill="white" opacity="0.6" />
      <circle cx="45" cy="80" r="1" fill="white" opacity="0.3" />
      <circle cx="160" cy="90" r="1" fill="white" opacity="0.4" />
      <circle cx="330" cy="85" r="1.5" fill="white" opacity="0.3" />
      <circle cx="385" cy="70" r="1" fill="white" opacity="0.5" />
      {/* Planet 1 - Saturn-like */}
      <circle cx="60" cy="160" r="18" fill="#a78bfa" opacity="0.3" />
      <ellipse cx="60" cy="160" rx="28" ry="5" fill="#c4b5fd" opacity="0.2" transform="rotate(-15 60 160)" />
      {/* Planet 2 - small red */}
      <circle cx="350" cy="150" r="12" fill="#f87171" opacity="0.25" />
      <circle cx="347" cy="147" r="3" fill="#fca5a5" opacity="0.2" />
      {/* Spaceship */}
      <g transform="translate(300,40)" opacity="0.35">
        <polygon points="0,-8 5,6 -5,6" fill="#93c5fd" />
        <rect x="-2" y="6" width="4" height="4" fill="#64748b" />
        <circle cx="0" cy="-2" r="2" fill="#e0f2fe" opacity="0.7" />
        {/* Flame */}
        <polygon points="-2,10 0,16 2,10" fill="#fb923c" opacity="0.6" />
      </g>
      {/* Nebula glow */}
      <circle cx="200" cy="100" r="60" fill="#6366f1" opacity="0.05" />
      <circle cx="180" cy="90" r="40" fill="#a855f7" opacity="0.04" />
    </svg>
  )
}

export default function Space({ collectedWords, latestIndex }) {
  if (collectedWords.length === 0) return null

  return (
    <div className="mt-4 p-4 rounded-xl border border-indigo-800 relative overflow-hidden"
         style={{ background: 'linear-gradient(to bottom, #0f172a, #1e1b4b 50%, #312e81)' }}>
      <SpaceBackground />
      <div className="flex flex-wrap justify-center gap-2 relative z-10">
        {collectedWords.map((word, i) => (
          <Star key={i} index={i} word={word} isNew={i === latestIndex} />
        ))}
      </div>
    </div>
  )
}
