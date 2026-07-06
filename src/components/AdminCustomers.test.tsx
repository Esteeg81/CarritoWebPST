import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminCustomers from './AdminCustomers'
import { AuthProvider } from '../context/AuthContext'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

function renderAdminCustomers() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AdminCustomers />
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
})

describe('AdminCustomers', () => {
  it('muestra los clientes con pedidos y total gastado', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        nombre: 'Cliente Uno',
        email: 'cliente@example.com',
        telefono: '5491122334455',
        role: 'CUSTOMER',
        createdAt: '2026-01-01T00:00:00.000Z',
        totalPedidos: 2,
        totalGastado: 3000,
      },
    ])

    renderAdminCustomers()

    expect(await screen.findByText('Cliente Uno')).toBeInTheDocument()
    expect(screen.getByText('2 pedidos')).toBeInTheDocument()
    expect(screen.getByText('5491122334455')).toBeInTheDocument()
  })

  it('marca a los administradores con una etiqueta', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 2,
        nombre: 'Dueño',
        email: 'admin@example.com',
        telefono: '5491122334455',
        role: 'ADMIN',
        createdAt: '2026-01-01T00:00:00.000Z',
        totalPedidos: 0,
        totalGastado: 0,
      },
    ])

    renderAdminCustomers()

    expect(await screen.findByText('Admin')).toBeInTheDocument()
  })

  it('muestra un mensaje si todavía no hay clientes', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([])

    renderAdminCustomers()

    expect(
      await screen.findByText(/todavía no hay clientes registrados/i),
    ).toBeInTheDocument()
  })

  it('muestra un error si la API falla', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('network error'))

    renderAdminCustomers()

    expect(
      await screen.findByText(/no se pudieron cargar los clientes/i),
    ).toBeInTheDocument()
  })

  it('filtra clientes por nombre, email o teléfono', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        nombre: 'Cliente Uno',
        email: 'uno@example.com',
        telefono: '5491122334455',
        role: 'CUSTOMER',
        createdAt: '2026-01-01T00:00:00.000Z',
        totalPedidos: 2,
        totalGastado: 3000,
      },
      {
        id: 2,
        nombre: 'Cliente Dos',
        email: 'dos@example.com',
        telefono: '5493425112970',
        role: 'CUSTOMER',
        createdAt: '2026-01-01T00:00:00.000Z',
        totalPedidos: 0,
        totalGastado: 0,
      },
    ])
    const user = userEvent.setup()
    renderAdminCustomers()

    await screen.findByText('Cliente Uno')
    await user.type(
      screen.getByPlaceholderText('Buscar por nombre, email o teléfono...'),
      'dos@example',
    )

    expect(screen.queryByText('Cliente Uno')).not.toBeInTheDocument()
    expect(screen.getByText('Cliente Dos')).toBeInTheDocument()
  })

  it('filtra clientes por teléfono', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        nombre: 'Cliente Uno',
        email: 'uno@example.com',
        telefono: '5491122334455',
        role: 'CUSTOMER',
        createdAt: '2026-01-01T00:00:00.000Z',
        totalPedidos: 2,
        totalGastado: 3000,
      },
      {
        id: 2,
        nombre: 'Cliente Dos',
        email: 'dos@example.com',
        telefono: '5493425112970',
        role: 'CUSTOMER',
        createdAt: '2026-01-01T00:00:00.000Z',
        totalPedidos: 0,
        totalGastado: 0,
      },
    ])
    const user = userEvent.setup()
    renderAdminCustomers()

    await screen.findByText('Cliente Uno')
    await user.type(
      screen.getByPlaceholderText('Buscar por nombre, email o teléfono...'),
      '3425112970',
    )

    expect(screen.queryByText('Cliente Uno')).not.toBeInTheDocument()
    expect(screen.getByText('Cliente Dos')).toBeInTheDocument()
  })

  it('muestra un mensaje si ningún cliente coincide con la búsqueda', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([
      {
        id: 1,
        nombre: 'Cliente Uno',
        email: 'uno@example.com',
        telefono: '5491122334455',
        role: 'CUSTOMER',
        createdAt: '2026-01-01T00:00:00.000Z',
        totalPedidos: 2,
        totalGastado: 3000,
      },
    ])
    const user = userEvent.setup()
    renderAdminCustomers()

    await screen.findByText('Cliente Uno')
    await user.type(
      screen.getByPlaceholderText('Buscar por nombre, email o teléfono...'),
      'inexistente',
    )

    expect(
      await screen.findByText(/no se encontraron clientes con esa búsqueda/i),
    ).toBeInTheDocument()
  })
})
