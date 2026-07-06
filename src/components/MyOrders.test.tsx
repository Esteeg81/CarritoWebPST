import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MyOrders from './MyOrders'
import { AuthProvider } from '../context/AuthContext'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

function renderMyOrders() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <MyOrders />
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
})

describe('MyOrders', () => {
  it('muestra los pedidos del cliente con ítems y total', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 4,
        total: 2000,
        status: 'ENVIADO',
        createdAt: '2026-01-01T00:00:00.000Z',
        items: [{ id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 2 }],
      },
    ])

    renderMyOrders()

    expect(await screen.findByText('Pedido #4')).toBeInTheDocument()
    expect(screen.getByText(/Auriculares × 2/)).toBeInTheDocument()
    expect(screen.getByText('Enviado')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/api/orders/me', null)
  })

  it('muestra un mensaje si todavía no hizo pedidos', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([])

    renderMyOrders()

    expect(
      await screen.findByText(/todavía no hiciste ningún pedido/i),
    ).toBeInTheDocument()
  })

  it('muestra un error si la API falla', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('network error'))

    renderMyOrders()

    expect(
      await screen.findByText(/no se pudieron cargar tus pedidos/i),
    ).toBeInTheDocument()
  })
})
