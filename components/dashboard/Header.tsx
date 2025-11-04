import React from 'react'

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-accent dark:hover:bg-accent/30">☰</button>
        <div>
          <h3 className="text-lg font-semibold">Dashboard</h3>
          <p className="text-sm text-muted-foreground">Overview of tasks</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search tasks..."
          className="px-3 py-2 border rounded-md bg-background"
        />
        <button className="px-3 py-2 rounded-md bg-accent text-accent-foreground">New</button>
      </div>
    </header>
  )
}
