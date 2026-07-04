import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'

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

describe('ProtectedRoute', () => {
  it('redirige a /login si no hay sesión iniciada', () => {
    renderProtected()

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('muestra el contenido si hay una sesión iniciada', () => {
    localStorage.setItem(
      'carritoweb_user',
      JSON.stringify({ id: 1, nombre: 'Juan Pérez', email: 'juan@example.com' }),
    )

    renderProtected()

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })
})
