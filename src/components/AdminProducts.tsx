import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { api, ApiError } from '../lib/api'
import type { Product } from '../types'

const formatPrice = (value: number) =>
  value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

interface ProductFormValues {
  nombre: string
  precio: string
  imagen: string
  stock: string
  categoria: string
  destacado: boolean
}

const emptyForm: ProductFormValues = {
  nombre: '',
  precio: '',
  imagen: '',
  stock: '',
  categoria: '',
  destacado: false,
}

function toPayload(values: ProductFormValues) {
  return {
    nombre: values.nombre,
    precio: Number(values.precio),
    imagen: values.imagen,
    stock: Number(values.stock),
    categoria: values.categoria,
    destacado: values.destacado,
  }
}

function toFormValues(product: Product): ProductFormValues {
  return {
    nombre: product.nombre,
    precio: String(product.precio),
    imagen: product.imagen,
    stock: String(product.stock),
    categoria: product.categoria,
    destacado: product.destacado,
  }
}

function AdminProducts() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [newProduct, setNewProduct] = useState<ProductFormValues>(emptyForm)
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<ProductFormValues>(emptyForm)
  const [editError, setEditError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

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

  const loadProducts = () => {
    setIsLoading(true)
    api
      .get<Product[]>('/api/products')
      .then((loaded) => {
        setProducts(loaded)
        const sinStock = loaded.filter((p) => p.stock === 0)
        if (sinStock.length > 0) {
          showToast(
            `Sin stock: ${sinStock.map((p) => p.nombre).join(', ')}.`,
            'error',
          )
        }
      })
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(loadProducts, [showToast])

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreateError('')
    setIsCreating(true)
    try {
      const product = await api.post<Product>(
        '/api/admin/products',
        toPayload(newProduct),
        token,
      )
      setProducts((prev) => [...prev, product])
      setNewProduct(emptyForm)
      showToast(`${product.nombre} creado correctamente.`)
    } catch (err) {
      setCreateError(
        err instanceof ApiError ? err.message : 'No se pudo crear el producto.',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const startEditing = (product: Product) => {
    setEditingId(product.id)
    setEditForm(toFormValues(product))
    setEditError('')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditError('')
  }

  const handleSave = async (id: number) => {
    setEditError('')
    setIsSaving(true)
    try {
      const updated = await api.patch<Product>(
        `/api/admin/products/${id}`,
        toPayload(editForm),
        token,
      )
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
      setEditingId(null)
      showToast(`${updated.nombre} actualizado correctamente.`)
      if (updated.stock === 0) {
        showToast(`${updated.nombre} se quedó sin stock.`, 'error')
      }
    } catch (err) {
      setEditError(
        err instanceof ApiError ? err.message : 'No se pudo guardar el producto.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que querés eliminar este producto?')) return

    const product = products.find((p) => p.id === id)
    try {
      await api.delete(`/api/admin/products/${id}`, token)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      showToast(`${product?.nombre ?? 'Producto'} eliminado.`)
    } catch {
      showToast('No se pudo eliminar el producto.', 'error')
    }
  }

  if (isLoading) {
    return <p className="text-center text-slate-500">Cargando productos...</p>
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  return (
    <div>
      <form
        onSubmit={handleCreate}
        className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Nuevo producto</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            required
            placeholder="Nombre"
            value={newProduct.nombre}
            onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Categoría"
            value={newProduct.categoria}
            onChange={(e) =>
              setNewProduct({ ...newProduct, categoria: e.target.value })
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            type="number"
            min="0"
            step="0.01"
            placeholder="Precio"
            value={newProduct.precio}
            onChange={(e) => setNewProduct({ ...newProduct, precio: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            type="number"
            min="0"
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="URL de imagen"
            value={newProduct.imagen}
            onChange={(e) => setNewProduct({ ...newProduct, imagen: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
            <input
              type="checkbox"
              checked={newProduct.destacado}
              onChange={(e) =>
                setNewProduct({ ...newProduct, destacado: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            Destacado (aparece en el carrusel de la home)
          </label>
        </div>
        {createError && <p className="mt-2 text-sm text-red-500">{createError}</p>}
        <button
          type="submit"
          disabled={isCreating}
          className="mt-3 w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto sm:px-4"
        >
          {isCreating ? 'Creando...' : 'Agregar producto'}
        </button>
      </form>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          Productos ({filteredProducts.length})
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:max-w-xs"
          />
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
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-slate-500">
          No se encontraron productos con esos filtros.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {filteredProducts.map((product) => (
          <li
            key={product.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            {editingId === product.id ? (
              <div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    value={editForm.nombre}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nombre: e.target.value })
                    }
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    value={editForm.categoria}
                    onChange={(e) =>
                      setEditForm({ ...editForm, categoria: e.target.value })
                    }
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.precio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, precio: e.target.value })
                    }
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    value={editForm.imagen}
                    onChange={(e) =>
                      setEditForm({ ...editForm, imagen: e.target.value })
                    }
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={editForm.destacado}
                      onChange={(e) =>
                        setEditForm({ ...editForm, destacado: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Destacado (aparece en el carrusel de la home)
                  </label>
                </div>
                {editError && <p className="mt-2 text-sm text-red-500">{editError}</p>}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSave(product.id)}
                    disabled={isSaving}
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-800">
                    {product.nombre}
                    {product.destacado && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Destacado
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Sin stock
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">
                    {product.categoria} · {formatPrice(product.precio)} · Stock:{' '}
                    {product.stock}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(product)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AdminProducts
