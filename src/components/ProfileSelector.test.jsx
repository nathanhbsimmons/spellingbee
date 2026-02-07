import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileSelector from './ProfileSelector'
import { createProfile } from '../storage'

beforeEach(() => {
  localStorage.clear()
})

describe('ProfileSelector', () => {
  it('renders the title', () => {
    render(<ProfileSelector onDone={() => {}} />)
    expect(screen.getByText("Who's practicing today?")).toBeInTheDocument()
  })

  it('shows message when no profiles exist', () => {
    render(<ProfileSelector onDone={() => {}} />)
    expect(screen.getByText(/no profiles yet/i)).toBeInTheDocument()
  })

  it('shows profiles when they exist', () => {
    createProfile('Alice')
    createProfile('Bob')
    render(<ProfileSelector onDone={() => {}} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('selects a profile and calls onDone', async () => {
    const user = userEvent.setup()
    const onDone = vi.fn()
    createProfile('Alice')
    render(<ProfileSelector onDone={onDone} />)
    await user.click(screen.getByText('Alice'))
    expect(onDone).toHaveBeenCalled()
  })

  it('allows skipping profile selection', async () => {
    const user = userEvent.setup()
    const onDone = vi.fn()
    render(<ProfileSelector onDone={onDone} />)
    await user.click(screen.getByText(/continue without a profile/i))
    expect(onDone).toHaveBeenCalled()
  })

  it('shows device-local storage notice', () => {
    render(<ProfileSelector onDone={() => {}} />)
    expect(screen.getByTestId('storage-notice')).toBeInTheDocument()
    expect(screen.getByText(/data is saved on this device only/i)).toBeInTheDocument()
  })
})
