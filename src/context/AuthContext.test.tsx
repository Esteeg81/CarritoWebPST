import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { useAuth } from '../hooks/useAuth'

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext', () => {
  it('login exitoso con credenciales mock válidas', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let success = false
    act(() => {
      success = result.current.login('juan@example.com', '1234')
    })

    expect(success).toBe(true)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.nombre).toBe('Juan Pérez')
  })

  it('login falla con credenciales incorrectas', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let success = true
    act(() => {
      success = result.current.login('juan@example.com', 'incorrecta')
    })

    expect(success).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('login es case-insensitive en el email', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let success = false
    act(() => {
      success = result.current.login('JUAN@EXAMPLE.COM', '1234')
    })

    expect(success).toBe(true)
  })

  it('logout limpia la sesión', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.login('juan@example.com', '1234'))
    act(() => result.current.logout())

    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem('carritoweb_user')).toBeNull()
  })

  it('register crea una cuenta nueva y loguea automáticamente', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let response: { success: boolean; message?: string } = { success: false }
    act(() => {
      response = result.current.register('Nuevo User', 'nuevo@example.com', 'abcd1234')
    })

    expect(response.success).toBe(true)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('nuevo@example.com')
  })

  it('register rechaza un email ya usado por un usuario mock', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    let response: { success: boolean; message?: string } = { success: true }
    act(() => {
      response = result.current.register('Otro', 'ana@example.com', 'xxxx')
    })

    expect(response.success).toBe(false)
    expect(response.message).toMatch(/ya está registrado/i)
  })

  it('register rechaza un email ya usado por otro usuario registrado', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.register('Primero', 'dup@example.com', 'aaaa'))
    act(() => result.current.logout())

    let response: { success: boolean; message?: string } = { success: true }
    act(() => {
      response = result.current.register('Segundo', 'dup@example.com', 'bbbb')
    })

    expect(response.success).toBe(false)
  })

  it('la sesión persiste entre instancias vía localStorage', () => {
    const { result: result1 } = renderHook(() => useAuth(), { wrapper })
    act(() => result1.current.login('ana@example.com', 'abcd'))

    const { result: result2 } = renderHook(() => useAuth(), { wrapper })
    expect(result2.current.isAuthenticated).toBe(true)
    expect(result2.current.user?.nombre).toBe('Ana Gómez')
  })
})
