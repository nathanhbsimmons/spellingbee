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
      <span className="text-xs text-cyan-100 max-w-[60px] truncate text-center">{word}</span>
    </div>
  )
}

function OceanBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 200" aria-hidden="true">
      {/* Bubbles */}
      <circle cx="50" cy="40" r="4" fill="white" opacity="0.2" />
      <circle cx="55" cy="55" r="3" fill="white" opacity="0.15" />
      <circle cx="120" cy="30" r="5" fill="white" opacity="0.2" />
      <circle cx="200" cy="50" r="3" fill="white" opacity="0.15" />
      <circle cx="300" cy="35" r="4" fill="white" opacity="0.2" />
      <circle cx="350" cy="60" r="3" fill="white" opacity="0.15" />
      <circle cx="370" cy="25" r="5" fill="white" opacity="0.2" />
      {/* Seaweed left */}
      <path d="M30,200 Q25,170 35,150 Q28,130 38,110" stroke="#22c55e" strokeWidth="3" fill="none" opacity="0.4" />
      <path d="M50,200 Q45,175 55,160 Q48,140 58,120" stroke="#16a34a" strokeWidth="3" fill="none" opacity="0.35" />
      {/* Seaweed right */}
      <path d="M360,200 Q355,175 365,155 Q358,135 368,115" stroke="#22c55e" strokeWidth="3" fill="none" opacity="0.4" />
      <path d="M380,200 Q375,180 385,165 Q378,150 388,135" stroke="#16a34a" strokeWidth="3" fill="none" opacity="0.35" />
      {/* Sandy bottom */}
      <ellipse cx="200" cy="205" rx="220" ry="15" fill="#fbbf24" opacity="0.15" />
      {/* Small shells */}
      <ellipse cx="150" cy="192" rx="5" ry="3" fill="#fde68a" opacity="0.3" />
      <ellipse cx="270" cy="195" rx="4" ry="3" fill="#fed7aa" opacity="0.3" />
      {/* Water surface shimmer */}
      <line x1="0" y1="5" x2="80" y2="5" stroke="white" strokeWidth="1" opacity="0.15" />
      <line x1="120" y1="3" x2="200" y2="3" stroke="white" strokeWidth="1" opacity="0.1" />
      <line x1="250" y1="6" x2="350" y2="6" stroke="white" strokeWidth="1" opacity="0.12" />
    </svg>
  )
}

export default function Aquarium({ collectedWords, latestIndex }) {
  if (collectedWords.length === 0) return null

  return (
    <div className="mt-4 p-4 rounded-xl border border-cyan-400 relative overflow-hidden"
         style={{ background: 'linear-gradient(to bottom, #0ea5e9, #0284c7 30%, #0369a1 60%, #1e3a5f)' }}>
      <OceanBackground />
      <div className="flex flex-wrap justify-center gap-3 relative z-10">
        {collectedWords.map((word, i) => (
          <Fish key={i} index={i} word={word} isNew={i === latestIndex} />
        ))}
      </div>
    </div>
  )
}
