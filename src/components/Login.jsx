import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname ?? '/'

  const handleSubmit = (event) => {
    event.preventDefault()
    const success = login(email, password)
    if (success) {
      navigate(from, { replace: true })
    } else {
      setError('Email o contraseña incorrectos.')
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-600">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-600">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          className="rounded-md bg-slate-900 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Ingresar
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        ¿No tenés cuenta?{' '}
        <Link to="/registro" className="font-medium text-slate-700 underline">
          Registrate
        </Link>
      </p>
      <p className="mt-2 text-xs text-slate-400">
        Mock: juan@example.com / 1234 · ana@example.com / abcd
      </p>
    </div>
  )
}

export default Login
