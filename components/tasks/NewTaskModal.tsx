import React, { useState, useEffect } from 'react'

interface NewTaskPayload {
  title: string
  category?: string
  priority?: string
  is_complete?: boolean
}

interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: NewTaskPayload) => void | Promise<void>
}

export default function NewTaskModal({ isOpen, onClose, onSave }: NewTaskModalProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Documentation')
  const [priority, setPriority] = useState('medium')

  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setCategory('Documentation')
      setPriority('medium')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">New Task</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            <label className="flex flex-col">
              <span className="text-sm font-medium">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Task title"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 px-3 py-2 border rounded-md">
                <option>Bug</option>
                <option>Feature</option>
                <option>Documentation</option>
                <option>Other</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">Priority</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 px-3 py-2 border rounded-md">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!title.trim()) return
              const payload: NewTaskPayload = { title: title.trim(), category, priority: priority?.toLowerCase(), is_complete: false }
              void onSave(payload)
            }}
            className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
            disabled={!title.trim()}
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  )
}
