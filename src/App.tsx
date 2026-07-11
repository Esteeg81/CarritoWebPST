import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import ProductCarousel from './components/ProductCarousel'
import ProductList from './components/ProductList'
import ProductDetail from './components/ProductDetail'
import Cart from './components/Cart'
import Login from './components/Login'
import Register from './components/Register'
import Checkout from './components/Checkout'
import MyOrders from './components/MyOrders'
import Profile from './components/Profile'
import AdminLayout from './components/AdminLayout'
import AdminOrders from './components/AdminOrders'
import AdminPreparation from './components/AdminPreparation'
import AdminProducts from './components/AdminProducts'
import AdminCustomers from './components/AdminCustomers'
import AdminSettings from './components/AdminSettings'
import ProtectedRoute from './components/ProtectedRoute'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import { useTheme } from './hooks/useTheme'

function AppShell() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { settings } = useTheme()

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: settings.mainBg,
        color: settings.textColor,
        fontFamily: settings.fontFamily,
      }}
    >
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
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
            path="/mi-perfil"
            element={
              <ProtectedRoute>
                <Profile />
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
            <Route path="preparacion" element={<AdminPreparation />} />
            <Route path="productos" element={<AdminProducts />} />
            <Route path="clientes" element={<AdminCustomers />} />
            <Route path="configuracion" element={<AdminSettings />} />
          </Route>
        </Routes>
      </main>
      <Footer />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WhatsAppButton />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <ThemeProvider>
            <HashRouter>
              <AppShell />
            </HashRouter>
          </ThemeProvider>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
