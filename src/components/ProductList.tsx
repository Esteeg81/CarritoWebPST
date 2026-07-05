import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import ProductCard from './ProductCard'
import type { Product } from '../types'

const ITEMS_PER_PAGE = 10

type SortOption = 'nombre-asc' | 'nombre-desc' | 'precio-asc' | 'precio-desc'

function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('nombre-asc')
  const [page, setPage] = useState(1)

  useEffect(() => {
    api
      .get<Product[]>('/api/products')
      .then(setProducts)
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, selectedCategory, sortOption])

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.categoria))).sort(),
    [products],
  )

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = !selectedCategory || product.categoria === selectedCategory
      const matchesSearch = !term || product.nombre.toLowerCase().includes(term)
      return matchesCategory && matchesSearch
    })
  }, [products, searchTerm, selectedCategory])

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts]
    sorted.sort((a, b) => {
      switch (sortOption) {
        case 'nombre-desc':
          return b.nombre.localeCompare(a.nombre)
        case 'precio-asc':
          return a.precio - b.precio
        case 'precio-desc':
          return b.precio - a.precio
        default:
          return a.nombre.localeCompare(b.nombre)
      }
    })
    return sorted
  }, [filteredProducts, sortOption])

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE))
  const paginatedProducts = sortedProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

  if (isLoading) {
    return <p className="text-center text-slate-500">Cargando productos...</p>
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:max-w-xs"
        />
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="nombre-asc">Nombre: A-Z</option>
            <option value="nombre-desc">Nombre: Z-A</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <p className="text-center text-slate-500">
          No se encontraron productos con esos filtros.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-500">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProductList
