import React from 'react'
import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r dark:bg-slate-900 dark:border-slate-700">
      <div className="px-6 py-5 border-b">
        <h2 className="text-lg font-semibold">To-Do Ramdan</h2>
        <p className="text-sm text-muted-foreground">Manage your tasks</p>
      </div>

      <nav className="p-4 space-y-1">
        <Link href="#" className="block px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground">
          Dashboard
        </Link>
        <Link href="#" className="block px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground">
          Tasks
        </Link>
        <Link href="#" className="block px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground">
          Settings
        </Link>
      </nav>

      <div className="mt-auto p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Ramdan
      </div>
    </aside>
  )
}
