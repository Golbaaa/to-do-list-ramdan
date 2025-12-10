import React from 'react'
import { Button } from '../ui/button'
import EditTaskModal from './EditTaskModal'

interface Todo {
  id: string
  title: string
  category?: string 
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'high' | 'medium' | 'low'
  is_complete: boolean
  inserted_at?: string
}

export default function MainContent({
  todos,
  onToggle,
  onDelete,
  onAdd,
  onUpdate,
  onOpenNewTaskModal,
}: {
  todos: Todo[]
  onToggle: (id: string, current: boolean) => void | Promise<void>
  onDelete: (id: string) => void | Promise<void>
  onAdd: (task: string | any) => void | Promise<void>
  onUpdate: (updated: Todo) => void | Promise<void>
  onOpenNewTaskModal?: () => void | Promise<void>
}) {
  const [search, setSearch] = React.useState('')
  const [editingTask, setEditingTask] = React.useState<Todo | null>(null)
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null)

  const openEditModal = (task: Todo) => {
    setEditingTask(task)
    setOpenMenuId(null)
  }

  const closeEditModal = () => setEditingTask(null)

  const handleSave = async (updated: Todo) => {
    const priorityToSave = updated.priority ? updated.priority.toUpperCase() : undefined
    const taskToSave: Todo = {
      ...updated,
      priority: priorityToSave as 'HIGH' | 'MEDIUM' | 'LOW' | undefined,
    }
    await onUpdate(taskToSave)
    setEditingTask(null)
  }

  const filtered = todos.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))

  const getPriorityColor = (priority?: string) => {
    const p = priority?.toUpperCase()
    if (p === 'HIGH') return { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' }
    if (p === 'MEDIUM') return { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100' }
    if (p === 'LOW') return { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' }
    return { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100' }
  }

  const getCategoryColor = (category?: string) => {
    if (category === 'Bug') return 'bg-red-100 text-red-700'
    if (category === 'Feature') return 'bg-purple-100 text-purple-700'
    if (category === 'Task') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
  }

  if (filtered.length === 0 && todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4">
            📝
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">No tasks yet</h3>
        <p className="text-gray-600 mt-2">Create your first task to get started</p>
        <button
          onClick={() => onOpenNewTaskModal && onOpenNewTaskModal()}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Create Task
        </button>
      </div>
    )
  }

  return (
    <main className="w-full">
      {/* Search & Filter Bar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Tasks Grid/List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks found matching "{search}"</p>
          </div>
        ) : (
          filtered.map((t) => {
            const priorityColor = getPriorityColor(t.priority)
            const categoryColor = getCategoryColor(t.category)
            const priority = (t.priority || 'MEDIUM').toUpperCase()

            return (
              <div
                key={t.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all p-4 group ${
                  t.is_complete ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={t.is_complete}
                      onChange={() => onToggle(t.id, t.is_complete)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Task Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-base font-medium ${
                              t.is_complete
                                ? 'line-through text-gray-500'
                                : 'text-gray-900'
                            }`}
                          >
                            {t.title}
                          </h3>
                          {t.category && (
                            <span
                              className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full ${categoryColor}`}
                            >
                              {t.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {t.inserted_at ? new Date(t.inserted_at).toLocaleDateString() : 'No date'}
                        </p>
                      </div>

                      {/* Status & Priority Badges */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${
                            t.is_complete
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {t.is_complete ? '✓ Done' : '○ Todo'}
                        </span>
                        <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${priorityColor.badge} ${priorityColor.text}`}>
                          {priority === 'HIGH' && '🔴'} {priority === 'MEDIUM' && '🟡'} {priority === 'LOW' && '🟢'} {priority.charAt(0) + priority.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="flex-shrink-0 relative opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setOpenMenuId(t.id === openMenuId ? null : t.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="6" cy="12" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="18" cy="12" r="1.5" />
                      </svg>
                    </button>

                    {openMenuId === t.id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                        <button
                          onClick={() => {
                            setOpenMenuId(null)
                            openEditModal(t)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null)
                            onToggle(t.id, t.is_complete)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t.is_complete ? 'Mark Todo' : 'Mark Done'}
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null)
                            onDelete(t.id)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Edit Modal */}
      <EditTaskModal isOpen={!!editingTask} onClose={closeEditModal} task={editingTask} onSave={handleSave} />
    </main>
  )
}
