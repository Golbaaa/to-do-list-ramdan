'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/dashboard/Sidebar'
import MainContent from '@/components/dashboard/MainContent'
import NewTaskModal from '@/components/tasks/NewTaskModal'

interface Todo {
  id: string
  title: string
  category?: string
  priority?: string
  is_complete: boolean
  inserted_at?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [todos, setTodos] = useState<Todo[]>([])
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession()
        const session = (data as any)?.session
        if (!session) {
          router.replace('/login')
          return
        }
        const uid = session.user?.id
        const email = session.user?.email || ''
        setUserId(uid)
        setUserEmail(email)
        setLoading(false)
        fetchTodos(uid)
      } catch (err) {
        console.error('Auth check failed:', err)
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router])

  const fetchTodos = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', uid)
        .order('inserted_at', { ascending: false })

      if (error) {
        console.error('Error fetching todos:', error)
      } else {
        setTodos((data as Todo[]) || [])
      }
    } catch (err) {
      console.error('Unexpected error fetching todos:', err)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: !current })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Error toggling todo:', error)
      } else {
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, is_complete: !current } : t))
        )
      }
    } catch (err) {
      console.error('Unexpected error toggling todo:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting todo:', error)
      } else {
        setTodos((prev) => prev.filter((t) => t.id !== id))
      }
    } catch (err) {
      console.error('Unexpected error deleting todo:', err)
    }
  }

  const handleAdd = async (payload: string | { title: string; priority?: string; category?: string }) => {
    if (!userId) {
      console.error('No userId available')
      return
    }
    try {
      const title = typeof payload === 'string' ? payload : payload.title
      const priority = typeof payload === 'string' ? undefined : payload.priority?.toLowerCase()
      const category = typeof payload === 'string' ? undefined : payload.category

      const insertObj: Record<string, any> = { title, is_complete: false, user_id: userId }
      if (priority) insertObj.priority = priority
      if (category) insertObj.category = category

      console.log('Inserting todo:', insertObj)

      const { data, error } = await supabase
        .from('todos')
        .insert(insertObj)
        .select()

      if (error) {
        console.error('Supabase error adding todo:', error.message, error.code)
      } else if (data && data.length > 0) {
        console.log('Todo added successfully:', data[0])
        setTodos((prev) => [data[0] as Todo, ...prev])
      } else {
        console.error('No data returned from insert')
      }
    } catch (err) {
      console.error('Unexpected error adding todo:', err)
    }
  }

  const handleUpdate = async (updated: Todo) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({
          title: updated.title,
          category: updated.category,
          priority: updated.priority?.toLowerCase(),
          is_complete: updated.is_complete,
        })
        .eq('id', updated.id)
        .eq('user_id', userId)
        .select()

      if (error) {
        console.error('Error updating todo:', error)
      } else if (data && data.length > 0) {
        const u = data[0] as Todo
        setTodos((prev) => prev.map((t) => (t.id === u.id ? u : t)))
      }
    } catch (err) {
      console.error('Unexpected error updating todo:', err)
    }
  }

  const totalTasks = todos.length
  const completedTasks = todos.filter((t) => t.is_complete).length
  const pendingTasks = totalTasks - completedTasks

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <Header userEmail={userEmail} />
      
      <div className="flex gap-6 p-6">
        <Sidebar />
        
        <div className="flex-1">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalTasks}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                  📋
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{completedTasks}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{pendingTasks}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-xl">
                  ⏳
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
                <p className="text-sm text-gray-500 mt-1">Manage and track your daily tasks</p>
              </div>
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center gap-2"
              >
                <span>+</span> Add Task
              </button>
            </div>

            <div className="p-6">
              <MainContent
                todos={todos as any}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={async (payload: any) => {
          const safe = { ...payload, priority: payload.priority?.toLowerCase() }
          await handleAdd(safe)
          setIsNewTaskModalOpen(false)
        }}
      />
    </div>
  )
}
