import { createContext, useEffect, useState, type ReactNode } from 'react'
import mockUsersData from '../data/users.json'
import type { StoredUser, User } from '../types'

const mockUsers = mockUsersData as StoredUser[]

interface RegisterResult {
  success: boolean
  message?: string
}

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => boolean
  register: (nombre: string, email: string, password: string) => RegisterResult
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_KEY = 'carritoweb_user'
const REGISTERED_USERS_KEY = 'carritoweb_registered_users'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  })

  const [registeredUsers, setRegisteredUsers] = useState<StoredUser[]>(() => {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY)
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers))
  }, [registeredUsers])

  const startSession = (fullUser: StoredUser) => {
    const { password: _password, ...safeUser } = fullUser
    setUser(safeUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
  }

  const login = (email: string, password: string) => {
    const allUsers = [...mockUsers, ...registeredUsers]
    const match = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    )
    if (!match) return false

    startSession(match)
    return true
  }

  const register = (
    nombre: string,
    email: string,
    password: string,
  ): RegisterResult => {
    const allUsers = [...mockUsers, ...registeredUsers]
    const emailTaken = allUsers.some(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    )
    if (emailTaken) {
      return { success: false, message: 'Ese email ya está registrado.' }
    }

    const newUser: StoredUser = { id: Date.now(), nombre, email, password }
    setRegisteredUsers((prev) => [...prev, newUser])
    startSession(newUser)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  const value: AuthContextValue = {
    user,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
