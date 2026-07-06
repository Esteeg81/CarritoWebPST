import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from './Footer'
import { ThemeProvider } from '../context/ThemeContext'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

beforeEach(() => {
  vi.mocked(api.get).mockReset().mockResolvedValue(null)
})

function renderFooter() {
  return render(
    <ThemeProvider>
      <Footer />
    </ThemeProvider>,
  )
}

describe('Footer', () => {
  it('muestra los enlaces a redes sociales', () => {
    renderFooter()

    expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute(
      'href',
      expect.stringContaining('instagram.com'),
    )
    expect(screen.getByRole('link', { name: /facebook/i })).toHaveAttribute(
      'href',
      expect.stringContaining('facebook.com'),
    )
  })
})
