import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { api, ApiError } from '../lib/api'

const formatPrice = (value: number) =>
  value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart()
  const { user, token } = useAuth()
  const [confirmado, setConfirmado] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!user) return null

  const handleConfirmar = async () => {
    setError('')
    setIsSubmitting(true)
    try {
      await api.post(
        '/api/orders',
        {
          items: cartItems.map((item) => ({
            productId: item.id,
            cantidad: item.cantidad,
          })),
        },
        token,
      )
      clearCart()
      setConfirmado(true)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'No se pudo confirmar el pedido.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (confirmado) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-700">
          ¡Gracias, {user.nombre}! Tu pedido fue confirmado.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Volver a la tienda
        </Link>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-md text-center text-slate-500">
        <p>Tu carrito está vacío.</p>
        <Link to="/" className="mt-2 inline-block text-sm text-slate-700 underline">
          Ir a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Confirmar pedido</h2>
      <p className="mb-4 text-sm text-slate-500">Comprando como {user.nombre}</p>

      <ul className="mb-4 flex flex-col gap-2">
        {cartItems.map((item) => (
          <li key={item.id} className="flex justify-between text-sm text-slate-700">
            <span>
              {item.nombre} × {item.cantidad}
            </span>
            <span>{formatPrice(item.precio * item.cantidad)}</span>
          </li>
        ))}
      </ul>

      <div className="mb-4 flex justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-800">
        <span>Total</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleConfirmar}
        disabled={isSubmitting}
        className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? 'Confirmando...' : 'Confirmar pedido'}
      </button>
    </div>
  )
}

export default Checkout
