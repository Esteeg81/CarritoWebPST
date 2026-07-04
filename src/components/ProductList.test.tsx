import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductList from './ProductList'
import { CartProvider } from '../context/CartContext'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

function renderList() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <ProductList />
      </CartProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
})

describe('ProductList', () => {
  it('muestra los productos devueltos por la API', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        nombre: 'Auriculares',
        precio: 1000,
        imagen: 'x.png',
        stock: 5,
        categoria: 'Tech',
      },
    ])

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
})
