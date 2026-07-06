import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import ProductCarousel from './components/ProductCarousel'
import ProductList from './components/ProductList'
import ProductDetail from './components/ProductDetail'
import Cart from './components/Cart'
import Login from './components/Login'
import Register from './components/Register'
import Checkout from './components/Checkout'
import MyOrders from './components/MyOrders'
import AdminLayout from './components/AdminLayout'
import AdminOrders from './components/AdminOrders'
import AdminProducts from './components/AdminProducts'
import AdminCustomers from './components/AdminCustomers'
import ProtectedRoute from './components/ProtectedRoute'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <HashRouter>
            <div className="min-h-screen bg-slate-50">
              <Header onCartClick={() => setIsCartOpen(true)} />
              <main className="mx-auto max-w-6xl px-4 py-8">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <>
                        <ProductCarousel />
                        <ProductList />
                      </>
                    }
                  />
                  <Route path="/producto/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Register />} />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mis-pedidos"
                    element={
                      <ProtectedRoute>
                        <MyOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="pedidos" replace />} />
                    <Route path="pedidos" element={<AdminOrders />} />
                    <Route path="productos" element={<AdminProducts />} />
                    <Route path="clientes" element={<AdminCustomers />} />
                  </Route>
                </Routes>
              </main>
              <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </div>
          </HashRouter>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
