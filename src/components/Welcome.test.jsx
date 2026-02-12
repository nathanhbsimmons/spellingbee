import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Welcome from './Welcome'

beforeEach(() => {
  localStorage.clear()
})

describe('Welcome', () => {
  it('shows the first step on mount', () => {
    render(<Welcome onDone={() => {}} />)
    expect(screen.getByText(/welcome to bloom/i)).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('shows step indicator dots', () => {
    render(<Welcome onDone={() => {}} />)
    expect(screen.getByTestId('dot-0')).toBeInTheDocument()
    expect(screen.getByTestId('dot-1')).toBeInTheDocument()
    expect(screen.getByTestId('dot-2')).toBeInTheDocument()
    expect(screen.getByTestId('dot-3')).toBeInTheDocument()
  })

  it('does not show Back button on first step', () => {
    render(<Welcome onDone={() => {}} />)
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
  })

  it('advances to next step when Next is clicked', async () => {
    const user = userEvent.setup()
    render(<Welcome onDone={() => {}} />)
    await user.click(screen.getByText('Next'))
    expect(screen.getByText(/step 1: enter the words/i)).toBeInTheDocument()
  })

  it('shows Back button on second step', async () => {
    const user = userEvent.setup()
    render(<Welcome onDone={() => {}} />)
    await user.click(screen.getByText('Next'))
    expect(screen.getByText('Back')).toBeInTheDocument()
  })

  it('goes back to previous step when Back is clicked', async () => {
    const user = userEvent.setup()
    render(<Welcome onDone={() => {}} />)
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Back'))
    expect(screen.getByText(/welcome to bloom/i)).toBeInTheDocument()
  })

  it('shows Get Started on the last step', async () => {
    const user = userEvent.setup()
    render(<Welcome onDone={() => {}} />)
    // Navigate to last step (step 4, index 3)
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Next'))
    expect(screen.getByText(/step 3: review together/i)).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })

  it('does not show Skip tutorial on the last step', async () => {
    const user = userEvent.setup()
    render(<Welcome onDone={() => {}} />)
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Next'))
    expect(screen.queryByText(/skip tutorial/i)).not.toBeInTheDocument()
  })

  it('calls onDone and sets localStorage when Get Started is clicked', async () => {
    const user = userEvent.setup()
    const onDone = vi.fn()
    render(<Welcome onDone={onDone} />)
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Get Started'))
    expect(onDone).toHaveBeenCalled()
    expect(localStorage.getItem('spelling-collector-welcome-seen')).toBe('true')
  })

  it('calls onDone and sets localStorage when Skip tutorial is clicked', async () => {
    const user = userEvent.setup()
    const onDone = vi.fn()
    render(<Welcome onDone={onDone} />)
    await user.click(screen.getByText(/skip tutorial/i))
    expect(onDone).toHaveBeenCalled()
    expect(localStorage.getItem('spelling-collector-welcome-seen')).toBe('true')
  })

  it('shows the step icon', () => {
    render(<Welcome onDone={() => {}} />)
    expect(screen.getByTestId('step-icon').textContent).toBe('👋')
  })
})
