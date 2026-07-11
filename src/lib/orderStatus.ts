import type { OrderStatus } from '../types'

export const ORDER_STATUSES: OrderStatus[] = [
  'PENDIENTE',
  'EN_PREPARACION',
  'CONFIRMADO',
  'ENVIADO',
  'ENTREGADO',
  'CANCELADO',
]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  CONFIRMADO: 'Confirmado',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  EN_PREPARACION: 'bg-purple-100 text-purple-700',
  CONFIRMADO: 'bg-blue-100 text-blue-700',
  ENVIADO: 'bg-indigo-100 text-indigo-700',
  ENTREGADO: 'bg-emerald-100 text-emerald-700',
  CANCELADO: 'bg-red-100 text-red-700',
}
