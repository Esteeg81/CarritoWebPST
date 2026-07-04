import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CartProvider } from './CartContext'
import { useCart } from '../hooks/useCart'
import type { Product } from '../types'

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
)

const product: Product = {
  id: 1,
  nombre: 'Auriculares Bluetooth',
  precio: 100,
  stock: 2,
  imagen: 'x.png',
  categoria: 'Tecnología',
}
const productBajoStock: Product = { ...product, id: 2, nombre: 'Mate', stock: 1 }

describe('CartContext', () => {
  it('agrega un producto nuevo con cantidad 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addToCart(product))

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].cantidad).toBe(1)
    expect(result.current.totalItems).toBe(1)
    expect(result.current.totalPrice).toBe(100)
  })

  it('incrementa la cantidad si el producto ya está en el carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addToCart(product))
    act(() => result.current.addToCart(product))

    expect(result.current.cartItems[0].cantidad).toBe(2)
    expect(result.current.totalItems).toBe(2)
    expect(result.current.totalPrice).toBe(200)
  })

  it('no permite superar el stock disponible al agregar', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addToCart(productBajoStock))
    act(() => result.current.addToCart(productBajoStock))

    expect(result.current.cartItems[0].cantidad).toBe(1)
  })

  it('increaseQuantity respeta el stock', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addToCart(productBajoStock))
    act(() => result.current.increaseQuantity(productBajoStock.id))

    expect(result.current.cartItems[0].cantidad).toBe(1)
  })

  it('decreaseQuantity elimina el item al llegar a 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addToCart(product))
    act(() => result.current.decreaseQuantity(product.id))

    expect(result.current.cartItems).toHaveLength(0)
  })

  it('removeFromCart elimina el item sin importar la cantidad', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addToCart(product))
    act(() => result.current.addToCart(product))
    act(() => result.current.removeFromCart(product.id))

    expect(result.current.cartItems).toHaveLength(0)
  })

  it('clearCart vacía todo el carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addToCart(product))
    act(() => result.current.addToCart(productBajoStock))
    act(() => result.current.clearCart())

    expect(result.current.cartItems).toHaveLength(0)
    expect(result.current.totalPrice).toBe(0)
  })

  it('persiste el carrito en localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addToCart(product))

    const stored = JSON.parse(localStorage.getItem('carritoweb_cart') ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].id).toBe(product.id)
  })
})
