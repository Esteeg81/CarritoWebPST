import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import type { Order } from '../types'

const formatPrice = (value: number) =>
  value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

function MyOrders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<Order[]>('/api/orders/me', token)
      .then(setOrders)
      .catch(() => setError('No se pudieron cargar tus pedidos.'))
      .finally(() => setIsLoading(false))
  }, [token])

  if (isLoading) {
    return <p className="text-center text-slate-500">Cargando tus pedidos...</p>
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  if (orders.length === 0) {
    return <p className="text-center text-slate-500">Todavía no hiciste ningún pedido.</p>
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        Mis pedidos ({orders.length})
      </h2>
      <ul className="flex flex-col gap-4">
        {orders.map((order) => (
          <li
            key={order.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
              <span className="font-medium text-slate-800">Pedido #{order.id}</span>
              <span className="text-sm text-slate-400">
                {new Date(order.createdAt).toLocaleString('es-AR')}
              </span>
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

export default MyOrders
