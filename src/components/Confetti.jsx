import { useState, useEffect } from 'react'

const COLORS = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#fb923c', '#f87171']

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export default function Confetti({ count = 40 }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: randomBetween(0, 100),
        delay: randomBetween(0, 1.5),
        duration: randomBetween(1.5, 3),
        color: COLORS[i % COLORS.length],
        size: randomBetween(6, 12),
      }))
    )
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50" aria-hidden="true" data-testid="confetti">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: '-10px',
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
