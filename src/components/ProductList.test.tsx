import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ProductList from './ProductList'
import { CartProvider } from '../context/CartContext'
import { ToastProvider } from '../context/ToastContext'
import { api } from '../lib/api'
import type { Product } from '../types'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

function renderList() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <CartProvider>
          <ProductList />
        </CartProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: 1,
    nombre: 'Producto',
    precio: 1000,
    imagen: 'x.png',
    stock: 5,
    categoria: 'Tech',
    destacado: false,
    ...overrides,
  }
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
})

describe('ProductList', () => {
  it('muestra los productos devueltos por la API', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([makeProduct({ nombre: 'Auriculares' })])

    renderList()

    expect(await screen.findByText('Auriculares')).toBeInTheDocument()
  })

  it('muestra un mensaje de error si la API falla', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('network error'))

    renderList()

    expect(
      await screen.findByText(/no se pudieron cargar los productos/i),
    ).toBeInTheDocument()
  })

  it('filtra productos por categoría', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      makeProduct({ id: 1, nombre: 'Auriculares', categoria: 'Tech' }),
      makeProduct({ id: 2, nombre: 'Mochila', categoria: 'Accesorios' }),
    ])
    const user = userEvent.setup()
    renderList()

    await screen.findByText('Auriculares')
    await user.selectOptions(screen.getByDisplayValue('Todas las categorías'), 'Tech')

    expect(screen.getByText('Auriculares')).toBeInTheDocument()
    expect(screen.queryByText('Mochila')).not.toBeInTheDocument()
  })

  it('filtra productos por búsqueda de nombre', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      makeProduct({ id: 1, nombre: 'Auriculares', categoria: 'Tech' }),
      makeProduct({ id: 2, nombre: 'Mochila', categoria: 'Accesorios' }),
    ])
    const user = userEvent.setup()
    renderList()

    await screen.findByText('Auriculares')
    await user.type(screen.getByPlaceholderText('Buscar producto...'), 'moch')

    expect(screen.queryByText('Auriculares')).not.toBeInTheDocument()
    expect(screen.getByText('Mochila')).toBeInTheDocument()
  })

  it('muestra un mensaje si ningún producto coincide con los filtros', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([makeProduct({ nombre: 'Auriculares' })])
    const user = userEvent.setup()
    renderList()

    await screen.findByText('Auriculares')
    await user.type(screen.getByPlaceholderText('Buscar producto...'), 'inexistente')

    expect(
      await screen.findByText(/no se encontraron productos con esos filtros/i),
    ).toBeInTheDocument()
  })

  it('ordena productos por precio', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      makeProduct({ id: 1, nombre: 'Caro', precio: 2000 }),
      makeProduct({ id: 2, nombre: 'Barato', precio: 500 }),
    ])
    const user = userEvent.setup()
    renderList()

    await screen.findByText('Caro')
    await user.selectOptions(screen.getByDisplayValue('Nombre: A-Z'), 'precio-asc')

    const names = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent)
    expect(names).toEqual(['Barato', 'Caro'])
  })

  it('pagina cuando hay más de 10 productos', async () => {
    const products = Array.from({ length: 12 }, (_, i) =>
      makeProduct({ id: i + 1, nombre: `Producto ${String(i + 1).padStart(2, '0')}` }),
    )
    vi.mocked(api.get).mockResolvedValueOnce(products)
    const user = userEvent.setup()
    renderList()

    await screen.findByText('Producto 01')
    expect(screen.queryByText('Producto 11')).not.toBeInTheDocument()
    expect(screen.getByText(/página 1 de 2/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(await screen.findByText('Producto 11')).toBeInTheDocument()
    expect(screen.queryByText('Producto 01')).not.toBeInTheDocument()
    expect(screen.getByText(/página 2 de 2/i)).toBeInTheDocument()
  })
})
