import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { useAuth } from '../hooks/useAuth'
import { api, ApiError } from '../lib/api'
import type { User } from '../types'

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

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

const mockUser: User = {
  id: 1,
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  telefono: '5491122334455',
  role: 'CUSTOMER',
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
  vi.mocked(api.post).mockReset()
})

describe('AuthContext', () => {
  it('empieza sin sesión si no hay token guardado', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAuthenticated).toBe(false)
    expect(api.get).not.toHaveBeenCalled()
  })

  it('login exitoso guarda el token y el usuario', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ token: 'fake-token', user: mockUser })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let response
    await act(async () => {
      response = await result.current.login('juan@example.com', '1234')
    })

    expect(response).toEqual({ success: true })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(localStorage.getItem('carritoweb_token')).toBe('fake-token')
  })

  it('login falla con credenciales incorrectas', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiError(401, 'Email o contraseña incorrectos.'),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let response
    await act(async () => {
      response = await result.current.login('juan@example.com', 'mala')
    })

    expect(response).toEqual({
      success: false,
      message: 'Email o contraseña incorrectos.',
    })
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('register exitoso guarda la sesión', async () => {
    const newUser = {
      id: 2,
      nombre: 'Nuevo',
      email: 'nuevo@example.com',
      telefono: '5491122334455',
    }
    vi.mocked(api.post).mockResolvedValueOnce({ token: 'fake-token-2', user: newUser })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let response
    await act(async () => {
      response = await result.current.register(
        'Nuevo',
        'nuevo@example.com',
        '5491122334455',
        '1234',
      )
    })

    expect(response).toEqual({ success: true })
    expect(result.current.user).toEqual(newUser)
  })

  it('register rechaza un email duplicado', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiError(409, 'Ese email ya está registrado.'),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let response
    await act(async () => {
      response = await result.current.register(
        'Otro',
        'juan@example.com',
        '5491122334455',
        '1234',
      )
    })

    expect(response).toEqual({
      success: false,
      message: 'Ese email ya está registrado.',
    })
  })

  it('logout limpia la sesión y el token', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ token: 'fake-token', user: mockUser })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.login('juan@example.com', '1234')
    })
    act(() => result.current.logout())

    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem('carritoweb_token')).toBeNull()
  })

  it('restaura la sesión si hay un token guardado y /me responde con éxito', async () => {
    localStorage.setItem('carritoweb_token', 'existing-token')
    vi.mocked(api.get).mockResolvedValueOnce({ user: mockUser })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(api.get).toHaveBeenCalledWith('/api/auth/me', 'existing-token')
  })

  it('descarta el token si /me falla (expirado/inválido)', async () => {
    localStorage.setItem('carritoweb_token', 'expired-token')
    vi.mocked(api.get).mockRejectedValueOnce(
      new ApiError(401, 'Token inválido o expirado.'),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem('carritoweb_token')).toBeNull()
  })

  it('updateUser reemplaza los datos del usuario en el estado', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ token: 'fake-token', user: mockUser })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.login('juan@example.com', '1234')
    })

    const updated = { ...mockUser, nombre: 'Juan Actualizado', telefono: '5493425112970' }
    act(() => result.current.updateUser(updated))

    expect(result.current.user).toEqual(updated)
  })
})
