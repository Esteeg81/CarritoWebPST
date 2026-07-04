import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import ProductCard from './ProductCard'
import type { Product } from '../types'

function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<Product[]>('/api/products')
      .then(setProducts)
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <p className="text-center text-slate-500">Cargando productos...</p>
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductList
