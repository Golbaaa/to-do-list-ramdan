'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// ✅ Struktur sesuai tabel Supabase
interface Todo {
  id: number
  title: string
  is_complete: boolean
  inserted_at: string
  deadline: string | null
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTask, setNewTask] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [loading, setLoading] = useState(true) // ➕ State untuk loading
  
  // ➕ State baru untuk fitur edit
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDeadline, setEditedDeadline] = useState('')

  // 🔹 Ambil semua data dari tabel "todos"
  const fetchTodos = async () => {
    setLoading(true) // ➕ Set loading true saat fetch dimulai
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('inserted_at', { ascending: false })

    if (error) console.error('Error fetching todos:', error)
    else setTodos(data || [])
    setLoading(false) // ➕ Set loading false saat fetch selesai
  }

  // 🔹 Tambah todo baru
  const addTodo = async () => {
    if (!newTask.trim()) return // cegah input kosong

    const { data, error } = await supabase // ➕ Tangkap data yang dikembalikan Supabase
      .from('todos')
      .insert([{ title: newTask, deadline: newDeadline || null, is_complete: false }])
      .select() // ➕ Penting: minta data yang baru di-insert

    if (error) {
      console.error('Error adding todo:', error)
    } else {
      setNewTask('')
      setNewDeadline('')
      // ➕ Optimasi: Langsung tambahkan ke state tanpa fetch ulang
      if (data && data.length > 0) {
        setTodos((prevTodos) => [data[0], ...prevTodos])
      }
    }
  }

  // 🔹 Toggle status selesai
  const toggleComplete = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_complete: !currentStatus })
      .eq('id', id)

    if (error) {
      console.error('Error updating todo:', error)
    } else {
      // ➕ Optimasi: Langsung update state tanpa fetch ulang
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, is_complete: !currentStatus } : todo
        )
      )
    }
  }

  // 🔹 Hapus todo
  const deleteTodo = async (id: number) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) {
      console.error('Error deleting todo:', error)
    } else {
      // ➕ Optimasi: Langsung hapus dari state tanpa fetch ulang
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id))
    }
  }

  // ➕ Fungsi untuk memulai mode edit
  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id)
    setEditedTitle(todo.title)
    setEditedDeadline(todo.deadline || '')
  }

  // ➕ Fungsi untuk membatalkan mode edit
  const cancelEditing = () => {
    setEditingTodoId(null)
    setEditedTitle('')
    setEditedDeadline('')
  }

  // ➕ Fungsi untuk menyimpan perubahan edit
  const saveEditedTodo = async (id: number) => {
    if (!editedTitle.trim()) return // cegah input kosong

    const { error } = await supabase
      .from('todos')
      .update({ title: editedTitle, deadline: editedDeadline || null })
      .eq('id', id)

    if (error) {
      console.error('Error updating todo:', error)
    } else {
      // ➕ Optimasi: Update state secara lokal
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id
            ? { ...todo, title: editedTitle, deadline: editedDeadline || null }
            : todo
        )
      )
      cancelEditing() // Keluar dari mode edit
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 border rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center">📝 To-Do List Ramdan</h1>

      {/* 🔹 Input Tambah Todo */}
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          className="border p-2 rounded-md"
          placeholder="Tulis tugas baru..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded-md"
          value={newDeadline}
          onChange={(e) => setNewDeadline(e.target.value)}
        />

        <button
          onClick={addTodo}
          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
        >
          Tambah
        </button>
      </div>

      {/* 🔹 Loading Indicator */}
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Memuat tugas...</p>
          {/* Anda bisa menambahkan spinner di sini */}
          {/* Contoh spinner sederhana (pastikan Tailwind CSS terkonfigurasi) */}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mt-2"></div>
        </div>
      ) : (
        /* 🔹 Daftar Todo */
        <ul>
          {todos.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Belum ada tugas. Tambahkan satu!</p>
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id}
                className={`flex justify-between items-center border-b py-2 gap-2 ${
                  todo.is_complete ? 'text-gray-400 line-through' : ''
                }`}
              >
                {editingTodoId === todo.id ? (
                  // ➕ Mode Edit
                  <div className="flex flex-1 flex-col gap-1">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="border p-1 rounded-md text-sm flex-1"
                    />
                    <input
                      type="date"
                      value={editedDeadline}
                      onChange={(e) => setEditedDeadline(e.target.value)}
                      className="border p-1 rounded-md text-sm flex-1"
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => saveEditedTodo(todo.id)}
                        className="bg-green-500 text-white text-xs px-2 py-1 rounded-md hover:bg-green-600 flex-1"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-400 text-white text-xs px-2 py-1 rounded-md hover:bg-gray-500 flex-1"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  // Mode Tampilan Normal
                  <>
                    {/* Kiri: Judul dan deadline */}
                    <div
                      onClick={() => toggleComplete(todo.id, todo.is_complete)}
                      className="cursor-pointer flex-1"
                    >
                      <span className="font-medium text-gray-800">{todo.title}</span>
                      {todo.deadline && (
                        <p className="text-sm text-gray-500">
                          Deadline: {new Date(todo.deadline).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>

                    {/* Kanan: Tombol Edit dan Hapus */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(todo)}
                        className="text-sm text-blue-500 hover:underline"
                        title="Edit Tugas"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-sm text-red-500 hover:underline"
                        title="Hapus Tugas"
                      >
                        Hapus
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}