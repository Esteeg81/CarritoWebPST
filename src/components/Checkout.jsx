import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'

const formatPrice = (value) =>
  value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const [confirmado, setConfirmado] = useState(false)

  const handleConfirmar = () => {
    clearCart()
    setConfirmado(true)
  }

  if (confirmado) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-700">
          ¡Gracias, {user.nombre}! Tu pedido fue confirmado.
        </p>
        <p className="mt-1 text-sm text-emerald-600">
          (Simulado — todavía no hay backend ni pagos reales.)
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

      <button
        type="button"
        onClick={handleConfirmar}
        className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Confirmar pedido
      </button>
    </div>
  )
}

export default Checkout
