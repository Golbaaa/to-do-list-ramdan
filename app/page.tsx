'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// ✅ Sesuai tabel kamu
interface Todo {
  id: number
  title: string
  is_complete: boolean
  inserted_at: string
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTask, setNewTask] = useState('')

  // 🔹 Ambil semua data dari tabel "todos"
  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('inserted_at', { ascending: false })

    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      setTodos(data || [])
    }
  }

  // 🔹 Tambah todo baru (insert)
  const addTodo = async () => {
    if (!newTask.trim()) return // cegah input kosong

    const { error } = await supabase
      .from('todos')
      .insert([{ title: newTask, is_complete: false }]) // ✅ pakai title, bukan task

    if (error) {
      console.error('Error adding todo:', error)
    } else {
      setNewTask('')
      fetchTodos()
    }
  }

  // 🔹 Toggle status selesai / belum
  const toggleComplete = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_complete: !currentStatus })
      .eq('id', id)

    if (error) {
      console.error('Error updating todo:', error)
    } else {
      fetchTodos()
    }
  }

  // 🔹 Hapus todo berdasarkan id
  const deleteTodo = async (id: number) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
    } else {
      fetchTodos()
    }
  }

  // 🔹 Jalankan fetchTodos saat pertama kali render
  useEffect(() => {
    fetchTodos()
  }, [])

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 border rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center">📝 To-Do List Ramdan</h1>

      {/* Input tambah todo */}
      <div className="flex mb-4">
        <input
          type="text"
          className="flex-1 border p-2 rounded-l-md"
          placeholder="Tulis tugas baru..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          onClick={addTodo}
          className="bg-red-500 text-white px-4 rounded-r-md hover:bg-red-600"
        >
          Tambah
        </button>
      </div>

      {/* Daftar todo */}
      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`flex justify-between items-center border-b py-2 ${
              todo.is_complete ? 'text-gray-400 line-through' : ''
            }`}
          >
            <span
              onClick={() => toggleComplete(todo.id, todo.is_complete)}
              className="cursor-pointer"
            >
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-sm text-red-500 hover:underline"
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
