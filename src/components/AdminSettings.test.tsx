import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminSettings from './AdminSettings'
import { AuthProvider } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'
import { ThemeProvider, DEFAULT_SETTINGS } from '../context/ThemeContext'
import { api, ApiError } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
  },
}))

function renderAdminSettings() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AdminSettings />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(api.get).mockReset().mockResolvedValue(null)
  vi.mocked(api.patch).mockReset()
})

describe('AdminSettings', () => {
  it('muestra los valores actuales de configuración', async () => {
    renderAdminSettings()

    expect(await screen.findByDisplayValue('Sans-serif (por defecto)')).toBeInTheDocument()
  })

  it('guarda los cambios y muestra una notificación', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({
      ...DEFAULT_SETTINGS,
      headerBg: '#ff0000',
    })
    const user = userEvent.setup()
    renderAdminSettings()

    await screen.findByText('Configuración del sitio')
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(api.patch).toHaveBeenCalledWith(
      '/api/admin/settings',
      DEFAULT_SETTINGS,
      null,
    )
    expect(
      await screen.findByText('Configuración del sitio actualizada.'),
    ).toBeInTheDocument()
  })

  it('muestra un error si falla el guardado', async () => {
    vi.mocked(api.patch).mockRejectedValueOnce(new ApiError(400, 'Color inválido.'))
    const user = userEvent.setup()
    renderAdminSettings()

    await screen.findByText('Configuración del sitio')
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(await screen.findByText('Color inválido.')).toBeInTheDocument()
  })
})
