import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Profile from './Profile'
import { AuthProvider } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'
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

const mockUser = {
  id: 1,
  nombre: 'Cliente Viejo',
  email: 'cliente@example.com',
  telefono: '',
  role: 'CUSTOMER',
}

function renderProfile() {
  localStorage.setItem('carritoweb_token', 'fake-token')
  vi.mocked(api.get).mockResolvedValueOnce({ user: mockUser })

  return render(
    <MemoryRouter>
      <AuthProvider>
        <ToastProvider>
          <Profile />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.mocked(api.get).mockReset()
  vi.mocked(api.patch).mockReset()
})

describe('Profile', () => {
  it('muestra los datos actuales del usuario, con el teléfono vacío si falta', async () => {
    renderProfile()

    expect(await screen.findByDisplayValue('Cliente Viejo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('cliente@example.com')).toBeInTheDocument()
    expect(screen.getByLabelText(/teléfono/i)).toHaveValue('')
  })

  it('el campo de email está deshabilitado', async () => {
    renderProfile()

    await screen.findByDisplayValue('Cliente Viejo')
    expect(screen.getByLabelText(/^email$/i)).toBeDisabled()
  })

  it('permite completar el teléfono faltante y guardar', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({
      user: { ...mockUser, telefono: '5491122334455' },
    })
    const user = userEvent.setup()
    renderProfile()

    await screen.findByDisplayValue('Cliente Viejo')
    await user.type(screen.getByLabelText(/teléfono/i), '5491122334455')
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(api.patch).toHaveBeenCalledWith(
      '/api/auth/me',
      { nombre: 'Cliente Viejo', telefono: '5491122334455' },
      'fake-token',
    )
    expect(
      await screen.findByText('Tus datos se actualizaron correctamente.'),
    ).toBeInTheDocument()
  })

  it('muestra un error si el teléfono no es válido', async () => {
    const user = userEvent.setup()
    renderProfile()

    await screen.findByDisplayValue('Cliente Viejo')
    await user.type(screen.getByLabelText(/teléfono/i), '123')
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(
      await screen.findByText(/teléfono debe tener entre 8 y 15 dígitos/i),
    ).toBeInTheDocument()
    expect(api.patch).not.toHaveBeenCalled()
  })

  it('muestra un error si falla el guardado', async () => {
    vi.mocked(api.patch).mockRejectedValueOnce(new ApiError(400, 'Email ya en uso.'))
    const user = userEvent.setup()
    renderProfile()

    await screen.findByDisplayValue('Cliente Viejo')
    await user.type(screen.getByLabelText(/teléfono/i), '5491122334455')
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(await screen.findByText('Email ya en uso.')).toBeInTheDocument()
  })
})
