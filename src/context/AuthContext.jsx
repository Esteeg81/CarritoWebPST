import { createContext, useState } from 'react'
import users from '../data/users.json'

export const AuthContext = createContext(null)

const STORAGE_KEY = 'carritoweb_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  })

  const login = (email, password) => {
    const match = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    )
    if (!match) return false

    const { password: _password, ...safeUser } = match
    setUser(safeUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = { user, login, logout, isAuthenticated: Boolean(user) }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
