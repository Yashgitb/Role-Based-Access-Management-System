export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit = 10,
  itemLabel = 'records',
  onPageChange,
  disabled = false,
}) {
  const safeTotalPages = Math.max(totalPages || 0, 1)
  const startRecord =
    totalItems === 0 ? 0 : (currentPage - 1) * limit + 1
  const endRecord = Math.min(currentPage * limit, totalItems)

  return (
    <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center dark:border-slate-800 dark:text-slate-400">
      <div>
        {totalItems > 0 ? (
          <span>
            Showing <strong className="text-slate-900 dark:text-slate-100">{startRecord}</strong>–
            <strong className="text-slate-900 dark:text-slate-100">{endRecord}</strong> of{' '}
            <strong className="text-slate-900 dark:text-slate-100">{totalItems}</strong>{' '}
            {itemLabel}
          </span>
        ) : (
          <span>0 {itemLabel} found</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Page {currentPage} of {totalPages === 0 ? 0 : safeTotalPages}
        </span>

        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            disabled={disabled || currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            type="button"
          >
            Previous
          </button>
          <button
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            disabled={disabled || totalPages === 0 || currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

