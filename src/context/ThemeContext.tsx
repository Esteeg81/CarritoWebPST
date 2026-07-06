import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import type { SiteSettings } from '../types'

export const DEFAULT_SETTINGS: SiteSettings = {
  fontFamily: 'sans-serif',
  textColor: '#1e293b',
  headerBg: '#0f172a',
  footerBg: '#ffffff',
  mainBg: '#f8fafc',
  whatsappOrderTemplate:
    'Nuevo pedido #{pedido}\nCliente: {cliente}\nTeléfono: {telefono}\n{items}\nTotal: ${total}',
}

interface ThemeContextValue {
  settings: SiteSettings
  refresh: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)

  const refresh = useCallback(() => {
    api
      .get<SiteSettings | null>('/api/settings')
      .then((data) => {
        if (data) setSettings(data)
      })
      .catch(() => {})
  }, [])

  useEffect(refresh, [refresh])

  return (
    <ThemeContext.Provider value={{ settings, refresh }}>{children}</ThemeContext.Provider>
  )
}
