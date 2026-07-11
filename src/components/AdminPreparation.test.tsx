import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminPreparation from './AdminPreparation'
import { AuthProvider } from '../context/AuthContext'
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

function renderAdminPreparation() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ToastProvider>
          <AdminPreparation />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
  vi.mocked(api.post).mockReset()
})

describe('AdminPreparation', () => {
  it('muestra un mensaje si no hay pedidos pendientes', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        total: 1000,
        status: 'CONFIRMADO',
        createdAt: '2026-01-01T00:00:00.000Z',
        user: { id: 2, nombre: 'Cliente Uno', email: 'uno@example.com' },
        items: [{ id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 1 }],
      },
    ])

    renderAdminPreparation()

    expect(
      await screen.findByText(/no hay pedidos pendientes por preparar/i),
    ).toBeInTheDocument()
  })

  it('agrupa la cantidad de artículos de todos los pedidos pendientes', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        total: 3000,
        status: 'PENDIENTE',
        createdAt: '2026-01-01T00:00:00.000Z',
        user: { id: 2, nombre: 'Cliente Uno', email: 'uno@example.com' },
        items: [
          { id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 2 },
          { id: 2, productId: 2, nombre: 'Mochila', precio: 500, cantidad: 1 },
        ],
      },
      {
        id: 2,
        total: 1000,
        status: 'PENDIENTE',
        createdAt: '2026-01-02T00:00:00.000Z',
        user: { id: 3, nombre: 'Cliente Dos', email: 'dos@example.com' },
        items: [{ id: 3, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 1 }],
      },
      {
        id: 3,
        total: 500,
        status: 'CONFIRMADO',
        createdAt: '2026-01-03T00:00:00.000Z',
        user: { id: 4, nombre: 'Cliente Tres', email: 'tres@example.com' },
        items: [{ id: 4, productId: 2, nombre: 'Mochila', precio: 500, cantidad: 5 }],
      },
    ])

    renderAdminPreparation()

    expect(await screen.findByText('Resumen de preparación (2 pedidos)')).toBeInTheDocument()
    expect(screen.getByText('Auriculares')).toBeInTheDocument()
    expect(screen.getByText('3 u.')).toBeInTheDocument()
    expect(screen.getByText('Mochila')).toBeInTheDocument()
    expect(screen.getByText('1 u.')).toBeInTheDocument()
    expect(screen.getByText(/Pedidos incluidos: #1, #2/)).toBeInTheDocument()
  })

  it('marca los pedidos pendientes como "en preparación" y refresca la lista', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce([
        {
          id: 1,
          total: 1000,
          status: 'PENDIENTE',
          createdAt: '2026-01-01T00:00:00.000Z',
          user: { id: 2, nombre: 'Cliente Uno', email: 'uno@example.com' },
          items: [{ id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 1 }],
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 1,
          total: 1000,
          status: 'EN_PREPARACION',
          createdAt: '2026-01-01T00:00:00.000Z',
          user: { id: 2, nombre: 'Cliente Uno', email: 'uno@example.com' },
          items: [{ id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 1 }],
        },
      ])
    vi.mocked(api.post).mockResolvedValueOnce({ count: 1, orderIds: [1] })
    const user = userEvent.setup()
    renderAdminPreparation()

    await screen.findByText('Resumen de preparación (1 pedido)')
    await user.click(
      screen.getByRole('button', { name: /marcar pedidos como en preparación/i }),
    )

    expect(api.post).toHaveBeenCalledWith('/api/admin/orders/prepare', undefined, null)
    expect(
      await screen.findByText('1 pedido pasó a "En preparación".'),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/no hay pedidos pendientes por preparar/i),
    ).toBeInTheDocument()
  })

  it('muestra un error si falla la actualización', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        total: 1000,
        status: 'PENDIENTE',
        createdAt: '2026-01-01T00:00:00.000Z',
        user: { id: 2, nombre: 'Cliente Uno', email: 'uno@example.com' },
        items: [{ id: 1, productId: 1, nombre: 'Auriculares', precio: 1000, cantidad: 1 }],
      },
    ])
    vi.mocked(api.post).mockRejectedValueOnce(new ApiError(500, 'Error del servidor.'))
    const user = userEvent.setup()
    renderAdminPreparation()

    await screen.findByText('Resumen de preparación (1 pedido)')
    await user.click(
      screen.getByRole('button', { name: /marcar pedidos como en preparación/i }),
    )

    expect(await screen.findByText('Error del servidor.')).toBeInTheDocument()
  })

  it('muestra un error si falla la carga de pedidos', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('network error'))

    renderAdminPreparation()

    expect(
      await screen.findByText(/no se pudieron cargar los pedidos/i),
    ).toBeInTheDocument()
  })
})
