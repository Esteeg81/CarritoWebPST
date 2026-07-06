import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProductDetail from './ProductDetail'
import { CartProvider } from '../context/CartContext'
import { ToastProvider } from '../context/ToastContext'
import { api, ApiError } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
  },
}))

function renderDetail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/producto/${id}`]}>
      <ToastProvider>
        <CartProvider>
          <Routes>
            <Route path="/producto/:id" element={<ProductDetail />} />
          </Routes>
        </CartProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
})

describe('ProductDetail', () => {
  it('muestra el producto cuando la API responde con éxito', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      id: 1,
      nombre: 'Auriculares',
      precio: 1000,
      imagen: 'x.png',
      stock: 5,
      categoria: 'Tech',
    })

    renderDetail('1')

    expect(await screen.findByText('Auriculares')).toBeInTheDocument()
  })

  it('muestra "no encontrado" cuando la API responde 404', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(
      new ApiError(404, 'Producto no encontrado.'),
    )

    renderDetail('999')

    expect(
      await screen.findByText(/no encontramos ese producto/i),
    ).toBeInTheDocument()
  })

  it('muestra una notificación al agregar al carrito', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      id: 1,
      nombre: 'Auriculares',
      precio: 1000,
      imagen: 'x.png',
      stock: 5,
      categoria: 'Tech',
    })
    const user = userEvent.setup()

    renderDetail('1')

    await user.click(await screen.findByRole('button', { name: /agregar al carrito/i }))

    expect(
      await screen.findByText('Auriculares agregado al carrito.'),
    ).toBeInTheDocument()
  })
})
