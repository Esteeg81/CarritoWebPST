import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Login from './Login'
import { AuthProvider } from '../context/AuthContext'
import { api, ApiError } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
  },
}))

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
  vi.mocked(api.post).mockReset()
})

describe('Login', () => {
  it('muestra error con credenciales incorrectas', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiError(401, 'Email o contraseña incorrectos.'),
    )
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'juan@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'incorrecta')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(
      await screen.findByText(/email o contraseña incorrectos/i),
    ).toBeInTheDocument()
  })

  it('navega a home con credenciales correctas', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      token: 'fake-token',
      user: { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com' },
    })
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'juan@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), '1234')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('Home')).toBeInTheDocument()
  })
})
