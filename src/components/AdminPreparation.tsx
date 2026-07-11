import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { api, ApiError } from '../lib/api'
import type { AdminOrder } from '../types'

interface PrepareResponse {
  count: number
  orderIds: number[]
}

interface WhatsAppSummaryResponse {
  sent: boolean
  count: number
}

function AdminPreparation() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isPreparing, setIsPreparing] = useState(false)
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false)

  const loadOrders = () => {
    setIsLoading(true)
    api
      .get<AdminOrder[]>('/api/admin/orders', token)
      .then(setOrders)
      .catch(() => setError('No se pudieron cargar los pedidos.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(loadOrders, [token])

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === 'PENDIENTE'),
    [orders],
  )

  const summary = useMemo(() => {
    const cantidadPorProducto = new Map<string, number>()
    pendingOrders.forEach((order) => {
      order.items.forEach((item) => {
        cantidadPorProducto.set(
          item.nombre,
          (cantidadPorProducto.get(item.nombre) ?? 0) + item.cantidad,
        )
      })
    })
    return Array.from(cantidadPorProducto.entries())
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [pendingOrders])

  const handlePrepare = async () => {
    setIsPreparing(true)
    try {
      const result = await api.post<PrepareResponse>(
        '/api/admin/orders/prepare',
        undefined,
        token,
      )
      showToast(
        `${result.count} ${result.count === 1 ? 'pedido pasó' : 'pedidos pasaron'} a "En preparación".`,
      )
      loadOrders()
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : 'No se pudo actualizar el estado de los pedidos.',
        'error',
      )
    } finally {
      setIsPreparing(false)
    }
  }

  const handleSendWhatsApp = async () => {
    setIsSendingWhatsApp(true)
    try {
      const result = await api.post<WhatsAppSummaryResponse>(
        '/api/admin/orders/pending-summary/whatsapp',
        undefined,
        token,
      )
      showToast(
        result.sent
          ? 'Resumen enviado a tu WhatsApp.'
          : 'No se pudo enviar: revisá la configuración de WhatsApp del admin.',
        result.sent ? 'success' : 'error',
      )
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'No se pudo enviar el resumen por WhatsApp.',
        'error',
      )
    } finally {
      setIsSendingWhatsApp(false)
    }
  }

  if (isLoading) {
    return <p className="text-center text-slate-500">Cargando pedidos pendientes...</p>
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  if (pendingOrders.length === 0) {
    return (
      <p className="text-center text-slate-500">No hay pedidos pendientes por preparar.</p>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        Resumen de preparación ({pendingOrders.length}{' '}
        {pendingOrders.length === 1 ? 'pedido' : 'pedidos'})
      </h2>

      <ul className="mb-4 flex flex-col gap-2">
        {summary.map((item) => (
          <li
            key={item.nombre}
            className="flex justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm"
          >
            <span className="text-slate-700">{item.nombre}</span>
            <span className="font-semibold text-slate-900">{item.cantidad} u.</span>
          </li>
        ))}
      </ul>

      <p className="mb-4 text-xs text-slate-400">
        Pedidos incluidos: {pendingOrders.map((order) => `#${order.id}`).join(', ')}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handlePrepare}
          disabled={isPreparing}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPreparing ? 'Actualizando...' : 'Marcar pedidos como en preparación'}
        </button>
        <button
          type="button"
          onClick={handleSendWhatsApp}
          disabled={isSendingWhatsApp}
          className="rounded-md border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
        >
          {isSendingWhatsApp ? 'Enviando...' : 'Enviar resumen por WhatsApp'}
        </button>
      </div>
    </div>
  )
}

export default AdminPreparation
