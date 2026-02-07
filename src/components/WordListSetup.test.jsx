import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WordListSetup from './WordListSetup'

describe('WordListSetup', () => {
  it('renders the title and textarea', () => {
    render(<WordListSetup onStart={() => {}} />)
    expect(screen.getByText('Spelling Word Collector')).toBeInTheDocument()
    expect(screen.getByLabelText(/spelling words/i)).toBeInTheDocument()
  })

  it('disables the button when input is empty', () => {
    render(<WordListSetup onStart={() => {}} />)
    expect(screen.getByRole('button', { name: /start collecting/i })).toBeDisabled()
  })

  it('enables the button when words are entered', async () => {
    const user = userEvent.setup()
    render(<WordListSetup onStart={() => {}} />)
    await user.type(screen.getByLabelText(/spelling words/i), 'hello')
    expect(screen.getByRole('button', { name: /start collecting/i })).toBeEnabled()
  })

  it('calls onStart with parsed word list on submit', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<WordListSetup onStart={onStart} />)
    await user.type(screen.getByLabelText(/spelling words/i), 'apple\nbanana\ncherry')
    await user.click(screen.getByRole('button', { name: /start collecting/i }))
    expect(onStart).toHaveBeenCalledWith(['apple', 'banana', 'cherry'])
  })

  it('trims whitespace and filters empty lines', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<WordListSetup onStart={onStart} />)
    await user.type(screen.getByLabelText(/spelling words/i), '  apple  \n\n  banana  ')
    await user.click(screen.getByRole('button', { name: /start collecting/i }))
    expect(onStart).toHaveBeenCalledWith(['apple', 'banana'])
  })

  it('does not call onStart if all lines are empty', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<WordListSetup onStart={onStart} />)
    await user.type(screen.getByLabelText(/spelling words/i), '   ')
    await user.click(screen.getByRole('button', { name: /start collecting/i }))
    expect(onStart).not.toHaveBeenCalled()
  })
})
