import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModeSelector from './ModeSelector'

describe('ModeSelector', () => {
  it('renders the title', () => {
    render(<ModeSelector onSelect={() => {}} />)
    expect(screen.getByText('Choose Practice Mode')).toBeInTheDocument()
  })

  it('shows Standard and Scramble modes', () => {
    render(<ModeSelector onSelect={() => {}} />)
    expect(screen.getByText('Standard')).toBeInTheDocument()
    expect(screen.getByText('Letter Scramble')).toBeInTheDocument()
  })

  it('calls onSelect with "standard" when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ModeSelector onSelect={onSelect} />)
    await user.click(screen.getByText('Standard'))
    expect(onSelect).toHaveBeenCalledWith('standard')
  })

  it('calls onSelect with "scramble" when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ModeSelector onSelect={onSelect} />)
    await user.click(screen.getByText('Letter Scramble'))
    expect(onSelect).toHaveBeenCalledWith('scramble')
  })
})
