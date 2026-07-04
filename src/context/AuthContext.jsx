import { createContext, useEffect, useState } from 'react'
import mockUsers from '../data/users.json'

export const AuthContext = createContext(null)

const SESSION_KEY = 'carritoweb_user'
const REGISTERED_USERS_KEY = 'carritoweb_registered_users'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  })

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY)
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers))
  }, [registeredUsers])

  const startSession = (fullUser) => {
    const { password: _password, ...safeUser } = fullUser
    setUser(safeUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
  }

  const login = (email, password) => {
    const allUsers = [...mockUsers, ...registeredUsers]
    const match = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    )
    if (!match) return false

    startSession(match)
    return true
  }

  const register = (nombre, email, password) => {
    const allUsers = [...mockUsers, ...registeredUsers]
    const emailTaken = allUsers.some(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    )
    if (emailTaken) {
      return { success: false, message: 'Ese email ya está registrado.' }
    }

    const newUser = { id: Date.now(), nombre, email, password }
    setRegisteredUsers((prev) => [...prev, newUser])
    startSession(newUser)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  const value = { user, login, register, logout, isAuthenticated: Boolean(user) }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
