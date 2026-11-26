export default function Loader({ label = 'Loading...', fullScreen = false }) {
  const content = (
    <div
      className="flex flex-col items-center justify-center gap-3 py-10 text-slate-600 dark:text-slate-300"
      role="status"
      aria-live="polite"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-300 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {content}
      </div>
    )
  }

  return content
}

