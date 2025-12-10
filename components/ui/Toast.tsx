import React from 'react'

type ToastMessage = { id: string; type: 'success' | 'error' | 'info'; title: string }

export default function Toasts({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`max-w-sm px-4 py-3 rounded-lg shadow-md text-sm text-white ${
            t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-sky-600'
          }`}
        >
          {t.title}
        </div>
      ))}
    </div>
  )
}
