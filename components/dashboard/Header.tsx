'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useGlobalToast } from '@/components/ui/ToastProvider'

type HeaderProps = {
  userEmail?: string
  onLogout?: () => void | Promise<void>
}

export default function Header({ userEmail, onLogout }: HeaderProps) {
  const router = useRouter()
  const toast = useGlobalToast()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.push('Berhasil logout', 'success')
    } catch (err) {
      console.error('Logout error:', err)
      toast.push('Logout gagal', 'error')
    } finally {
      if (onLogout) await onLogout()
      router.replace('/login')
    }
  }

  const getInitials = (email: string) => {
    return email?.split('@')[0]?.substring(0, 2)?.toUpperCase() || 'US'
  }

  const initials = getInitials(userEmail || '')

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Section - Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-lg font-bold text-white">✓</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">My Tasks</h1>
              <p className="text-xs text-blue-100">Organize your daily work</p>
            </div>
          </div>
        </div>

        {/* Right Section - User Menu */}
        <div className="flex items-center gap-4">
          {/* User Avatar & Info */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center font-semibold text-white text-sm">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white truncate">
                  {userEmail?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-blue-100 truncate">{userEmail}</p>
              </div>
              <svg
                className={`w-4 h-4 text-white transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">{userEmail?.split('@')[0]}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleLogout()
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
