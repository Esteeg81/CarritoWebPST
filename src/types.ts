export interface Product {
  id: number
  nombre: string
  precio: number
  imagen: string
  stock: number
  categoria: string
  destacado: boolean
}

export interface CartItem extends Product {
  cantidad: number
}

export type Role = 'CUSTOMER' | 'ADMIN'

export interface User {
  id: number
  nombre: string
  email: string
  telefono: string
  role: Role
}

export interface OrderItem {
  id: number
  productId: number
  nombre: string
  precio: number
  cantidad: number
}

export type OrderStatus = 'PENDIENTE' | 'CONFIRMADO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO'

export interface Order {
  id: number
  total: number
  status: OrderStatus
  createdAt: string
  items: OrderItem[]
}

export interface AdminOrder extends Order {
  user: {
    id: number
    nombre: string
    email: string
  }
}

export interface Customer {
  id: number
  nombre: string
  email: string
  telefono: string
  role: Role
  createdAt: string
  totalPedidos: number
  totalGastado: number
}

export interface SiteSettings {
  fontFamily: string
  textColor: string
  headerBg: string
  footerBg: string
  mainBg: string
}
