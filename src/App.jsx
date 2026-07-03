import { useState } from 'react'
import Header from './components/Header'
import ProductList from './components/ProductList'
import Cart from './components/Cart'
import { CartProvider } from './context/CartContext'

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-50">
        <Header onCartClick={() => setIsCartOpen(true)} />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <ProductList />
        </main>
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </CartProvider>
  )
}

export default App
