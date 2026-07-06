import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ThemeProvider, DEFAULT_SETTINGS } from './ThemeContext'
import { useTheme } from '../hooks/useTheme'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn() },
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
)

beforeEach(() => {
  vi.mocked(api.get).mockReset()
})

describe('ThemeContext', () => {
  it('usa la configuración por defecto mientras carga o si la API devuelve null', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(null)
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.settings).toEqual(DEFAULT_SETTINGS)
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/settings'))
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS)
  })

  it('aplica la configuración que devuelve la API', async () => {
    const custom = {
      fontFamily: 'serif',
      textColor: '#111111',
      headerBg: '#222222',
      footerBg: '#333333',
      mainBg: '#444444',
    }
    vi.mocked(api.get).mockResolvedValueOnce(custom)
    const { result } = renderHook(() => useTheme(), { wrapper })

    await waitFor(() => expect(result.current.settings).toEqual(custom))
  })

  it('mantiene la configuración por defecto si la API falla', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('network error'))
    const { result } = renderHook(() => useTheme(), { wrapper })

    await waitFor(() => expect(api.get).toHaveBeenCalled())
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS)
  })
})
