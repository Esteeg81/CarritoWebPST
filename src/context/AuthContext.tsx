import { createContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError } from '../lib/api'
import type { User } from '../types'

interface AuthResult {
  success: boolean
  message?: string
}

interface AuthResponse {
  token: string
  user: User
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  register: (nombre: string, email: string, password: string) => Promise<AuthResult>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'carritoweb_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setIsLoading(false)
      return
    }

    api
      .get<{ user: User }>('/api/auth/me', token)
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const data = await api.post<AuthResponse>('/api/auth/login', { email, password })
      localStorage.setItem(TOKEN_KEY, data.token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo iniciar sesión.'
      return { success: false, message }
    }
  }

  const register = async (
    nombre: string,
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const data = await api.post<AuthResponse>('/api/auth/register', {
        nombre,
        email,
        password,
      })
      localStorage.setItem(TOKEN_KEY, data.token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo completar el registro.'
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
