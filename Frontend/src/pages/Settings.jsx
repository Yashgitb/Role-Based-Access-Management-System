import { useEffect, useState } from 'react'
import Alert from '../components/common/Alert.jsx'
import Loader from '../components/common/Loader.jsx'
import { useAuth } from '../context/useAuth.js'
import * as settingsService from '../services/settingsService.js'
import { getErrorMessage } from '../utils/permissions.js'

export default function Settings() {
  const { can, preferences, updatePreferences } = useAuth()
  const canEdit = can('settings', 'edit')
  const compact = preferences.compactLayout

  const [form, setForm] = useState({
    compactLayout: false,
    showWelcomeMessage: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  useEffect(() => {
    let isMounted = true

    settingsService
      .getSettings()
      .then((data) => {
        if (!isMounted) return
        const nextSettings = {
          compactLayout: Boolean(data.settings?.compactLayout),
          showWelcomeMessage: data.settings?.showWelcomeMessage ?? true,
        }
        setForm(nextSettings)
        updatePreferences(nextSettings)
      })
      .catch((error) => {
        if (!isMounted) return
        setFeedback({
          type: 'error',
          message: getErrorMessage(error, 'Failed to load application settings.'),
        })
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [updatePreferences])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canEdit) return

    setIsSaving(true)
    setFeedback({ type: '', message: '' })

    try {
      const data = await settingsService.updateSettings(form)
      const savedSettings = {
        compactLayout: Boolean(data.settings?.compactLayout),
        showWelcomeMessage: data.settings?.showWelcomeMessage ?? true,
      }
      setForm(savedSettings)
      updatePreferences(savedSettings)
      setFeedback({
        type: 'success',
        message: data.message || 'Settings saved successfully.',
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Failed to save settings.'),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Configure application layout and dashboard preferences. Dark and light
        theme switching remains available to all users from the navigation bar.
      </p>

      {feedback.message && (
        <Alert
          message={feedback.message}
          onClose={() => setFeedback({ type: '', message: '' })}
          type={feedback.type}
        />
      )}

      {!canEdit && !isLoading && (
        <Alert
          message="You have view-only access to Settings. Saving changes requires Settings Edit permission."
          type="info"
        />
      )}

      {isLoading ? (
        <Loader label="Loading settings..." />
      ) : (
        <form
          className={`max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${
            compact ? 'p-4 space-y-4' : 'p-6 space-y-6'
          }`}
          onSubmit={handleSubmit}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
            <div>
              <label
                className="text-sm font-semibold text-slate-900 dark:text-white"
                htmlFor="setting-compact-layout"
              >
                Compact Layout
              </label>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Use tighter spacing in the sidebar, header, cards, and tables.
              </p>
            </div>
            <input
              checked={form.compactLayout}
              className="mt-1 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800"
              disabled={!canEdit || isSaving}
              id="setting-compact-layout"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  compactLayout: event.target.checked,
                }))
              }
              type="checkbox"
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <label
                className="text-sm font-semibold text-slate-900 dark:text-white"
                htmlFor="setting-welcome-message"
              >
                Show Dashboard Welcome Message
              </label>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Display the welcome banner and quick module links at the top of
                the Dashboard.
              </p>
            </div>
            <input
              checked={form.showWelcomeMessage}
              className="mt-1 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800"
              disabled={!canEdit || isSaving}
              id="setting-welcome-message"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  showWelcomeMessage: event.target.checked,
                }))
              }
              type="checkbox"
            />
          </div>

          {canEdit && (
            <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  )
}
