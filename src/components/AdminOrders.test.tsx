import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminOrders from './AdminOrders'
import { AuthProvider } from '../context/AuthContext'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

function renderAdminOrders() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AdminOrders />
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
})

describe('AdminOrders', () => {
  it('muestra los pedidos con cliente, ítems y total', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        total: 2000,
        createdAt: '2026-01-01T00:00:00.000Z',
        user: { id: 2, nombre: 'Cliente Test', email: 'cliente@example.com' },
        items: [{ id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 2 }],
      },
    ])

    renderAdminOrders()

    expect(await screen.findByText(/Cliente Test/)).toBeInTheDocument()
    expect(screen.getByText(/Auriculares × 2/)).toBeInTheDocument()
  })

  it('muestra un mensaje si todavía no hay pedidos', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([])

    renderAdminOrders()

    expect(await screen.findByText(/todavía no hay pedidos/i)).toBeInTheDocument()
  })

  it('muestra un error si la API falla', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('network error'))

    renderAdminOrders()

    expect(
      await screen.findByText(/no se pudieron cargar los pedidos/i),
    ).toBeInTheDocument()
  })
})
