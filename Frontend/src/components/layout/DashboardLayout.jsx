import { useState } from 'react'
import { useAuth } from '../../context/useAuth.js'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'

export default function DashboardLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { preferences } = useAuth()

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />

        <main
          className={`flex-1 ${
            preferences.compactLayout
              ? 'p-4 sm:p-5'
              : 'p-5 sm:p-7'
          }`}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

