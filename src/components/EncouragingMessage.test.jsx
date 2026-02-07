import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import EncouragingMessage from './EncouragingMessage'

describe('EncouragingMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not render for the first word', () => {
    render(<EncouragingMessage currentIndex={0} />)
    expect(screen.queryByTestId('encouraging-message')).not.toBeInTheDocument()
  })

  it('shows a message every 3rd word', () => {
    render(<EncouragingMessage currentIndex={3} />)
    expect(screen.getByTestId('encouraging-message')).toBeInTheDocument()
  })

  it('hides the message after a timeout', () => {
    render(<EncouragingMessage currentIndex={3} />)
    expect(screen.getByTestId('encouraging-message')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByTestId('encouraging-message')).not.toBeInTheDocument()
  })

  it('does not show for non-multiples of 3', () => {
    render(<EncouragingMessage currentIndex={2} />)
    expect(screen.queryByTestId('encouraging-message')).not.toBeInTheDocument()
  })
})
