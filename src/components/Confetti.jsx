import { useState, useEffect } from 'react'

const DEFAULT_COLORS = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#fb923c', '#f87171']

const THEME_COLORS = {
  garden: ['#f472b6', '#c084fc', '#86efac', '#fbbf24', '#fb7185', '#a3e635', '#f9a8d4'],
  space: ['#818cf8', '#c084fc', '#60a5fa', '#fbbf24', '#f472b6', '#38bdf8', '#a78bfa'],
  treasure: ['#fbbf24', '#f59e0b', '#f472b6', '#c084fc', '#60a5fa', '#fb923c', '#34d399'],
  aquarium: ['#38bdf8', '#22d3ee', '#60a5fa', '#34d399', '#818cf8', '#f472b6', '#a78bfa'],
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export default function Confetti({ count = 60, theme }) {
  const [pieces, setPieces] = useState([])

  const colors = (theme && THEME_COLORS[theme]) || DEFAULT_COLORS

  useEffect(() => {
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: randomBetween(0, 100),
        top: randomBetween(-10, 10),
        delay: randomBetween(0, 2),
        duration: randomBetween(2, 4),
        color: colors[i % colors.length],
        size: randomBetween(6, 14),
      }))
    )
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50" aria-hidden="true" data-testid="confetti">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          data-theme={theme || 'default'}
          style={{
            left: `${p.left}%`,
            top: `${p.top}px`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
