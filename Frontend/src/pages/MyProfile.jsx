import { useEffect, useState } from 'react'
import Alert from '../components/common/Alert.jsx'
import Loader from '../components/common/Loader.jsx'
import { useAuth } from '../context/useAuth.js'
import * as profileService from '../services/profileService.js'
import { formatDate, getErrorMessage } from '../utils/permissions.js'

const inputClassName =
  'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-950 dark:disabled:bg-slate-800 dark:disabled:text-slate-400'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function MyProfile() {
  const { can, updateUser, preferences } = useAuth()
  const canEdit = can('myProfile', 'edit')
  const compact = preferences.compactLayout

  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', email: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState({
    type: '',
    message: '',
  })

  useEffect(() => {
    let isMounted = true

    profileService
      .getProfile()
      .then((data) => {
        if (!isMounted) return
        setProfile(data.profile)
        setForm({
          name: data.profile?.name || '',
          email: data.profile?.email || '',
        })
      })
      .catch((error) => {
        if (!isMounted) return
        setFeedback({
          type: 'error',
          message: getErrorMessage(error, 'Failed to load profile.'),
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
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canEdit) return

    setFeedback({ type: '', message: '' })

    const trimmedName = form.name.trim()
    const trimmedEmail = form.email.trim()

    if (!trimmedName) {
      setFeedback({ type: 'error', message: 'Name is required.' })
      return
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid email address.',
      })
      return
    }

    setIsSaving(true)
    try {
      const data = await profileService.updateProfile({
        name: trimmedName,
        email: trimmedEmail,
      })
      setProfile(data.profile)
      setForm({
        name: data.profile.name,
        email: data.profile.email,
      })
      updateUser({
        name: data.profile.name,
        email: data.profile.email,
      })
      setFeedback({
        type: 'success',
        message: data.message || 'Profile updated successfully.',
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Failed to update profile.'),
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    if (!canEdit) return

    setPasswordFeedback({ type: '', message: '' })

    const { currentPassword, newPassword, confirmPassword } = passwordForm

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'All password fields are required.',
      })
      return
    }
    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: 'error',
        message: 'New password must be at least 8 characters long.',
      })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'New password and confirmation do not match.',
      })
      return
    }
    if (currentPassword === newPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'New password must be different from your current password.',
      })
      return
    }

    setIsChangingPassword(true)
    try {
      const data = await profileService.changePassword({
        currentPassword,
        newPassword,
      })
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setShowPasswords({ current: false, next: false, confirm: false })
      setPasswordFeedback({
        type: 'success',
        message: data.message || 'Password changed successfully.',
      })
    } catch (error) {
      setPasswordFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Failed to change password.'),
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        View your account details, update your personal information, and manage
        your password.
      </p>

      {feedback.message && (
        <Alert
          message={feedback.message}
          onClose={() => setFeedback({ type: '', message: '' })}
          type={feedback.type}
        />
      )}

      {isLoading ? (
        <Loader label="Loading your profile..." />
      ) : (
        profile && (
          <div
            className={`grid grid-cols-1 lg:grid-cols-3 ${
              compact ? 'gap-4' : 'gap-6'
            }`}
          >
            <section
              className={`self-start rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${
                compact ? 'p-4' : 'p-6'
              }`}
            >
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Account Overview
              </h2>

              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Assigned Role
                  </dt>
                  <dd className="mt-1">
                    <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                      {profile.role}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Account Status
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        profile.isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                      }`}
                    >
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Member Since
                  </dt>
                  <dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                    {formatDate(profile.createdAt)}
                  </dd>
                </div>
              </dl>
            </section>

            <div className={`lg:col-span-2 ${compact ? 'space-y-4' : 'space-y-6'}`}>
              <section
                className={`rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${
                  compact ? 'p-4' : 'p-6'
                }`}
              >
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Personal Information
                </h2>

                {!canEdit && (
                  <div className="mt-4">
                    <Alert
                      message="You currently have view-only access to your profile."
                      type="info"
                    />
                  </div>
                )}

                <form
                  className="mt-5 space-y-4"
                  noValidate
                  onSubmit={handleSubmit}
                >
                  <div>
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                      htmlFor="profile-name"
                    >
                      Full Name
                    </label>
                    <input
                      className={`mt-1.5 ${inputClassName}`}
                      disabled={!canEdit || isSaving}
                      id="profile-name"
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      required
                      type="text"
                      value={form.name}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                      htmlFor="profile-email"
                    >
                      Email Address
                    </label>
                    <input
                      className={`mt-1.5 ${inputClassName}`}
                      disabled={!canEdit || isSaving}
                      id="profile-email"
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      required
                      type="email"
                      value={form.email}
                    />
                  </div>

                  {canEdit && (
                    <div className="flex justify-end pt-2">
                      <button
                        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                        disabled={isSaving}
                        type="submit"
                      >
                        {isSaving ? 'Saving...' : 'Update Profile'}
                      </button>
                    </div>
                  )}
                </form>
              </section>

              {canEdit && (
                <section
                  className={`rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${
                    compact ? 'p-4' : 'p-6'
                  }`}
                >
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Change Password
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Enter your current password to set a new password (minimum 8
                    characters).
                  </p>

                  {passwordFeedback.message && (
                    <div className="mt-4">
                      <Alert
                        message={passwordFeedback.message}
                        onClose={() =>
                          setPasswordFeedback({ type: '', message: '' })
                        }
                        type={passwordFeedback.type}
                      />
                    </div>
                  )}

                  <form
                    className="mt-5 space-y-4"
                    noValidate
                    onSubmit={handlePasswordSubmit}
                  >
                    <div>
                      <label
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                        htmlFor="profile-current-password"
                      >
                        Current Password
                      </label>
                      <div className="relative mt-1.5">
                        <input
                          autoComplete="current-password"
                          className={`${inputClassName} pr-16`}
                          disabled={isChangingPassword}
                          id="profile-current-password"
                          onChange={(event) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              currentPassword: event.target.value,
                            }))
                          }
                          placeholder="Enter current password"
                          required
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                        />
                        <button
                          className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              current: !prev.current,
                            }))
                          }
                          type="button"
                        >
                          {showPasswords.current ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                        htmlFor="profile-new-password"
                      >
                        New Password
                      </label>
                      <div className="relative mt-1.5">
                        <input
                          autoComplete="new-password"
                          className={`${inputClassName} pr-16`}
                          disabled={isChangingPassword}
                          id="profile-new-password"
                          onChange={(event) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              newPassword: event.target.value,
                            }))
                          }
                          placeholder="Minimum 8 characters"
                          required
                          type={showPasswords.next ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                        />
                        <button
                          className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              next: !prev.next,
                            }))
                          }
                          type="button"
                        >
                          {showPasswords.next ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                        htmlFor="profile-confirm-password"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative mt-1.5">
                        <input
                          autoComplete="new-password"
                          className={`${inputClassName} pr-16`}
                          disabled={isChangingPassword}
                          id="profile-confirm-password"
                          onChange={(event) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              confirmPassword: event.target.value,
                            }))
                          }
                          placeholder="Re-enter new password"
                          required
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                        />
                        <button
                          className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              confirm: !prev.confirm,
                            }))
                          }
                          type="button"
                        >
                          {showPasswords.confirm ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                        disabled={isChangingPassword}
                        type="submit"
                      >
                        {isChangingPassword
                          ? 'Updating...'
                          : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </div>
          </div>
        )
      )}
    </div>
  )
}
