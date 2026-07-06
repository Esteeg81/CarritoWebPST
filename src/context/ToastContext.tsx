import { createContext, useCallback, useRef, useState, type ReactNode } from 'react'

export type ToastType = 'success' | 'error'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

const AUTO_DISMISS_MS = 3500

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = ++nextId.current
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => removeToast(id), AUTO_DISMISS_MS)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex flex-col items-center gap-2 px-4 sm:left-auto sm:right-4 sm:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-md px-4 py-3 text-sm font-medium shadow-lg sm:w-auto ${
              toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
            }`}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              aria-label="Cerrar notificación"
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
