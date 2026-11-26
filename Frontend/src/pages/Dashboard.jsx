import { useCallback, useEffect, useState } from 'react'
import Alert from '../components/common/Alert.jsx'
import Loader from '../components/common/Loader.jsx'
import { useAuth } from '../context/useAuth.js'
import * as dashboardService from '../services/dashboardService.js'
import { getErrorMessage } from '../utils/permissions.js'

const STAT_CARDS = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    accent:
      'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
  },
  {
    key: 'activeUsers',
    label: 'Active Users',
    accent:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  },
  {
    key: 'inactiveUsers',
    label: 'Inactive Users',
    accent:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
  },
  {
    key: 'totalRoles',
    label: 'Total Roles',
    accent:
      'bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
  },
]

export default function Dashboard() {
  const { user, preferences } = useAuth()
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const compact = preferences.compactLayout

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const data = await dashboardService.getDashboardStats()
      setStats({
        totalUsers: data.totalUsers ?? 0,
        totalRoles: data.totalRoles ?? 0,
        activeUsers: data.activeUsers ?? 0,
        inactiveUsers: data.inactiveUsers ?? 0,
      })
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Failed to load dashboard statistics.'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    dashboardService
      .getDashboardStats()
      .then((data) => {
        if (!isMounted) return
        setStats({
          totalUsers: data.totalUsers ?? 0,
          totalRoles: data.totalRoles ?? 0,
          activeUsers: data.activeUsers ?? 0,
          inactiveUsers: data.inactiveUsers ?? 0,
        })
      })
      .catch((error) => {
        if (!isMounted) return
        setErrorMessage(
          getErrorMessage(error, 'Failed to load dashboard statistics.'),
        )
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const activeRate =
    stats && stats.totalUsers > 0
      ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
      : 0

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      {preferences.showWelcomeMessage && user && (
        <section
          className={`rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${
            compact ? 'p-4' : 'p-6'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Welcome back
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
            Hello, {user.name}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Signed in as{' '}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {user.email}
            </span>{' '}
            with the{' '}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {user.role}
            </span>{' '}
            role.
          </p>
        </section>
      )}

      {errorMessage && (
        <div className="space-y-3">
          <Alert
            message={errorMessage}
            onClose={() => setErrorMessage('')}
            type="error"
          />
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            onClick={fetchStats}
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <Loader label="Loading dashboard statistics..." />
      ) : (
        stats && (
          <>
            <section
              aria-label="System statistics"
              className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 ${
                compact ? 'gap-3.5' : 'gap-5'
              }`}
            >
              {STAT_CARDS.map((card) => (
                <div
                  className={`rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${
                    compact ? 'p-4' : 'p-5'
                  }`}
                  key={card.key}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {card.label}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${card.accent}`}
                    >
                      Live
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {stats[card.key]}
                  </p>
                </div>
              ))}
            </section>

            <section
              className={`rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${
                compact ? 'p-4' : 'p-6'
              }`}
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    User Account Status Overview
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Distribution of active and inactive user accounts.
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {activeRate}% Active
                </span>
              </div>

              {stats.totalUsers === 0 ? (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  No users found in the system yet.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-950/60">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300 dark:bg-emerald-400"
                      style={{ width: `${activeRate}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                      Active: {stats.activeUsers}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400 dark:bg-amber-500" />
                      Inactive: {stats.inactiveUsers}
                    </span>
                  </div>
                </div>
              )}
            </section>
          </>
        )
      )}
    </div>
  )
}
