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
      <span className="text-xs text-amber-100 max-w-[50px] truncate text-center">{word}</span>
    </div>
  )
}

function TreasureBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 200" aria-hidden="true">
      {/* Treasure chest */}
      <g transform="translate(170,140)" opacity="0.4">
        {/* Chest body */}
        <rect x="0" y="15" width="60" height="35" rx="3" fill="#92400e" />
        {/* Chest lid */}
        <path d="M-2,15 Q30,-5 62,15" fill="#78350f" />
        <rect x="0" y="12" width="60" height="6" rx="2" fill="#92400e" />
        {/* Lock */}
        <circle cx="30" cy="30" r="5" fill="#fbbf24" />
        <rect x="28" y="30" width="4" height="6" fill="#fbbf24" />
        {/* Metal bands */}
        <rect x="0" y="20" width="60" height="2" fill="#78350f" opacity="0.5" />
        <rect x="0" y="38" width="60" height="2" fill="#78350f" opacity="0.5" />
      </g>
      {/* Skull and crossbones - pirate flag */}
      <g transform="translate(40,20)" opacity="0.2">
        {/* Flag pole */}
        <line x1="0" y1="0" x2="0" y2="60" stroke="#78350f" strokeWidth="2" />
        {/* Flag */}
        <rect x="0" y="0" width="35" height="25" fill="#1e293b" rx="1" />
        {/* Skull */}
        <circle cx="17" cy="10" r="5" fill="white" />
        <circle cx="14" cy="9" r="1" fill="#1e293b" />
        <circle cx="20" cy="9" r="1" fill="#1e293b" />
        {/* Crossbones */}
        <line x1="10" y1="18" x2="24" y2="22" stroke="white" strokeWidth="1.5" />
        <line x1="24" y1="18" x2="10" y2="22" stroke="white" strokeWidth="1.5" />
      </g>
      {/* Map/parchment */}
      <g transform="translate(320,30)" opacity="0.2">
        <rect x="0" y="0" width="40" height="30" rx="2" fill="#fde68a" />
        <line x1="5" y1="8" x2="35" y2="8" stroke="#92400e" strokeWidth="0.5" />
        <line x1="5" y1="14" x2="30" y2="14" stroke="#92400e" strokeWidth="0.5" />
        <line x1="5" y1="20" x2="25" y2="20" stroke="#92400e" strokeWidth="0.5" />
        <circle cx="30" cy="22" r="3" fill="none" stroke="#dc2626" strokeWidth="0.5" />
        <line x1="28" y1="20" x2="32" y2="24" stroke="#dc2626" strokeWidth="0.5" />
      </g>
      {/* Scattered coins */}
      <circle cx="100" cy="175" r="5" fill="#fbbf24" opacity="0.25" />
      <circle cx="115" cy="180" r="4" fill="#fbbf24" opacity="0.2" />
      <circle cx="290" cy="170" r="5" fill="#fbbf24" opacity="0.25" />
      <circle cx="305" cy="178" r="4" fill="#f59e0b" opacity="0.2" />
      {/* Sand */}
      <ellipse cx="200" cy="205" rx="220" ry="15" fill="#fbbf24" opacity="0.2" />
    </svg>
  )
}

export default function Treasure({ collectedWords, latestIndex }) {
  if (collectedWords.length === 0) return null

  return (
    <div className="mt-4 p-4 rounded-xl border border-amber-400 relative overflow-hidden"
         style={{ background: 'linear-gradient(to bottom, #78350f, #92400e 40%, #451a03)' }}>
      <TreasureBackground />
      <div className="flex flex-wrap justify-center gap-2 relative z-10">
        {collectedWords.map((word, i) => (
          <Gem key={i} index={i} word={word} isNew={i === latestIndex} />
        ))}
      </div>
    </div>
  )
}
