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

export default function Space({ collectedWords, latestIndex }) {
  if (collectedWords.length === 0) return null

  return (
    <div className="mt-4 p-4 bg-gradient-to-t from-indigo-950 to-slate-900 rounded-xl border border-indigo-800">
      <div className="flex flex-wrap justify-center gap-2">
        {collectedWords.map((word, i) => (
          <Star key={i} index={i} word={word} isNew={i === latestIndex} />
        ))}
      </div>
    </div>
  )
}
