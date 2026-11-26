import Modal from './Modal.jsx'

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Delete',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal isOpen={isOpen} maxWidth="max-w-md" onClose={onCancel} title={title}>
      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
        {message}
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          disabled={isLoading}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-rose-500 dark:hover:bg-rose-400"
          disabled={isLoading}
          onClick={onConfirm}
          type="button"
        >
          {isLoading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

