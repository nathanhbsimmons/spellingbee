import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Garden from './Garden'

describe('Garden', () => {
  it('renders nothing when no words are collected', () => {
    const { container } = render(<Garden collectedWords={[]} latestIndex={-1} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders one flower per collected word', () => {
    render(<Garden collectedWords={['apple', 'banana', 'cherry']} latestIndex={2} />)
    expect(screen.getByTestId('theme-item-0')).toBeInTheDocument()
    expect(screen.getByTestId('theme-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('theme-item-2')).toBeInTheDocument()
  })

  it('displays the typed word under each flower', () => {
    render(<Garden collectedWords={['apple', 'banana']} latestIndex={1} />)
    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.getByText('banana')).toBeInTheDocument()
  })

  it('has SVG flowers with accessible labels', () => {
    render(<Garden collectedWords={['apple']} latestIndex={0} />)
    expect(screen.getByLabelText('flower for apple')).toBeInTheDocument()
  })

  it('applies bloom animation to the latest flower', () => {
    render(<Garden collectedWords={['apple', 'banana']} latestIndex={1} />)
    const latest = screen.getByTestId('theme-item-1')
    expect(latest.className).toContain('bloom')
  })

  it('does not apply bloom animation to older flowers', () => {
    render(<Garden collectedWords={['apple', 'banana']} latestIndex={1} />)
    const older = screen.getByTestId('theme-item-0')
    expect(older.className).not.toContain('bloom')
  })

  it('renders different colored flowers', () => {
    render(
      <Garden
        collectedWords={['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']}
        latestIndex={8}
      />
    )
    // 9 flowers rendered (more than 8 colors, so it cycles)
    expect(screen.getByTestId('theme-item-8')).toBeInTheDocument()
  })
})
