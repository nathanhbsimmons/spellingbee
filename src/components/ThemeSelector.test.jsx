import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeSelector from './ThemeSelector'

describe('ThemeSelector', () => {
  it('renders the title', () => {
    render(<ThemeSelector selectedTheme="garden" onSelect={() => {}} />)
    expect(screen.getByText('Pick Your Collection Theme')).toBeInTheDocument()
  })

  it('renders all four theme options', () => {
    render(<ThemeSelector selectedTheme="garden" onSelect={() => {}} />)
    expect(screen.getByText('Garden')).toBeInTheDocument()
    expect(screen.getByText('Space')).toBeInTheDocument()
    expect(screen.getByText('Treasure')).toBeInTheDocument()
    expect(screen.getByText('Aquarium')).toBeInTheDocument()
  })

  it('renders theme emojis', () => {
    render(<ThemeSelector selectedTheme="garden" onSelect={() => {}} />)
    expect(screen.getByText('🌸')).toBeInTheDocument()
    expect(screen.getByText('🚀')).toBeInTheDocument()
    expect(screen.getByText('💎')).toBeInTheDocument()
    expect(screen.getByText('🐠')).toBeInTheDocument()
  })

  it('calls onSelect with the theme key when a theme is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ThemeSelector selectedTheme="garden" onSelect={onSelect} />)
    await user.click(screen.getByText('Space'))
    expect(onSelect).toHaveBeenCalledWith('space')
  })

  it('highlights the selected theme', () => {
    render(<ThemeSelector selectedTheme="treasure" onSelect={() => {}} />)
    const treasureBtn = screen.getByText('Treasure').closest('button')
    expect(treasureBtn.className).toContain('border-indigo-500')
  })

  it('shows back button when onBack is provided', () => {
    render(<ThemeSelector selectedTheme="garden" onSelect={() => {}} onBack={() => {}} />)
    expect(screen.getByText('Back')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<ThemeSelector selectedTheme="garden" onSelect={() => {}} onBack={onBack} />)
    await user.click(screen.getByText('Back'))
    expect(onBack).toHaveBeenCalled()
  })

  it('does not show back button when onBack is not provided', () => {
    render(<ThemeSelector selectedTheme="garden" onSelect={() => {}} />)
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
  })
})
