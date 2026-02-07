const GEM_CONFIGS = [
  { fill: '#ef4444', stroke: '#dc2626', shape: 'diamond' },
  { fill: '#3b82f6', stroke: '#2563eb', shape: 'diamond' },
  { fill: '#22c55e', stroke: '#16a34a', shape: 'diamond' },
  { fill: '#a855f7', stroke: '#9333ea', shape: 'diamond' },
  { fill: '#fbbf24', stroke: '#f59e0b', shape: 'coin' },
  { fill: '#f472b6', stroke: '#ec4899', shape: 'diamond' },
  { fill: '#06b6d4', stroke: '#0891b2', shape: 'diamond' },
  { fill: '#fbbf24', stroke: '#d97706', shape: 'coin' },
]

function Gem({ index, word, isNew }) {
  const config = GEM_CONFIGS[index % GEM_CONFIGS.length]

  return (
    <div
      className={`flex flex-col items-center gap-1 ${isNew ? 'animate-[bloom_0.6s_ease-out]' : ''}`}
      data-testid={`theme-item-${index}`}
    >
      <svg width="50" height="50" viewBox="0 0 50 50" aria-label={`gem for ${word}`}>
        {config.shape === 'coin' ? (
          <>
            <circle cx="25" cy="25" r="18" fill={config.fill} stroke={config.stroke} strokeWidth="2" />
            <circle cx="25" cy="25" r="13" fill="none" stroke={config.stroke} strokeWidth="1" opacity="0.5" />
            <text x="25" y="30" textAnchor="middle" fontSize="14" fill={config.stroke} fontWeight="bold">$</text>
          </>
        ) : (
          <>
            <polygon points="25,4 44,25 25,46 6,25" fill={config.fill} stroke={config.stroke} strokeWidth="2" />
            <polygon points="25,10 38,25 25,40 12,25" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
          </>
        )}
      </svg>
      <span className="text-xs text-gray-500 max-w-[50px] truncate text-center">{word}</span>
    </div>
  )
}

export default function Treasure({ collectedWords, latestIndex }) {
  if (collectedWords.length === 0) return null

  return (
    <div className="mt-4 p-4 bg-gradient-to-t from-amber-100 to-amber-50 rounded-xl border border-amber-300">
      <div className="flex flex-wrap justify-center gap-2">
        {collectedWords.map((word, i) => (
          <Gem key={i} index={i} word={word} isNew={i === latestIndex} />
        ))}
      </div>
    </div>
  )
}
