import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../lib/api'
import { useCart } from '../hooks/useCart'
import { useToast } from '../hooks/useToast'
import type { Product } from '../types'

const formatPrice = (value: number) =>
  value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setNotFound(false)
    api
      .get<Product>(`/api/products/${id}`)
      .then(setProduct)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
        }
      })
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return <p className="text-center text-slate-500">Cargando...</p>
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-md text-center text-slate-500">
        <p>No encontramos ese producto.</p>
        <Link to="/" className="mt-2 inline-block text-sm text-slate-700 underline">
          Volver a la tienda
        </Link>
      </div>
    )
  }

  const sinStock = product.stock === 0

  const handleAddToCart = () => {
    addToCart(product)
    showToast(`${product.nombre} agregado al carrito.`)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-700">
        ← Volver a la tienda
      </Link>

      <div className="grid grid-cols-1 gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <img
          src={product.imagen}
          alt={product.nombre}
          className="aspect-square w-full rounded-md object-cover"
        />
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {product.categoria}
          </span>
          <h2 className="text-2xl font-bold text-slate-800">{product.nombre}</h2>
          <p className="text-2xl font-bold text-slate-900">
            {formatPrice(product.precio)}
          </p>
          <p className="text-sm text-slate-500">
            {sinStock ? 'Sin stock' : `Stock disponible: ${product.stock}`}
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
    </div>
  )
}

export default ProductDetail
