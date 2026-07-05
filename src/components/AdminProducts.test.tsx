import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminProducts from './AdminProducts'
import { AuthProvider } from '../context/AuthContext'
import { api, ApiError } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
  },
}))

function renderAdminProducts() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AdminProducts />
      </AuthProvider>
    </MemoryRouter>,
  )
}

const product = {
  id: 1,
  nombre: 'Auriculares',
  precio: 1000,
  imagen: 'x.png',
  stock: 5,
  categoria: 'Tech',
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
  vi.mocked(api.post).mockReset()
  vi.mocked(api.patch).mockReset()
  vi.mocked(api.delete).mockReset()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

describe('AdminProducts', () => {
  it('muestra la lista de productos', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([product])

    renderAdminProducts()

    expect(await screen.findByText('Auriculares')).toBeInTheDocument()
    expect(screen.getByText(/Stock: 5/)).toBeInTheDocument()
  })

  it('crea un producto nuevo', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([])
    vi.mocked(api.post).mockResolvedValueOnce({
      id: 2,
      nombre: 'Mate',
      precio: 4999,
      imagen: 'mate.png',
      stock: 10,
      categoria: 'Hogar',
    })
    const user = userEvent.setup()
    renderAdminProducts()

    await screen.findByText('Nuevo producto')
    await user.type(screen.getByPlaceholderText('Nombre'), 'Mate')
    await user.type(screen.getByPlaceholderText('Categoría'), 'Hogar')
    await user.type(screen.getByPlaceholderText('Precio'), '4999')
    await user.type(screen.getByPlaceholderText('Stock'), '10')
    await user.type(screen.getByPlaceholderText('URL de imagen'), 'mate.png')
    await user.click(screen.getByRole('button', { name: /agregar producto/i }))

    expect(await screen.findByText('Mate')).toBeInTheDocument()
    expect(api.post).toHaveBeenCalledWith(
      '/api/admin/products',
      { nombre: 'Mate', precio: 4999, imagen: 'mate.png', stock: 10, categoria: 'Hogar' },
      null,
    )
  })

  it('edita un producto existente', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([product])
    vi.mocked(api.patch).mockResolvedValueOnce({ ...product, stock: 20 })
    const user = userEvent.setup()
    renderAdminProducts()

    await user.click(await screen.findByRole('button', { name: /editar/i }))
    const stockInput = screen.getByDisplayValue('5')
    await user.clear(stockInput)
    await user.type(stockInput, '20')
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(await screen.findByText(/Stock: 20/)).toBeInTheDocument()
  })

  it('muestra un error si falla la edición', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([product])
    vi.mocked(api.patch).mockRejectedValueOnce(new ApiError(400, 'Precio inválido.'))
    const user = userEvent.setup()
    renderAdminProducts()

    await user.click(await screen.findByRole('button', { name: /editar/i }))
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(await screen.findByText('Precio inválido.')).toBeInTheDocument()
  })

  it('elimina un producto tras confirmar', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([product])
    vi.mocked(api.delete).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderAdminProducts()

    await user.click(await screen.findByRole('button', { name: /eliminar/i }))

    expect(api.delete).toHaveBeenCalledWith('/api/admin/products/1', null)
    expect(screen.queryByText('Auriculares')).not.toBeInTheDocument()
  })
})
