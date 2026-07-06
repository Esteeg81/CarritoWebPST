export const DEFAULT_WHATSAPP_ORDER_TEMPLATE =
  'Nuevo pedido #{pedido}\nCliente: {cliente}\nTeléfono: {telefono}\n{items}\nTotal: ${total}'

interface OrderTemplateData {
  pedido: number
  cliente: string
  telefono: string
  items: string
  total: number
}

export function renderWhatsappOrderTemplate(template: string, data: OrderTemplateData) {
  return template
    .replaceAll('{pedido}', String(data.pedido))
    .replaceAll('{cliente}', data.cliente)
    .replaceAll('{telefono}', data.telefono)
    .replaceAll('{items}', data.items)
    .replaceAll('{total}', String(data.total))
}
