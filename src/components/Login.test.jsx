import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Login from './Login'
import { AuthProvider } from '../context/AuthContext'

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

describe('Login', () => {
  it('muestra error con credenciales incorrectas', async () => {
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
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'juan@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), '1234')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByText('Home')).toBeInTheDocument()
  })
})
