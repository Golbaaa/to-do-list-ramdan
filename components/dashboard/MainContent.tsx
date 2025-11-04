import React from 'react'
import { Button } from '../ui/button'

interface Todo {
  id: string
  title: string
  is_complete: boolean
  inserted_at?: string
}

export default function MainContent({
  todos,
  onToggle,
  onDelete,
  onAdd,
}: {
  todos: Todo[]
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string) => void
  onAdd: (task: string) => void
}) {
  const [showAdd, setShowAdd] = React.useState(false)
  const [newTask, setNewTask] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [view, setView] = React.useState<'list' | 'grid'>('list')

  const handleAdd = async () => {
    if (!newTask.trim()) return
    await onAdd(newTask)
    setNewTask('')
    setShowAdd(false)
  }

  const filtered = todos.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <main className="w-full p-8">
      {/* Heading + Avatar */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-sm text-muted-foreground">Here's a list of your tasks for this month.</p>
        </div>

        <div className="flex items-center gap-4">
          {/* avatar */}
          <div className="w-10 h-10 rounded-full bg-black" aria-hidden />
        </div>
      </div>

      {/* Filter & Actions bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter tasks..."
            className="flex-1 min-w-0 px-4 py-2 rounded-lg shadow-sm border"
          />

          <Button variant="outline" className="px-3">
            Status ▾
          </Button>

          <Button variant="outline" className="px-3">
            Priority ▾
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="px-2" onClick={() => setView(view === 'list' ? 'grid' : 'list')}>
            {view === 'list' ? 'Grid' : 'List'}
          </Button>
          <Button
            variant="default"
            className="bg-black text-white"
            onClick={() => setShowAdd((s) => !s)}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Inline add form */}
      {showAdd && (
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border shadow-sm"
              placeholder="Task title..."
            />
            <Button onClick={handleAdd} className="bg-black text-white">
              Add
            </Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Tasks table/card list */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header row (hidden on very small screens) */}
        <div className="hidden md:flex items-center px-4 py-3 border-b text-sm font-medium text-muted-foreground">
          <div className="w-8" />
          <div className="flex-1">Task</div>
          <div className="w-40">Status</div>
          <div className="w-32">Priority</div>
          <div className="w-12 text-right">Actions</div>
        </div>

        {/* Rows */}
        <div>
          {filtered.map((t) => (
            <div
              key={t.id}
              className={`flex items-center px-4 py-4 border-b last:border-b-0 ${
                t.is_complete ? 'text-gray-400' : ''
              }`}
            >
              {/* checkbox */}
              <div className="w-8 flex justify-center">
                <input
                  type="checkbox"
                  checked={t.is_complete}
                  onChange={() => onToggle(t.id, t.is_complete)}
                  className="w-4 h-4"
                />
              </div>

              {/* Task id + title + small tag */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">TASK-{String(t.id).slice(-4).toUpperCase()}</span>
                  <span className="text-sm font-medium truncate">{t.title}</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Documentation</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{t.inserted_at ?? ''}</div>
              </div>

              {/* Status */}
              <div className="w-40">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                    t.is_complete ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                  }`}
                >
                  {/* small dot icon */}
                  <svg className="w-3 h-3" viewBox="0 0 8 8" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="4" cy="4" r="4" />
                  </svg>
                  <span>{t.is_complete ? 'Done' : 'In Progress'}</span>
                </span>
              </div>

              {/* Priority */}
              <div className="w-32">
                <div className="inline-flex items-center gap-2 text-sm">
                  {/* simple arrow icon */}
                  <svg className="w-3 h-3 text-red-500" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 0v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M1.2 2.2L4 0l2.8 2.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-medium">Medium</span>
                </div>
              </div>

              {/* Actions (kebab) */}
              <div className="w-12 text-right relative">
                <button
                  aria-label="more"
                  className="px-2 py-1 rounded hover:bg-slate-100"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
