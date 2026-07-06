import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'
import { api, ApiError } from '../lib/api'
import type { SiteSettings } from '../types'

const FONT_OPTIONS = [
  { value: 'sans-serif', label: 'Sans-serif (por defecto)' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'cursive', label: 'Cursive' },
  { value: 'system-ui', label: 'System UI' },
]

function AdminSettings() {
  const { token } = useAuth()
  const { settings, refresh } = useTheme()
  const { showToast } = useToast()
  const [form, setForm] = useState<SiteSettings>(settings)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(settings)
  }, [settings])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      await api.patch<SiteSettings>('/api/admin/settings', form, token)
      refresh()
      showToast('Configuración del sitio actualizada.')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'No se pudo guardar la configuración.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        Configuración del sitio
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Tipo de fuente
          <select
            value={form.fontFamily}
            onChange={(e) => setForm({ ...form, fontFamily: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {FONT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Color de texto
          <input
            type="color"
            value={form.textColor}
            onChange={(e) => setForm({ ...form, textColor: e.target.value })}
            className="h-10 w-full rounded-md border border-slate-300"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Color de fondo del encabezado
          <input
            type="color"
            value={form.headerBg}
            onChange={(e) => setForm({ ...form, headerBg: e.target.value })}
            className="h-10 w-full rounded-md border border-slate-300"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Color de fondo del pie de página
          <input
            type="color"
            value={form.footerBg}
            onChange={(e) => setForm({ ...form, footerBg: e.target.value })}
            className="h-10 w-full rounded-md border border-slate-300"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Color de fondo principal
          <input
            type="color"
            value={form.mainBg}
            onChange={(e) => setForm({ ...form, mainBg: e.target.value })}
            className="h-10 w-full rounded-md border border-slate-300"
          />
        </label>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Mensaje de WhatsApp para pedidos nuevos
          <textarea
            value={form.whatsappOrderTemplate}
            onChange={(e) => setForm({ ...form, whatsappOrderTemplate: e.target.value })}
            rows={5}
            className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
          />
        </label>
        <p className="mt-1 text-xs text-slate-400">
          Variables disponibles: {'{pedido}'}, {'{cliente}'}, {'{telefono}'}, {'{items}'},{' '}
          {'{total}'}
        </p>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isSaving}
        className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSaving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

export default AdminSettings
