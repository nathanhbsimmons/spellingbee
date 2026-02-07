import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Confetti from './Confetti'

describe('Confetti', () => {
  it('renders a confetti container', () => {
    render(<Confetti />)
    expect(screen.getByTestId('confetti')).toBeInTheDocument()
  })

  it('renders confetti pieces', () => {
    const { container } = render(<Confetti count={10} />)
    const pieces = container.querySelectorAll('[style*="confetti-fall"]')
    expect(pieces).toHaveLength(10)
  })

  it('is hidden from screen readers', () => {
    render(<Confetti />)
    expect(screen.getByTestId('confetti')).toHaveAttribute('aria-hidden', 'true')
  })
})
