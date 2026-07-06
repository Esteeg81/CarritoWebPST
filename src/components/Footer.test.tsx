import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from './Footer'

describe('Footer', () => {
  it('muestra los enlaces a redes sociales', () => {
    render(<Footer />)

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
