import { describe, it, expect } from 'vitest'
import { DEFAULT_WHATSAPP_ORDER_TEMPLATE, renderWhatsappOrderTemplate } from './whatsappTemplate.js'

describe('renderWhatsappOrderTemplate', () => {
  it('reemplaza todos los placeholders con la plantilla por defecto', () => {
    const result = renderWhatsappOrderTemplate(DEFAULT_WHATSAPP_ORDER_TEMPLATE, {
      pedido: 7,
      cliente: 'Juan Pérez',
      telefono: '5491122334455',
      items: '- Mate x1: $4999',
      total: 4999,
    })

    expect(result).toBe(
      'Nuevo pedido #7\nCliente: Juan Pérez\nTeléfono: 5491122334455\n- Mate x1: $4999\nTotal: $4999',
    )
  })

  it('permite una plantilla personalizada', () => {
    const result = renderWhatsappOrderTemplate(
      'Hola {cliente}! Tu pedido #{pedido} por ${total} está confirmado.',
      {
        pedido: 3,
        cliente: 'Ana',
        telefono: '5491133445566',
        items: '- Taza x1: $200',
        total: 200,
      },
    )

    expect(result).toBe('Hola Ana! Tu pedido #3 por $200 está confirmado.')
  })

  it('reemplaza placeholders repetidos', () => {
    const result = renderWhatsappOrderTemplate('{cliente} - {cliente}', {
      pedido: 1,
      cliente: 'Repetido',
      telefono: '5491122334455',
      items: '',
      total: 0,
    })

    expect(result).toBe('Repetido - Repetido')
  })
})
