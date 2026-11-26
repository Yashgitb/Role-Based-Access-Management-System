import { Link, Navigate, Route, Routes } from 'react-router-dom'
import Loader from '../components/common/Loader.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuth } from '../context/useAuth.js'
import Dashboard from '../pages/Dashboard.jsx'
import Login from '../pages/Login.jsx'
import MyProfile from '../pages/MyProfile.jsx'
import Reports from '../pages/Reports.jsx'
import RoleManagement from '../pages/RoleManagement.jsx'
import Settings from '../pages/Settings.jsx'
import UserManagement from '../pages/UserManagement.jsx'
import { getFirstAccessibleRoute } from '../utils/permissions.js'
import ProtectedRoute from './ProtectedRoute.jsx'

function HomeRedirect() {
  const { isAuthenticated, isInitializing, user } = useAuth()

  if (isInitializing) {
    return <Loader fullScreen label="Loading application..." />
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  return <Navigate replace to={getFirstAccessibleRoute(user)} />
}

function UnauthorizedFallback() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return <Loader fullScreen label="Loading application..." />
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  return (
    <DashboardLayout title="No Accessible Modules">
      <div className="rounded-xl border border-amber-200 bg-white p-8 text-center shadow-xs dark:border-amber-900/60 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          No Modules Assigned
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Your current role does not have view access to any module. Please
          contact an administrator.
        </p>
      </div>
    </DashboardLayout>
  )
}

function NotFoundPage() {
  const { isAuthenticated, user } = useAuth()
  const target = isAuthenticated ? getFirstAccessibleRoute(user) : '/login'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        The page you requested does not exist.
      </p>
      <Link
        className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        to={target}
      >
        {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
      </Link>
    </main>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<HomeRedirect />} path="/" />
      <Route element={<Login />} path="/login" />

      <Route
        element={
          <ProtectedRoute requiredModule="dashboard" title="Dashboard">
            <Dashboard />
          </ProtectedRoute>
        }
        path="/dashboard"
      />
      <Route
        element={
          <ProtectedRoute
            requiredModule="userManagement"
            title="User Management"
          >
            <UserManagement />
          </ProtectedRoute>
        }
        path="/users"
      />
      <Route
        element={
          <ProtectedRoute
            requiredModule="roleManagement"
            title="Role Management"
          >
            <RoleManagement />
          </ProtectedRoute>
        }
        path="/roles"
      />
      <Route
        element={
          <ProtectedRoute requiredModule="reports" title="Reports">
            <Reports />
          </ProtectedRoute>
        }
        path="/reports"
      />
      <Route
        element={
          <ProtectedRoute requiredModule="settings" title="Settings">
            <Settings />
          </ProtectedRoute>
        }
        path="/settings"
      />
      <Route
        element={
          <ProtectedRoute requiredModule="myProfile" title="My Profile">
            <MyProfile />
          </ProtectedRoute>
        }
        path="/profile"
      />

      <Route element={<UnauthorizedFallback />} path="/unauthorized" />
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  )
}
