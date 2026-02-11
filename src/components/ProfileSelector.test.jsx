import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileSelector from './ProfileSelector'
import { renderWithFamily, createMockProfile } from '../test/utils'
import { loadProfiles } from '../db'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('ProfileSelector', () => {
  it('renders the title', async () => {
    renderWithFamily(<ProfileSelector onDone={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText("Who's practicing today?")).toBeInTheDocument()
    })
  })

  it('shows message when no profiles exist', async () => {
    loadProfiles.mockResolvedValue([])
    renderWithFamily(<ProfileSelector onDone={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText(/no profiles yet/i)).toBeInTheDocument()
    })
  })

  it('shows profiles when they exist', async () => {
    const profiles = [
      createMockProfile({ name: 'Alice' }),
      createMockProfile({ name: 'Bob' }),
    ]
    loadProfiles.mockResolvedValue(profiles)
    renderWithFamily(<ProfileSelector onDone={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })
  })

  it('selects a profile and calls onDone', async () => {
    const user = userEvent.setup()
    const onDone = vi.fn()
    const profiles = [createMockProfile({ name: 'Alice' })]
    loadProfiles.mockResolvedValue(profiles)
    renderWithFamily(<ProfileSelector onDone={onDone} />)
    await waitFor(() => screen.getByText('Alice'))
    await user.click(screen.getByText('Alice'))
    expect(onDone).toHaveBeenCalled()
  })

  it('allows skipping profile selection', async () => {
    const user = userEvent.setup()
    const onDone = vi.fn()
    loadProfiles.mockResolvedValue([])
    renderWithFamily(<ProfileSelector onDone={onDone} />)
    await waitFor(() => screen.getByText(/continue without a profile/i))
    await user.click(screen.getByText(/continue without a profile/i))
    expect(onDone).toHaveBeenCalled()
  })

  it('shows sync notice', async () => {
    loadProfiles.mockResolvedValue([])
    renderWithFamily(<ProfileSelector onDone={() => {}} />)
    await waitFor(() => {
      expect(screen.getByTestId('storage-notice')).toBeInTheDocument()
      expect(screen.getByText(/data syncs across all devices/i)).toBeInTheDocument()
    })
  })
})
