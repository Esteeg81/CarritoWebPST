import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { Product } from '../types'

const formatPrice = (value: number) =>
  value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

const AUTO_ADVANCE_MS = 5000

function ProductCarousel() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    api
      .get<Product[]>('/api/products')
      .then((products) => setFeatured(products.filter((p) => p.destacado)))
      .catch(() => setFeatured([]))
  }, [])

  useEffect(() => {
    if (featured.length < 2) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % featured.length)
    }, AUTO_ADVANCE_MS)

    return () => clearInterval(timer)
  }, [featured.length])

  if (featured.length === 0) {
    return null
  }

  const goTo = (index: number) => {
    setCurrent(((index % featured.length) + featured.length) % featured.length)
  }

  const product = featured[current]

  return (
    <div className="relative mb-8 overflow-hidden rounded-lg bg-slate-900 text-white shadow-sm">
      <Link
        to={`/producto/${product.id}`}
        className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:gap-8 sm:p-10"
      >
        <img
          src={product.imagen}
          alt={product.nombre}
          className="h-48 w-48 shrink-0 rounded-md object-cover sm:h-56 sm:w-56"
        />
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-300">Destacado</p>
          <h2 className="mt-1 text-2xl font-bold">{product.nombre}</h2>
          <p className="mt-2 text-lg text-slate-200">{formatPrice(product.precio)}</p>
        </div>
      </Link>

      {featured.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => goTo(current - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
          >
            &#8249;
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => goTo(current + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
          >
            &#8250;
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {featured.map((p, index) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Ir al producto destacado ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-2 w-2 rounded-full ${
                  index === current ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ProductCarousel
