import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Checkout from './Checkout'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
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

function renderCheckout() {
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/" element={<div>Home</div>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

const cartItem = {
  id: 1,
  nombre: 'Auriculares',
  precio: 1000,
  imagen: 'x.png',
  stock: 5,
  categoria: 'Tech',
  cantidad: 2,
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
  vi.mocked(api.post).mockReset()
  localStorage.setItem('carritoweb_token', 'valid-token')
  localStorage.setItem('carritoweb_cart', JSON.stringify([cartItem]))
  vi.mocked(api.get).mockResolvedValue({
    user: { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', role: 'CUSTOMER' },
  })
})

describe('Checkout', () => {
  it('confirma el pedido enviando productId y cantidad a la API', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ order: { id: 1 } })
    const user = userEvent.setup()
    renderCheckout()

    await user.click(await screen.findByRole('button', { name: /confirmar pedido/i }))

    expect(await screen.findByText(/pedido fue confirmado/i)).toBeInTheDocument()
    expect(api.post).toHaveBeenCalledWith(
      '/api/orders',
      { items: [{ productId: 1, cantidad: 2 }] },
      'valid-token',
    )
  })

  it('muestra un error si la API rechaza el pedido', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiError(400, 'Producto no encontrado.'),
    )
    const user = userEvent.setup()
    renderCheckout()

    await user.click(await screen.findByRole('button', { name: /confirmar pedido/i }))

    expect(await screen.findByText('Producto no encontrado.')).toBeInTheDocument()
  })
})
