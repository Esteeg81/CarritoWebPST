import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminOrders from './AdminOrders'
import { AuthProvider } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'
import { api, ApiError } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
  },
}))

function renderAdminOrders() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ToastProvider>
          <AdminOrders />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
  vi.mocked(api.patch).mockReset()
})

describe('AdminOrders', () => {
  it('muestra los pedidos con cliente, ítems y total', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        total: 2000,
        status: 'PENDIENTE',
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
        status: 'PENDIENTE',
        createdAt: '2026-01-01T00:00:00.000Z',
        user: { id: 2, nombre: 'Cliente Uno', email: 'uno@example.com' },
        items: [{ id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 2 }],
      },
      {
        id: 2,
        total: 500,
        status: 'PENDIENTE',
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
        status: 'PENDIENTE',
        createdAt: '2026-01-01T00:00:00.000Z',
        user: { id: 2, nombre: 'Cliente Uno', email: 'uno@example.com' },
        items: [{ id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 2 }],
      },
      {
        id: 2,
        total: 500,
        status: 'PENDIENTE',
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

  it('actualiza el estado de un pedido', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        total: 2000,
        status: 'PENDIENTE',
        createdAt: '2026-01-01T00:00:00.000Z',
        user: { id: 2, nombre: 'Cliente Test', email: 'cliente@example.com' },
        items: [{ id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 2 }],
      },
    ])
    vi.mocked(api.patch).mockResolvedValueOnce({
      id: 1,
      total: 2000,
      status: 'ENVIADO',
      createdAt: '2026-01-01T00:00:00.000Z',
      user: { id: 2, nombre: 'Cliente Test', email: 'cliente@example.com' },
      items: [{ id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 2 }],
    })
    const user = userEvent.setup()
    renderAdminOrders()

    await screen.findByText(/Pedido #1/)
    await user.selectOptions(screen.getByDisplayValue('Pendiente'), 'ENVIADO')

    expect(api.patch).toHaveBeenCalledWith(
      '/api/admin/orders/1/status',
      { status: 'ENVIADO' },
      null,
    )
    expect(await screen.findByDisplayValue('Enviado')).toBeInTheDocument()
    expect(
      await screen.findByText('Pedido #1 actualizado a "Enviado".'),
    ).toBeInTheDocument()
  })

  it('muestra un error si falla la actualización del estado', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        total: 2000,
        status: 'PENDIENTE',
        createdAt: '2026-01-01T00:00:00.000Z',
        user: { id: 2, nombre: 'Cliente Test', email: 'cliente@example.com' },
        items: [{ id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 2 }],
      },
    ])
    vi.mocked(api.patch).mockRejectedValueOnce(new ApiError(400, 'Estado inválido.'))
    const user = userEvent.setup()
    renderAdminOrders()

    await screen.findByText(/Pedido #1/)
    await user.selectOptions(screen.getByDisplayValue('Pendiente'), 'ENVIADO')

    expect(await screen.findByText('Estado inválido.')).toBeInTheDocument()
  })
})
