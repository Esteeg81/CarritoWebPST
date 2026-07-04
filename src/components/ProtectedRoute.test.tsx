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

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
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
    renderProtected()

    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })

  it('muestra el contenido si hay una sesión válida', async () => {
    localStorage.setItem('carritoweb_token', 'valid-token')
    vi.mocked(api.get).mockResolvedValueOnce({
      user: { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com' },
    })

    renderProtected()

    expect(await screen.findByText('Contenido protegido')).toBeInTheDocument()
  })
})
