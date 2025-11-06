import React from 'react'
import { Button } from '../ui/button'
import EditTaskModal from './EditTaskModal'

interface Todo {
  id: string
  title: string
  category?: string 
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' // ⚠️ PERBAIKAN: Ubah interface agar sesuai dengan casing database
  is_complete: boolean
  inserted_at?: string
}

export default function MainContent({
  todos,
  onToggle,
  onDelete,
  onAdd,
  onUpdate,
}: {
  todos: Todo[]
  onToggle: (id: string, current: boolean) => void | Promise<void>
  onDelete: (id: string) => void | Promise<void>
  onAdd: (task: string) => void | Promise<void>
  onUpdate: (updated: Todo) => void | Promise<void>
}) {
  const [showAdd, setShowAdd] = React.useState(false)
  const [newTask, setNewTask] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [view, setView] = React.useState<'list' | 'grid'>('list')
  const [editingTask, setEditingTask] = React.useState<Todo | null>(null)
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null)

  const handleAdd = async () => {
    if (!newTask.trim()) return
    await onAdd(newTask)
    setNewTask('')
    setShowAdd(false)
  }

  const openEditModal = (task: Todo) => {
    setEditingTask(task)
    setOpenMenuId(null)
  }

  const closeEditModal = () => setEditingTask(null)

  // ⚠️ PERUBAHAN UTAMA: Konversi data sebelum dikirim ke onUpdate
  const handleSave = async (updated: Todo) => {
    // Pastikan priority dikirim dalam casing yang benar (HIGH, MEDIUM, LOW)
    const priorityToSave = updated.priority ? updated.priority.toUpperCase() : undefined;
    
    // Buat objek baru dengan priority yang sudah dikonversi
    const taskToSave: Todo = {
      ...updated,
      priority: priorityToSave as 'HIGH' | 'MEDIUM' | 'LOW' | undefined,
    }

    await onUpdate(taskToSave)
    setEditingTask(null)
  }

  const filtered = todos.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <main className="w-full p-8">
      {/* ... Heading, Filter Bar, Inline Add Form (TIDAK BERUBAH) ... */}

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
        {/* Header row (Penyesuaian kolom di sini masih belum sempurna karena checkbox masih ada) */}
        <div className="hidden md:flex items-center px-4 py-3 border-b text-sm font-medium text-muted-foreground">
          {/* ⚠️ HILANGKAN W-8 DAN CEKBOX DI ROW */}
          <div className="w-8" /> 
          <div className="flex-1">Task</div>
          <div className="w-40">Status</div>
          <div className="w-32">Priority</div>
          <div className="w-12 text-right">Actions</div>
        </div>

        {/* Rows */}
        <div>
          {filtered.map((t) => {
            
            // --- LOGIKA PRIORITY DINAMIS (MENGGUNAKAN HIGH/MEDIUM/LOW) ---
            const priority = t.priority || 'MEDIUM'; 
            let priorityColorClass = 'text-gray-500'; 
            
            if (priority === 'HIGH') {
              priorityColorClass = 'text-red-500'; 
            } else if (priority === 'MEDIUM') {
              priorityColorClass = 'text-yellow-600'; // ⚠️ Ubah ke yellow-600/500
            } else if (priority === 'LOW') {
              priorityColorClass = 'text-green-500'; 
            }
            // -----------------------------------------------------------------

            return (
              <div
                key={t.id}
                className={`flex items-center px-4 py-4 border-b last:border-b-0 ${t.is_complete ? 'text-gray-400' : ''}`}
              >
                {/* ⚠️ HILANGKAN DIV CHECKBOX W-8 INI ⚠️ */}
                <div className="w-8 flex justify-center">
                  <input
                    type="checkbox"
                    checked={t.is_complete}
                    onChange={() => onToggle(t.id, t.is_complete)}
                    className="w-4 h-4"
                  />
                </div>

                {/* Task id + title + small tag */}
                {/* ⚠️ PERBAIKI LEBAR DAN PADDING setelah menghapus checkbox (pl-4 jika dihapus) */}
                <div className="flex-1 min-w-0 pl-4"> 
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">TASK-{String(t.id).slice(-4).toUpperCase()}</span>
                    <span className="text-sm font-medium truncate">{t.title}</span>
                    
                    {/* LOGIKA CATEGORY DINAMIS */}
                    {t.category && (
                      <span
                        className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          t.category === 'Bug' 
                            ? 'bg-red-50 text-red-700'
                            : t.category === 'Feature' 
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {t.category}
                      </span>
                    )}
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
                    <svg className="w-3 h-3" viewBox="0 0 8 8" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="4" cy="4" r="4" />
                    </svg>
                    <span>{t.is_complete ? 'Done' : 'In Progress'}</span>
                  </span>
                </div>

                {/* Priority */}
                <div className="w-32">
                  <div className="inline-flex items-center gap-2 text-sm">
                    {/* IKON PANAH MENGGUNAKAN WARNA DINAMIS */}
                    <svg className={`w-3 h-3 ${priorityColorClass}`} viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 0v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      <path d="M1.2 2.2L4 0l2.8 2.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {/* Teks ditampilkan dalam format huruf kapital/judul */}
                    <span className="font-medium">{priority.charAt(0) + priority.slice(1).toLowerCase()}</span> 
                  </div>
                </div>

                {/* Actions (kebab) */}
                <div className="w-12 text-right relative">
                  <button
                    aria-label="more"
                    className="px-2 py-1 rounded hover:bg-slate-100"
                    onClick={() => setOpenMenuId(t.id === openMenuId ? null : t.id)}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                    </svg>
                  </button>

                  {openMenuId === t.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                      <button
                        onClick={() => { setOpenMenuId(null); openEditModal(t) }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => { setOpenMenuId(null); onDelete(t.id) }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => { setOpenMenuId(null); onToggle(t.id, t.is_complete) }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        {t.is_complete ? 'Mark In Progress' : 'Mark Complete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* Edit modal */}
      <EditTaskModal isOpen={!!editingTask} onClose={closeEditModal} task={editingTask} onSave={handleSave} />
    </main>
  )
}