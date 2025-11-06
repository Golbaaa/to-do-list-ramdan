import React, { useEffect, useState } from 'react'

type Todo = {
  id: string
  title: string
  category?: string
  // priority stored as string; DB expects lowercase enum values ('low'|'medium'|'high')
  priority?: string
  is_complete: boolean
}

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: Todo | null
  // allow parent handler to be async (returns Promise) and accept flexible task shape
  onSave: (updatedTask: any) => void | Promise<void>
}

export default function EditTaskModal({ isOpen, onClose, task, onSave }: EditTaskModalProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Documentation')
  const [priority, setPriority] = useState<string>('medium')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title ?? '')
      setCategory(task.category ?? 'Documentation')
  setPriority((task.priority ?? 'medium').toString().toLowerCase())
      setIsComplete(!!task.is_complete)
    }
  }, [task, isOpen])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSave = () => {
    if (!task) return
    // Normalize priority to lowercase to match PostgreSQL enum expectations
    // e.g. 'Medium' -> 'medium'
    const normalizedPriority = priority ? String(priority).toLowerCase() : undefined

    const updated: Todo = {
      ...task,
      title: title.trim(),
      category,
      // cast to any because DB enum may expect lowercase values
      priority: normalizedPriority as any,
      is_complete: Boolean(isComplete),
    }
    onSave(updated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Edit Task</h3>
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

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium">Status</span>
                <select
                  value={isComplete ? 'true' : 'false'}
                  onChange={(e) => setIsComplete(e.target.value === 'true')}
                  className="mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="false">In Progress</option>
                  <option value="true">Done</option>
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 px-3 py-2 border rounded-md"
                >
                  <option>Bug</option>
                  <option>Feature</option>
                  <option>Documentation</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            <label className="flex flex-col">
              <span className="text-sm font-medium">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 px-3 py-2 border rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
