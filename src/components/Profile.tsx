import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { api, ApiError } from '../lib/api'
import type { User } from '../types'

const TELEFONO_PATTERN = /^\d{8,15}$/

function Profile() {
  const { user, token, updateUser } = useAuth()
  const { showToast } = useToast()
  const [nombre, setNombre] = useState(user?.nombre ?? '')
  const [telefono, setTelefono] = useState(user?.telefono ?? '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setNombre(user.nombre)
      setTelefono(user.telefono)
    }
  }, [user])

  if (!user) return null

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!TELEFONO_PATTERN.test(telefono)) {
      setError('El teléfono debe tener entre 8 y 15 dígitos, con código de país.')
      return
    }

    setIsSaving(true)
    try {
      const data = await api.patch<{ user: User }>(
        '/api/auth/me',
        { nombre, telefono },
        token,
      )
      updateUser(data.user)
      showToast('Tus datos se actualizaron correctamente.')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'No se pudieron guardar los cambios.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Mis datos</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="nombre" className="text-sm font-medium text-slate-600">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-600">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="telefono" className="text-sm font-medium text-slate-600">
            Teléfono
          </label>
          <input
            id="telefono"
            type="tel"
            required
            placeholder="Con código de país, ej: 5491122334455"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-slate-900 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}

export default Profile
