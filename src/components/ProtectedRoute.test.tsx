import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'
import { api } from '../lib/api'

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

function renderProtected(initialRoute: string, adminOnly = false) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
          <Route
            path={initialRoute}
            element={
              <ProtectedRoute adminOnly={adminOnly}>
                <div>Contenido protegido</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
  vi.mocked(api.post).mockReset()
})

describe('ProtectedRoute', () => {
  it('redirige a /login si no hay sesión iniciada', async () => {
    renderProtected('/checkout')

    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })

  it('muestra el contenido si hay una sesión válida', async () => {
    localStorage.setItem('carritoweb_token', 'valid-token')
    vi.mocked(api.get).mockResolvedValueOnce({
      user: { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', role: 'CUSTOMER' },
    })

    renderProtected('/checkout')

    expect(await screen.findByText('Contenido protegido')).toBeInTheDocument()
  })

  it('redirige a home si adminOnly y el usuario no es admin', async () => {
    localStorage.setItem('carritoweb_token', 'valid-token')
    vi.mocked(api.get).mockResolvedValueOnce({
      user: { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', role: 'CUSTOMER' },
    })

    renderProtected('/admin', true)

    expect(await screen.findByText('Home Page')).toBeInTheDocument()
  })

  it('muestra el contenido si adminOnly y el usuario es admin', async () => {
    localStorage.setItem('carritoweb_token', 'valid-token')
    vi.mocked(api.get).mockResolvedValueOnce({
      user: { id: 1, nombre: 'Dueño', email: 'admin@example.com', role: 'ADMIN' },
    })

    renderProtected('/admin', true)

    expect(await screen.findByText('Contenido protegido')).toBeInTheDocument()
  })
})
