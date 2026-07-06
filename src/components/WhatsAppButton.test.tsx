import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import WhatsAppButton from './WhatsAppButton'

describe('WhatsAppButton', () => {
  it('enlaza a WhatsApp con el número de la empresa', () => {
    render(<WhatsAppButton />)

    const link = screen.getByRole('link', { name: /consultanos por whatsapp/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('https://wa.me/543425112970'))
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
