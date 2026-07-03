import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'

const formatPrice = (value) =>
  value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

function Cart({ isOpen, onClose }) {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    totalPrice,
  } = useCart()
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Tu carrito</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {cartItems.length === 0 ? (
            <p className="text-center text-slate-500">Tu carrito está vacío.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex gap-3 border-b border-slate-100 pb-4">
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-sm font-medium text-slate-800">
                      {item.nombre}
                    </span>
                    <span className="text-sm text-slate-500">
                      {formatPrice(item.precio)}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id)}
                        className="h-6 w-6 rounded bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id)}
                        disabled={item.cantidad >= item.stock}
                        className="h-6 w-6 rounded bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-xs font-medium text-red-500 hover:text-red-600"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-slate-200 px-4 py-4">
            <div className="mb-3 flex items-center justify-between text-base font-semibold text-slate-800">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="mb-2 w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Finalizar compra
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="w-full rounded-md border border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

export default Cart
