import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { THEMES } from './index'

describe.each(Object.entries(THEMES))('%s theme', (key, theme) => {
  const Component = theme.component

  it('renders nothing when no words are collected', () => {
    const { container } = render(<Component collectedWords={[]} latestIndex={-1} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders one item per collected word', () => {
    render(<Component collectedWords={['apple', 'banana', 'cherry']} latestIndex={2} />)
    expect(screen.getByTestId('theme-item-0')).toBeInTheDocument()
    expect(screen.getByTestId('theme-item-2')).toBeInTheDocument()
  })

  it('displays the typed word under each item', () => {
    render(<Component collectedWords={['hello']} latestIndex={0} />)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
