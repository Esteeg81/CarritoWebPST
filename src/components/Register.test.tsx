import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Register from './Register'
import { AuthProvider } from '../context/AuthContext'

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/registro']}>
      <AuthProvider>
        <Routes>
          <Route path="/registro" element={<Register />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

interface FormValues {
  nombre: string
  email: string
  password: string
  confirmPassword: string
}

async function fillForm(user: UserEvent, values: FormValues) {
  await user.type(screen.getByLabelText(/^nombre$/i), values.nombre)
  await user.type(screen.getByLabelText(/^email$/i), values.email)
  await user.type(screen.getByLabelText(/^contraseña$/i), values.password)
  await user.type(screen.getByLabelText(/confirmar contraseña/i), values.confirmPassword)
}

describe('Register', () => {
  it('muestra error si las contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    renderRegister()

    await fillForm(user, {
      nombre: 'Test',
      email: 'test@example.com',
      password: '1234',
      confirmPassword: '4321',
    })
    await user.click(screen.getByRole('button', { name: /registrarme/i }))

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument()
  })

  it('rechaza un email ya registrado', async () => {
    const user = userEvent.setup()
    renderRegister()

    await fillForm(user, {
      nombre: 'Test',
      email: 'juan@example.com',
      password: '1234',
      confirmPassword: '1234',
    })
    await user.click(screen.getByRole('button', { name: /registrarme/i }))

    expect(await screen.findByText(/ya está registrado/i)).toBeInTheDocument()
  })

  it('registra y navega a home con datos válidos', async () => {
    const user = userEvent.setup()
    renderRegister()

    await fillForm(user, {
      nombre: 'Nuevo',
      email: 'nuevo@example.com',
      password: '1234',
      confirmPassword: '1234',
    })
    await user.click(screen.getByRole('button', { name: /registrarme/i }))

    expect(await screen.findByText('Home')).toBeInTheDocument()
  })
})
