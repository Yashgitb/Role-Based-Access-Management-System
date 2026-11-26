import { useState } from 'react'

const fieldClassName =
  'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-950'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6">
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

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
              id="email"
              name="email"
              placeholder="you@company.com"
              required
              type="email"
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
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                type={showPassword ? 'text' : 'password'}
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
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-400 dark:active:bg-indigo-600"
            type="submit"
          >
            Sign In
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
