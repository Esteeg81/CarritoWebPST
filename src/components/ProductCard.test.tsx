import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from './ProductCard'
import { CartProvider } from '../context/CartContext'
import { useCart } from '../hooks/useCart'
import type { Product } from '../types'

function CartBadge() {
  const { totalItems } = useCart()
  return <span data-testid="total-items">{totalItems}</span>
}

function renderWithCart(product: Product) {
  return render(
    <MemoryRouter>
      <CartProvider>
        <ProductCard product={product} />
        <CartBadge />
      </CartProvider>
    </MemoryRouter>,
  )
}

const product: Product = {
  id: 1,
  nombre: 'Auriculares Bluetooth',
  precio: 1000,
  stock: 5,
  imagen: 'x.png',
  categoria: 'Tecnología',
  destacado: false,
}
const sinStock: Product = { ...product, id: 2, stock: 0 }

describe('ProductCard', () => {
  it('muestra nombre, precio y stock', () => {
    renderWithCart(product)

    expect(screen.getByText('Auriculares Bluetooth')).toBeInTheDocument()
    expect(screen.getByText(/Stock: 5/)).toBeInTheDocument()
  })

  it('agrega el producto al carrito al hacer click', async () => {
    const user = userEvent.setup()
    renderWithCart(product)

    await user.click(screen.getByRole('button', { name: /agregar al carrito/i }))

    expect(screen.getByTestId('total-items')).toHaveTextContent('1')
  })

  it('deshabilita el botón y muestra "No disponible" sin stock', () => {
    renderWithCart(sinStock)

    expect(screen.getByRole('button', { name: /no disponible/i })).toBeDisabled()
  })
})
