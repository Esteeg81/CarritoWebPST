import { useCart } from '../hooks/useCart'

function Header({ onCartClick }) {
  const { totalItems } = useCart()

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <h1 className="text-xl font-bold tracking-tight">🛒 Carrito Web</h1>
        <button
          type="button"
          onClick={onCartClick}
          className="relative rounded-full bg-slate-700 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-600"
        >
          Carrito
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold">
            {totalItems}
          </span>
        </button>
      </div>
    </header>
  )
}

export default Header
