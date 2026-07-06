import { describe, it, expect, vi, afterEach } from 'vitest'

const mockSend = vi.fn()

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function (this: { emails: { send: typeof mockSend } }) {
    this.emails = { send: mockSend }
  }),
}))

describe('sendAdminNotification', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    mockSend.mockReset()
  })

  it('no envía nada si RESEND_API_KEY no está configurada', async () => {
    vi.resetModules()
    const { sendAdminNotification } = await import('./mailer.js')

    await sendAdminNotification('Asunto', 'Cuerpo')

    expect(mockSend).not.toHaveBeenCalled()
  })

  it('envía un mail al admin cuando RESEND_API_KEY está configurada', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    vi.stubEnv('ADMIN_EMAIL', 'admin@example.com')
    vi.resetModules()
    const { sendAdminNotification } = await import('./mailer.js')

    await sendAdminNotification('Nuevo pedido #1', 'Detalle del pedido')

    expect(mockSend).toHaveBeenCalledWith({
      from: 'Carrito Web <onboarding@resend.dev>',
      to: 'admin@example.com',
      subject: 'Nuevo pedido #1',
      text: 'Detalle del pedido',
    })
  })

  it('no lanza un error si el envío falla', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    vi.stubEnv('ADMIN_EMAIL', 'admin@example.com')
    mockSend.mockRejectedValueOnce(new Error('network error'))
    vi.resetModules()
    const { sendAdminNotification } = await import('./mailer.js')

    await expect(sendAdminNotification('Asunto', 'Cuerpo')).resolves.toBeUndefined()
  })
})
