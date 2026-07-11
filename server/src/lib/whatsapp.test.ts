import { describe, it, expect, vi, afterEach } from 'vitest'

describe('sendAdminWhatsApp', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('no hace nada si CALLMEBOT_API_KEY o WHATSAPP_ADMIN_PHONE no están configuradas', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.resetModules()
    const { sendAdminWhatsApp } = await import('./whatsapp.js')

    const sent = await sendAdminWhatsApp('Mensaje de prueba')

    expect(fetchMock).not.toHaveBeenCalled()
    expect(sent).toBe(false)
  })

  it('llama a la API de CallMeBot cuando está configurado', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('CALLMEBOT_API_KEY', 'test-key')
    vi.stubEnv('WHATSAPP_ADMIN_PHONE', '543425112970')
    vi.resetModules()
    const { sendAdminWhatsApp } = await import('./whatsapp.js')

    const sent = await sendAdminWhatsApp('Mensaje de prueba')

    expect(sent).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const calledUrl = fetchMock.mock.calls[0][0] as string
    expect(calledUrl).toContain('https://api.callmebot.com/whatsapp.php')
    expect(calledUrl).toContain('phone=543425112970')
    expect(calledUrl).toContain('apikey=test-key')
    expect(calledUrl).toContain('text=Mensaje%20de%20prueba')
  })

  it('no lanza un error si la petición falla', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network error'))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('CALLMEBOT_API_KEY', 'test-key')
    vi.stubEnv('WHATSAPP_ADMIN_PHONE', '543425112970')
    vi.resetModules()
    const { sendAdminWhatsApp } = await import('./whatsapp.js')

    await expect(sendAdminWhatsApp('Mensaje')).resolves.toBe(false)
  })
})
