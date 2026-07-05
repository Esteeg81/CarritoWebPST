import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import type { Customer } from '../types'

const formatPrice = (value: number) =>
  value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

function AdminCustomers() {
  const { token } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<Customer[]>('/api/admin/customers', token)
      .then(setCustomers)
      .catch(() => setError('No se pudieron cargar los clientes.'))
      .finally(() => setIsLoading(false))
  }, [token])

  if (isLoading) {
    return <p className="text-center text-slate-500">Cargando clientes...</p>
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  if (customers.length === 0) {
    return <p className="text-center text-slate-500">Todavía no hay clientes registrados.</p>
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        Clientes ({customers.length})
      </h2>
      <ul className="flex flex-col gap-3">
        {customers.map((customer) => (
          <li
            key={customer.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 font-medium text-slate-800">
                  {customer.nombre}
                  {customer.role === 'ADMIN' && (
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
                      Admin
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-500">{customer.email}</p>
                <p className="text-xs text-slate-400">
                  Desde {new Date(customer.createdAt).toLocaleDateString('es-AR')}
                </p>
              </div>
              <div className="shrink-0 text-right text-sm">
                <p className="text-slate-600">
                  {customer.totalPedidos}{' '}
                  {customer.totalPedidos === 1 ? 'pedido' : 'pedidos'}
                </p>
                <p className="font-semibold text-slate-800">
                  {formatPrice(customer.totalGastado)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AdminCustomers
