export interface Product {
  id: number
  nombre: string
  precio: number
  imagen: string
  stock: number
  categoria: string
}

export interface CartItem extends Product {
  cantidad: number
}

export interface User {
  id: number
  nombre: string
  email: string
}

export interface StoredUser extends User {
  password: string
}
