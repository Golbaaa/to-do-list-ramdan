"use client"

import { useCallback, useState } from 'react'

type Toast = { id: string; type: 'success' | 'error' | 'info'; title: string }

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((title: string, type: Toast['type'] = 'info', timeout = 4000) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 9)
    const t: Toast = { id, type, title }
    setToasts((s) => [t, ...s])
    if (timeout > 0) setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), timeout)
  }, [])

  const clear = useCallback(() => setToasts([]), [])

  return { toasts, push, clear }
}
