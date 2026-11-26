import { useEffect } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Loader from '../components/common/Loader.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuth } from '../context/useAuth.js'
import { getFirstAccessibleRoute } from '../utils/permissions.js'

export default function ProtectedRoute({
  children,
  requiredModule,
  requiredAction = 'view',
  title = 'Access Management',
}) {
  const { isAuthenticated, isInitializing, user, can, refreshUser } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser()
    }
  }, [isAuthenticated, location.pathname, refreshUser])

  if (isInitializing) {
    return <Loader fullScreen label="Verifying your session..." />
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (requiredModule && !can(requiredModule, requiredAction)) {
    const fallbackPath = getFirstAccessibleRoute(user)
    return (
      <DashboardLayout title="Access Denied">
        <div className="rounded-xl border border-rose-200 bg-white p-8 text-center shadow-xs dark:border-rose-900/60 dark:bg-slate-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6m0-6 6 6" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
            403 — Access Denied
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Your role ({user?.role}) does not have permission to access{' '}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {title}
            </span>
            . Contact an administrator if you believe this is an error.
          </p>
          {fallbackPath !== '/unauthorized' && (
            <Link
              className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              to={fallbackPath}
            >
              Return to Accessible Page
            </Link>
          )}
        </div>
      </DashboardLayout>
    )
  }

  return <DashboardLayout title={title}>{children}</DashboardLayout>
}

