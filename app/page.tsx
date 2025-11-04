'use client'

import React, { useEffect, useState } from 'react'
import MainContent from '@/components/dashboard/MainContent'
import { supabase } from '@/lib/supabaseClient'

// --- PERBAIKAN 1: INTERFACE ---
interface Todo {
  id: string
  // HARUS SESUAI DENGAN NAMA KOLOM DB: title
  title: string
  is_complete: boolean
  // HARUS SESUAI DENGAN NAMA KOLOM DB: inserted_at
  inserted_at: string 
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      // --- PERBAIKAN 2: ORDER BY inserted_at ---
      .order('inserted_at', { ascending: false }) 
    
    if (error) console.error('Error fetching todos:', error)
    else setTodos((data as Todo[]) || [])
  }

  const addTodo = async (task: string) => {
    // --- PERBAIKAN 3: INSERT KE KOLOM title ---
    const { data, error } = await supabase.from('todos').insert({ title: task }).select()
    
    if (error) console.error('Error adding todo:', error)
    else if (data && data.length > 0) setTodos((prev) => [data[0] as Todo, ...prev])
  }

  const toggleComplete = async (id: string, current: boolean) => {
    const { error } = await supabase.from('todos').update({ is_complete: !current }).eq('id', id)
    if (error) console.error('Error toggling todo:', error)
    else setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, is_complete: !current } : t)))
  }

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) console.error('Error deleting todo:', error)
    else setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainContent todos={todos} onToggle={toggleComplete} onDelete={deleteTodo} onAdd={addTodo} />
    </div>
  )
}