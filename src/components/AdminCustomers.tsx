import { useEffect, useMemo, useState } from 'react'
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
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    api
      .get<Customer[]>('/api/admin/customers', token)
      .then(setCustomers)
      .catch(() => setError('No se pudieron cargar los clientes.'))
      .finally(() => setIsLoading(false))
  }, [token])

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return customers
    return customers.filter(
      (customer) =>
        customer.nombre.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.telefono.includes(term),
    )
  }, [customers, searchTerm])

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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          Clientes ({filteredCustomers.length})
        </h2>
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:max-w-xs"
        />
      </div>

      {filteredCustomers.length === 0 && (
        <p className="text-center text-slate-500">
          No se encontraron clientes con esa búsqueda.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {filteredCustomers.map((customer) => (
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
                {customer.telefono && (
                  <p className="text-sm text-slate-500">{customer.telefono}</p>
                )}
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
