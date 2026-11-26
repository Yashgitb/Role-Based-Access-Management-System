import { useEffect, useState } from 'react'
import Alert from '../components/common/Alert.jsx'
import Loader from '../components/common/Loader.jsx'
import { useAuth } from '../context/useAuth.js'
import * as reportService from '../services/reportService.js'
import { getErrorMessage } from '../utils/permissions.js'

export default function Reports() {
  const { preferences } = useAuth()
  const compact = preferences.compactLayout

  const [roleOptions, setRoleOptions] = useState([])
  const [selectedRole, setSelectedRole] = useState('')
  const [summary, setSummary] = useState({
    totalRoles: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  })
  const [roleReports, setRoleReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    reportService
      .getRoleReports()
      .then((data) => {
        if (isMounted) {
          setRoleOptions(data.roles || [])
        }
      })
      .catch(() => {
        if (isMounted) {
          setRoleOptions([])
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    reportService
      .getReports(selectedRole)
      .then((data) => {
        if (!isMounted) return
        setErrorMessage('')
        setSummary(
          data.summary || {
            totalRoles: 0,
            totalUsers: 0,
            activeUsers: 0,
            inactiveUsers: 0,
          },
        )
        setRoleReports(data.roleReports || [])
      })
      .catch((error) => {
        if (!isMounted) return
        setErrorMessage(getErrorMessage(error, 'Failed to load reports.'))
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedRole])

  function handleRoleChange(event) {
    setIsLoading(true)
    setErrorMessage('')
    setSelectedRole(event.target.value)
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Role-wise user breakdown showing active and inactive accounts.
        </p>

        <div className="w-full sm:w-64">
          <label className="sr-only" htmlFor="report-role-filter">
            Filter report by role
          </label>
          <select
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-950"
            id="report-role-filter"
            onChange={handleRoleChange}
            value={selectedRole}
          >
            <option value="">All Roles</option>
            {roleOptions.map((roleItem) => (
              <option key={roleItem._id} value={roleItem._id}>
                {roleItem.roleName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMessage && (
        <Alert
          message={errorMessage}
          onClose={() => setErrorMessage('')}
          type="error"
        />
      )}

      {isLoading ? (
        <Loader label="Loading role statistics..." />
      ) : (
        <>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${
              compact ? 'gap-3.5' : 'gap-5'
            }`}
          >
            <div
              className={`rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${
                compact ? 'p-4' : 'p-5'
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Roles Included
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {summary.totalRoles}
              </p>
            </div>

            <div
              className={`rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${
                compact ? 'p-4' : 'p-5'
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Users
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {summary.totalUsers}
              </p>
            </div>

            <div
              className={`rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${
                compact ? 'p-4' : 'p-5'
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Users
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {summary.activeUsers}
              </p>
            </div>

            <div
              className={`rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${
                compact ? 'p-4' : 'p-5'
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Inactive Users
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {summary.inactiveUsers}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {roleReports.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-base font-medium text-slate-800 dark:text-slate-200">
                  No role statistics available
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-800/60">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Role Name
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Total Users
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Active Users
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Inactive Users
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Active Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                    {roleReports.map((item) => {
                      const activePercent =
                        item.totalUsers > 0
                          ? Math.round(
                              (item.activeUsers / item.totalUsers) * 100,
                            )
                          : 0
                      const cellPad = compact ? 'px-4 py-2.5' : 'px-4 py-3.5'

                      return (
                        <tr
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                          key={item._id}
                        >
                          <td
                            className={`${cellPad} font-semibold text-slate-900 dark:text-white`}
                          >
                            {item.roleName}
                          </td>
                          <td
                            className={`${cellPad} text-right font-medium text-slate-700 dark:text-slate-200`}
                          >
                            {item.totalUsers}
                          </td>
                          <td
                            className={`${cellPad} text-right font-medium text-emerald-600 dark:text-emerald-400`}
                          >
                            {item.activeUsers}
                          </td>
                          <td
                            className={`${cellPad} text-right font-medium text-amber-600 dark:text-amber-400`}
                          >
                            {item.inactiveUsers}
                          </td>
                          <td className={cellPad}>
                            {item.totalUsers === 0 ? (
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                No users assigned
                              </span>
                            ) : (
                              <div className="flex items-center gap-2.5">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                  <div
                                    className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                                    style={{ width: `${activePercent}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                  {activePercent}%
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
