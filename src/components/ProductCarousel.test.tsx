import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ProductCarousel from './ProductCarousel'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn() },
}))

function renderCarousel() {
  return render(
    <MemoryRouter>
      <ProductCarousel />
    </MemoryRouter>,
  )
}

const destacado1 = {
  id: 1,
  nombre: 'Auriculares',
  precio: 1000,
  imagen: 'auriculares.png',
  stock: 5,
  categoria: 'Tech',
  destacado: true,
}

const destacado2 = {
  id: 2,
  nombre: 'Mochila',
  precio: 500,
  imagen: 'mochila.png',
  stock: 5,
  categoria: 'Accesorios',
  destacado: true,
}

const noDestacado = {
  id: 3,
  nombre: 'Taza',
  precio: 200,
  imagen: 'taza.png',
  stock: 5,
  categoria: 'Hogar',
  destacado: false,
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ProductCarousel', () => {
  it('no renderiza nada si no hay productos destacados', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([noDestacado])

    const { container } = renderCarousel()

    await vi.waitFor(() => {
      expect(api.get).toHaveBeenCalled()
    })
    expect(container).toBeEmptyDOMElement()
  })

  it('muestra el primer producto destacado', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([noDestacado, destacado1, destacado2])

    renderCarousel()

    expect(await screen.findByText('Auriculares')).toBeInTheDocument()
  })

  it('avanza al siguiente producto destacado al hacer click en la flecha', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([destacado1, destacado2])
    const user = userEvent.setup()

    renderCarousel()

    await screen.findByText('Auriculares')
    await user.click(screen.getByLabelText('Siguiente'))

    expect(await screen.findByText('Mochila')).toBeInTheDocument()
  })
})
