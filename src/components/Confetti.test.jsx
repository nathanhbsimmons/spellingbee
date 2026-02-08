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

  // Sprint 3: Themed confetti and full-page coverage
  it('renders 60 pieces by default', () => {
    const { container } = render(<Confetti />)
    const pieces = container.querySelectorAll('[style*="confetti-fall"]')
    expect(pieces).toHaveLength(60)
  })

  it('applies theme data attribute to pieces when theme is provided', () => {
    const { container } = render(<Confetti count={5} theme="aquarium" />)
    const pieces = container.querySelectorAll('[data-theme="aquarium"]')
    expect(pieces).toHaveLength(5)
  })

  it('uses default data-theme when no theme is provided', () => {
    const { container } = render(<Confetti count={5} />)
    const pieces = container.querySelectorAll('[data-theme="default"]')
    expect(pieces).toHaveLength(5)
  })
})
