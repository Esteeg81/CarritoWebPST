import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

    expect(await screen.findByText(/Pedido #1 — Cliente Test/)).toBeInTheDocument()
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

  it('filtra pedidos por cliente', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        total: 2000,
        createdAt: '2026-01-01T00:00:00.000Z',
        user: { id: 2, nombre: 'Cliente Uno', email: 'uno@example.com' },
        items: [{ id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 2 }],
      },
      {
        id: 2,
        total: 500,
        createdAt: '2026-01-02T00:00:00.000Z',
        user: { id: 3, nombre: 'Cliente Dos', email: 'dos@example.com' },
        items: [{ id: 2, productId: 2, nombre: 'Mochila', precio: 500, cantidad: 1 }],
      },
    ])
    const user = userEvent.setup()
    renderAdminOrders()

    await screen.findByText(/Pedido #1/)
    await user.selectOptions(screen.getByDisplayValue('Todos los clientes'), '3')

    expect(screen.queryByText(/Pedido #1/)).not.toBeInTheDocument()
    expect(screen.getByText(/Pedido #2/)).toBeInTheDocument()
  })

  it('vuelve a mostrar todos los pedidos al elegir "Todos los clientes"', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        total: 2000,
        createdAt: '2026-01-01T00:00:00.000Z',
        user: { id: 2, nombre: 'Cliente Uno', email: 'uno@example.com' },
        items: [{ id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 2 }],
      },
      {
        id: 2,
        total: 500,
        createdAt: '2026-01-02T00:00:00.000Z',
        user: { id: 3, nombre: 'Cliente Dos', email: 'dos@example.com' },
        items: [{ id: 2, productId: 2, nombre: 'Mochila', precio: 500, cantidad: 1 }],
      },
    ])
    const user = userEvent.setup()
    renderAdminOrders()

    const select = await screen.findByDisplayValue('Todos los clientes')
    await user.selectOptions(select, '3')
    expect(screen.queryByText(/Pedido #1/)).not.toBeInTheDocument()

    await user.selectOptions(select, '')
    expect(screen.getByText(/Pedido #1/)).toBeInTheDocument()
    expect(screen.getByText(/Pedido #2/)).toBeInTheDocument()
  })
})
