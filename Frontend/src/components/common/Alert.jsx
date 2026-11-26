const VARIANT_STYLES = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-200',
  error:
    'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-200',
  info: 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-200',
}

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${VARIANT_STYLES[type] || VARIANT_STYLES.info}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <p className="leading-5">{message}</p>
      {onClose && (
        <button
          aria-label="Dismiss notification"
          className="shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold opacity-75 transition hover:opacity-100"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      )}
    </div>
  )
}

