import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

interface HeaderProps {
  onCartClick: () => void
}

function Header({ onCartClick }: HeaderProps) {
  const { totalItems } = useCart()
  const { user, logout } = useAuth()
  const { settings } = useTheme()

  return (
    <header
      className="text-white shadow-md"
      style={{ backgroundColor: settings.headerBg }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="text-xl font-bold tracking-tight">
          🛒 Carrito Web
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {user ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="hidden sm:inline">Hola, {user.nombre}</span>
              <Link
                to="/mi-perfil"
                className="rounded-full bg-slate-700 px-3 py-1.5 font-medium transition-colors hover:bg-slate-600"
              >
                Mis datos
              </Link>
              <Link
                to="/mis-pedidos"
                className="rounded-full bg-slate-700 px-3 py-1.5 font-medium transition-colors hover:bg-slate-600"
              >
                Mis pedidos
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="rounded-full bg-slate-700 px-3 py-1.5 font-medium transition-colors hover:bg-slate-600"
                >
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-slate-700 px-3 py-1.5 font-medium transition-colors hover:bg-slate-600"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-slate-700 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-slate-600"
            >
              Iniciar sesión
            </Link>
          )}

          <button
            type="button"
            onClick={onCartClick}
            className="relative rounded-full bg-slate-700 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-600"
          >
            Carrito
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold">
              {totalItems}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
