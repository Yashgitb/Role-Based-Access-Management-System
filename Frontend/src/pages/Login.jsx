import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Alert from '../components/common/Alert.jsx'
import Loader from '../components/common/Loader.jsx'
import ThemeToggle from '../components/common/ThemeToggle.jsx'
import { useAuth } from '../context/useAuth.js'
import { getErrorMessage, getFirstAccessibleRoute } from '../utils/permissions.js'

const fieldClassName =
  'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-950'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const {
    login,
    isAuthenticated,
    isInitializing,
    user,
    authNotice,
    clearAuthNotice,
  } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (isInitializing) {
    return <Loader fullScreen label="Checking authentication..." />
  }

  if (isAuthenticated && user) {
    return <Navigate replace to={getFirstAccessibleRoute(user)} />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    clearAuthNotice()

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setErrorMessage('Email address is required.')
      return
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }
    if (!password) {
      setErrorMessage('Password is required.')
      return
    }

    setIsSubmitting(true)
    try {
      const loggedInUser = await login({ email: trimmedEmail, password })
      navigate(getFirstAccessibleRoute(loggedInUser), { replace: true })
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Sign in failed. Please check your credentials.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <section
        aria-labelledby="login-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
      >
        <div className="mb-8 flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold tracking-wide text-white"
          >
            RB
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Access Management
          </p>
        </div>

        <div>
          <h1
            className="text-2xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-white"
            id="login-title"
          >
            Role-Based Access Management System
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Sign in with your account to continue.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {authNotice && !errorMessage && (
            <Alert
              message={authNotice}
              onClose={clearAuthNotice}
              type="warning"
            />
          )}
          {errorMessage && (
            <Alert
              message={errorMessage}
              onClose={() => setErrorMessage('')}
              type="error"
            />
          )}
        </div>

        <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              autoComplete="username"
              className={`mt-2 ${fieldClassName}`}
              disabled={isSubmitting}
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative mt-2">
              <input
                autoComplete="current-password"
                className={`${fieldClassName} pr-16`}
                disabled={isSubmitting}
                id="password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 rounded-r-lg px-3 text-sm font-medium text-indigo-700 outline-none hover:text-indigo-900 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-200 dark:focus-visible:ring-indigo-400"
                onClick={() => setShowPassword((isVisible) => !isVisible)}
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-400 dark:active:bg-indigo-600"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-7 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
          Sign in with your assigned account. Your access is managed by your
          organization.
        </p>
      </section>
    </main>
  )
}
