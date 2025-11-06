'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import MainContent from '@/components/dashboard/MainContent'
import NewTaskModal from '@/components/tasks/NewTaskModal'
import { supabase } from '@/lib/supabaseClient'

// --- PERBAIKAN 1: INTERFACE ---
interface Todo {
  id: string
  // HARUS SESUAI DENGAN NAMA KOLOM DB: title
  title: string
  category?: string
  priority?: string
  is_complete: boolean
  // HARUS SESUAI DENGAN NAMA KOLOM DB: inserted_at
  inserted_at?: string 
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)

  const handleOpenNewTaskModal = () => setIsNewTaskModalOpen(true)
  const handleCloseNewTaskModal = () => setIsNewTaskModalOpen(false)

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      // --- PERBAIKAN 2: ORDER BY inserted_at ---
      .order('inserted_at', { ascending: false }) 
    
    if (error) console.error('Error fetching todos:', error)
    else setTodos((data as Todo[]) || [])
  }

  /**
   * addTodo accepts either a string (title) or an object with fields:
   * { title, priority?, is_complete?, category? }
   * Priority will be normalized to lowercase before insert to match DB enum.
   */
  const addTodo = async (
    payload: string | { title: string; priority?: string; is_complete?: boolean; category?: string }
  ) => {
    const title = typeof payload === 'string' ? payload : payload.title
    const rawPriority = typeof payload === 'string' ? undefined : payload.priority
    const priority = rawPriority ? String(rawPriority).toLowerCase() : undefined
    const is_complete = typeof payload === 'string' ? false : !!payload.is_complete
    const category = typeof payload === 'string' ? undefined : payload.category

    const insertObj: Record<string, any> = { title }
    if (typeof is_complete === 'boolean') insertObj.is_complete = is_complete
    if (priority) insertObj.priority = priority
    if (category) insertObj.category = category

    try {
      const { data, error } = await supabase.from('todos').insert(insertObj).select()
      if (error) {
        console.error('Error adding todo:', error.message ?? error, error)
        return
      }

      if (data && data.length > 0) setTodos((prev) => [data[0] as Todo, ...prev])
      else console.warn('addTodo: insert returned no rows', { insertObj, data })
    } catch (err) {
      console.error('Unexpected error in addTodo:', err)
    }
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

  const updateTodo = async (updated: Todo) => {
    if (!updated || !updated.id) {
      console.error('updateTodo called without a valid id:', updated)
      return
    }

    try {
      const id = String(updated.id)

      const { data, error } = await supabase
        .from('todos')
        .update({
          title: updated.title,
          category: (updated as any).category,
          priority: (updated as any).priority,
          is_complete: updated.is_complete,
        })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Supabase update error message:', error.message)
        console.error('Supabase update error object:', error)
        return
      }

      if (data && data.length > 0) {
        const u = data[0] as Todo
        setTodos((prev) => prev.map((t) => (t.id === u.id ? u : t)))
      } else {
        console.warn('updateTodo: update succeeded but returned no rows', { updated, data })
      }
    } catch (err) {
      console.error('Unexpected error in updateTodo:', err)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <MainContent todos={todos as any} onToggle={toggleComplete} onDelete={deleteTodo} onAdd={addTodo} onUpdate={updateTodo} />
        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onClose={handleCloseNewTaskModal}
          onSave={async (payload: { title: string; priority?: string; is_complete?: boolean; category?: string }) => {
            // normalize priority to lowercase to match DB enum
            const safe = { ...payload, priority: payload.priority ? String(payload.priority).toLowerCase() : undefined }
            await addTodo(safe)
            handleCloseNewTaskModal()
          }}
        />
      </div>
    </div>
  )
}