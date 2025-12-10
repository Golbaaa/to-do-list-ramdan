"use client"

import React, { createContext, useContext } from 'react'
import Toasts from './Toast'
import { useToast } from '@/lib/useToast'

type ToastContextType = {
  push: (title: string, type?: 'success' | 'error' | 'info', timeout?: number) => void
  clear: () => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, push, clear } = useToast()

  return (
    <ToastContext.Provider value={{ push, clear }}>
      {children}
      <Toasts toasts={toasts} />
    </ToastContext.Provider>
  )
}

export function useGlobalToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useGlobalToast must be used within ToastProvider')
  return ctx
}
