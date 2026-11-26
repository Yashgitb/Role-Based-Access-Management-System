import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth.js'
import ThemeToggle from '../common/ThemeToggle.jsx'

export default function Navbar({ title, onMenuClick }) {
  const { user, logout, preferences } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header
      className={`sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs sm:px-6 dark:border-slate-800 dark:bg-slate-900/95 ${
        preferences.compactLayout ? 'h-14' : 'h-16'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          aria-label="Open navigation menu"
          className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={onMenuClick}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-lg font-semibold text-slate-900 sm:text-xl dark:text-white">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {user && (
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              {user.name}
            </span>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
              {user.role}
            </span>
          </div>
        )}

        <ThemeToggle />

        <button
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-rose-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-300"
          disabled={isLoggingOut}
          onClick={handleLogout}
          type="button"
        >
          {isLoggingOut ? 'Signing out...' : 'Logout'}
        </button>
      </div>
    </header>
  )
}

