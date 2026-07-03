import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import ProductList from './components/ProductList'
import Cart from './components/Cart'
import Login from './components/Login'
import Checkout from './components/Checkout'
import ProtectedRoute from './components/ProtectedRoute'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <AuthProvider>
      <CartProvider>
        <HashRouter>
          <div className="min-h-screen bg-slate-50">
            <Header onCartClick={() => setIsCartOpen(true)} />
            <main className="mx-auto max-w-6xl px-4 py-8">
              <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>
        </HashRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
