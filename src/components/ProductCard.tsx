import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useToast } from '../hooks/useToast'
import type { Product } from '../types'

const formatPrice = (value: number) =>
  value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const sinStock = product.stock === 0

  const handleAddToCart = () => {
    addToCart(product)
    showToast(`${product.nombre} agregado al carrito.`)
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <Link to={`/producto/${product.id}`}>
        <img
          src={product.imagen}
          alt={product.nombre}
          className="aspect-square w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {product.categoria}
        </span>
        <Link to={`/producto/${product.id}`} className="hover:underline">
          <h3 className="font-semibold text-slate-800">{product.nombre}</h3>
        </Link>
        <p className="text-lg font-bold text-slate-900">
          {formatPrice(product.precio)}
        </p>
        <p className="text-sm text-slate-500">
          {sinStock ? 'Sin stock' : `Stock: ${product.stock}`}
        </p>
        <button
          type="button"
          disabled={sinStock}
          onClick={handleAddToCart}
          className="mt-auto rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {sinStock ? 'No disponible' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}

export default ProductCard
