import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Register from './Register'
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
  telefono: string
  password: string
  confirmPassword: string
}

async function fillForm(user: UserEvent, values: FormValues) {
  await user.type(screen.getByLabelText(/^nombre$/i), values.nombre)
  await user.type(screen.getByLabelText(/^email$/i), values.email)
  await user.type(screen.getByLabelText(/^teléfono$/i), values.telefono)
  await user.type(screen.getByLabelText(/^contraseña$/i), values.password)
  await user.type(screen.getByLabelText(/confirmar contraseña/i), values.confirmPassword)
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
  vi.mocked(api.post).mockReset()
})

describe('Register', () => {
  it('muestra error si las contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    renderRegister()

    await fillForm(user, {
      nombre: 'Test',
      email: 'test@example.com',
      telefono: '5491122334455',
      password: '1234',
      confirmPassword: '4321',
    })
    await user.click(screen.getByRole('button', { name: /registrarme/i }))

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('muestra error si el teléfono no es válido', async () => {
    const user = userEvent.setup()
    renderRegister()

    await fillForm(user, {
      nombre: 'Test',
      email: 'test@example.com',
      telefono: '123',
      password: '1234',
      confirmPassword: '1234',
    })
    await user.click(screen.getByRole('button', { name: /registrarme/i }))

    expect(await screen.findByText(/teléfono debe tener entre 8 y 15 dígitos/i)).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('rechaza un email ya registrado', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiError(409, 'Ese email ya está registrado.'),
    )
    const user = userEvent.setup()
    renderRegister()

    await fillForm(user, {
      nombre: 'Test',
      email: 'juan@example.com',
      telefono: '5491122334455',
      password: '1234',
      confirmPassword: '1234',
    })
    await user.click(screen.getByRole('button', { name: /registrarme/i }))

    expect(await screen.findByText(/ya está registrado/i)).toBeInTheDocument()
  })

  it('registra y navega a home con datos válidos', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      token: 'fake-token',
      user: { id: 3, nombre: 'Nuevo', email: 'nuevo@example.com', telefono: '5491122334455' },
    })
    const user = userEvent.setup()
    renderRegister()

    await fillForm(user, {
      nombre: 'Nuevo',
      email: 'nuevo@example.com',
      telefono: '5491122334455',
      password: '1234',
      confirmPassword: '1234',
    })
    await user.click(screen.getByRole('button', { name: /registrarme/i }))

    expect(await screen.findByText('Home')).toBeInTheDocument()
    expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
      nombre: 'Nuevo',
      email: 'nuevo@example.com',
      telefono: '5491122334455',
      password: '1234',
    })
  })
})
