import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/useAuth.js'
import { NAV_ITEMS } from '../../utils/permissions.js'

const MODULE_ICONS = {
  dashboard: (
    <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
  ),
  userManagement: (
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m16-10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm6 10v-2a4 4 0 0 0-3-3.87m-3-12.13a4 4 0 0 1 0 7.75" />
  ),
  roleManagement: (
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-2-9 2 2 4-4" />
  ),
  reports: (
    <path d="M3 3v18h18M7 16v-5m5 5V7m5 9v-3" />
  ),
  settings: (
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-1.5a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.78 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  ),
  myProfile: (
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
  ),
}

export default function Sidebar({ isOpen, onClose }) {
  const { can, preferences } = useAuth()
  const visibleItems = NAV_ITEMS.filter((item) => can(item.module, 'view'))
  const compact = preferences.compactLayout

  return (
    <>
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        aria-label="Primary navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div
          className={`flex items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800 ${
            compact ? 'h-14' : 'h-16'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
              RB
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                RBAC Portal
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Access Control
              </p>
            </div>
          </div>

          <button
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
            onClick={onClose}
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
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className={`flex-1 space-y-1 overflow-y-auto ${compact ? 'p-2.5' : 'p-3.5'}`}>
          {visibleItems.length > 0 ? (
            visibleItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 ${
                    compact ? 'py-2 text-xs' : 'py-2.5 text-sm'
                  } font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
                key={item.path}
                onClick={onClose}
                to={item.path}
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  {MODULE_ICONS[item.module]}
                </svg>
                <span>{item.label}</span>
              </NavLink>
            ))
          ) : (
            <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
              No modules assigned to your role.
            </p>
          )}
        </nav>
      </aside>
    </>
  )
}

