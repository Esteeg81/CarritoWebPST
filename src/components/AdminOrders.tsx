import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { api, ApiError } from '../lib/api'
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '../lib/orderStatus'
import type { AdminOrder, OrderStatus } from '../types'

const formatPrice = (value: number) =>
  value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

function AdminOrders() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    api
      .get<AdminOrder[]>('/api/admin/orders', token)
      .then(setOrders)
      .catch(() => setError('No se pudieron cargar los pedidos.'))
      .finally(() => setIsLoading(false))
  }, [token])

  const customers = useMemo(() => {
    const map = new Map<number, { id: number; nombre: string; email: string }>()
    orders.forEach((order) => map.set(order.user.id, order.user))
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [orders])

  const filteredOrders = useMemo(() => {
    if (!selectedCustomerId) return orders
    return orders.filter((order) => order.user.id === Number(selectedCustomerId))
  }, [orders, selectedCustomerId])

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    setUpdatingId(id)
    try {
      const updated = await api.patch<AdminOrder>(
        `/api/admin/orders/${id}/status`,
        { status },
        token,
      )
      setOrders((prev) => prev.map((order) => (order.id === id ? updated : order)))
      showToast(`Pedido #${id} actualizado a "${ORDER_STATUS_LABELS[status]}".`)
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'No se pudo actualizar el estado.',
        'error',
      )
    } finally {
      setUpdatingId(null)
    }
  }

  if (isLoading) {
    return <p className="text-center text-slate-500">Cargando pedidos...</p>
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  if (orders.length === 0) {
    return <p className="text-center text-slate-500">Todavía no hay pedidos.</p>
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          Pedidos ({filteredOrders.length})
        </h2>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todos los clientes</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.nombre} ({customer.email})
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 && (
        <p className="text-center text-slate-500">
          No se encontraron pedidos para ese cliente.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {filteredOrders.map((order) => (
          <li
            key={order.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <span className="font-medium text-slate-800">
                Pedido #{order.id} — {order.user.nombre} ({order.user.email})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">
                  {new Date(order.createdAt).toLocaleString('es-AR')}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_STYLES[order.status]}`}
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
                <select
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={(e) =>
                    handleStatusChange(order.id, e.target.value as OrderStatus)
                  }
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ul className="mb-2 flex flex-col gap-1">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between text-sm text-slate-600"
                >
                  <span>
                    {item.nombre} × {item.cantidad}
                  </span>
                  <span>{formatPrice(item.precio * item.cantidad)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-semibold text-slate-800">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AdminOrders
