import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  adminOnly?: boolean
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <p className="text-center text-slate-500">Cargando...</p>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
