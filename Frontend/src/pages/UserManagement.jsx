import { useCallback, useEffect, useRef, useState } from 'react'
import Alert from '../components/common/Alert.jsx'
import ConfirmModal from '../components/common/ConfirmModal.jsx'
import Loader from '../components/common/Loader.jsx'
import Modal from '../components/common/Modal.jsx'
import Pagination from '../components/common/Pagination.jsx'
import { useAuth } from '../context/useAuth.js'
import * as userService from '../services/userService.js'
import { formatDate, getErrorMessage } from '../utils/permissions.js'

const inputClassName =
  'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-950'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function UserManagement() {
  const { user: currentUser, can, preferences } = useAuth()
  const compact = preferences.compactLayout

  const canCreate = can('userManagement', 'create')
  const canEdit = can('userManagement', 'edit')
  const canDelete = can('userManagement', 'delete')

  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalUsers: 0,
    limit: 10,
  })
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const [roleFilters, setRoleFilters] = useState([])
  const [availableRoles, setAvailableRoles] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  })
  const [showCreatePassword, setShowCreatePassword] = useState(false)
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  })
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [editError, setEditError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const [statusLoadingId, setStatusLoadingId] = useState('')
  const [deletingUser, setDeletingUser] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const requestCounterRef = useRef(0)

  // Debounce search input
  useEffect(() => {
    if (searchInput === debouncedSearch) return undefined

    const timer = setTimeout(() => {
      setIsLoading(true)
      setDebouncedSearch(searchInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, debouncedSearch])

  // Load role filter options and assignable roles
  useEffect(() => {
    let isMounted = true

    userService
      .getRoleFilters()
      .then((data) => {
        if (isMounted) {
          setRoleFilters(data.roles || [])
        }
      })
      .catch(() => {
        if (isMounted) {
          setRoleFilters([])
        }
      })

    if (canCreate || canEdit) {
      userService
        .getAvailableRoles()
        .then((data) => {
          if (isMounted) {
            setAvailableRoles(data.roles || [])
          }
        })
        .catch(() => {
          if (isMounted) {
            setAvailableRoles([])
          }
        })
    }

    return () => {
      isMounted = false
    }
  }, [canCreate, canEdit])

  const assignableRoles = canCreate || canEdit ? availableRoles : []

  const fetchUsers = useCallback(
    async (targetPage = page, targetSearch = debouncedSearch, targetRole = roleFilter) => {
      const requestId = ++requestCounterRef.current
      const controller = new AbortController()

      setIsLoading(true)
      try {
        const data = await userService.getUsers(
          {
            page: targetPage,
            search: targetSearch,
            role: targetRole,
          },
          controller.signal,
        )

        if (requestId !== requestCounterRef.current) return

        setUsers(data.users || [])
        setPagination({
          currentPage: data.currentPage ?? 1,
          totalPages: data.totalPages ?? 0,
          totalUsers: data.totalUsers ?? 0,
          limit: data.limit ?? 10,
        })

        if (data.currentPage && data.currentPage !== targetPage) {
          setPage(data.currentPage)
        }
      } catch (error) {
        if (requestId !== requestCounterRef.current) return
        const msg = getErrorMessage(error, 'Failed to load users.')
        if (msg) {
          setFeedback({ type: 'error', message: msg })
        }
      } finally {
        if (requestId === requestCounterRef.current) {
          setIsLoading(false)
        }
      }
    },
    [page, debouncedSearch, roleFilter],
  )

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestCounterRef.current

    userService
      .getUsers(
        {
          page,
          search: debouncedSearch,
          role: roleFilter,
        },
        controller.signal,
      )
      .then((data) => {
        if (requestId !== requestCounterRef.current) return
        setUsers(data.users || [])
        setPagination({
          currentPage: data.currentPage ?? 1,
          totalPages: data.totalPages ?? 0,
          totalUsers: data.totalUsers ?? 0,
          limit: data.limit ?? 10,
        })
      })
      .catch((error) => {
        if (requestId !== requestCounterRef.current) return
        const msg = getErrorMessage(error, 'Failed to load users.')
        if (msg) {
          setFeedback({ type: 'error', message: msg })
        }
      })
      .finally(() => {
        if (requestId === requestCounterRef.current) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [page, debouncedSearch, roleFilter])

  function handleSearchChange(event) {
    setSearchInput(event.target.value)
    setPage(1)
  }

  function handleRoleFilterChange(event) {
    setIsLoading(true)
    setRoleFilter(event.target.value)
    setPage(1)
  }

  function handlePageChange(nextPage) {
    setIsLoading(true)
    setPage(nextPage)
  }

  function handleResetFilters() {
    if (debouncedSearch || roleFilter) {
      setIsLoading(true)
    }
    setSearchInput('')
    setDebouncedSearch('')
    setRoleFilter('')
    setPage(1)
  }

  function openCreateModal() {
    setCreateForm({
      name: '',
      email: '',
      password: '',
      role: assignableRoles[0]?._id || '',
    })
    setShowCreatePassword(false)
    setCreateError('')
    setIsCreateOpen(true)
  }

  async function handleCreateSubmit(event) {
    event.preventDefault()
    setCreateError('')

    if (!createForm.name.trim()) {
      setCreateError('Name is required.')
      return
    }
    if (!EMAIL_REGEX.test(createForm.email.trim())) {
      setCreateError('Please enter a valid email address.')
      return
    }
    if (createForm.password.length < 8) {
      setCreateError('Password must be at least 8 characters long.')
      return
    }
    if (!createForm.role) {
      setCreateError('Please select a role.')
      return
    }

    setIsCreating(true)
    try {
      const data = await userService.createUser({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      })
      setIsCreateOpen(false)
      setFeedback({
        type: 'success',
        message: data.message || 'User created successfully.',
      })
      setPage(1)
      await fetchUsers(1, debouncedSearch, roleFilter)
    } catch (error) {
      setCreateError(getErrorMessage(error, 'Failed to create user.'))
    } finally {
      setIsCreating(false)
    }
  }

  function openEditModal(targetUser) {
    setEditingUser(targetUser)
    setEditForm({
      name: targetUser.name || '',
      email: targetUser.email || '',
      password: '',
      role: targetUser.role?._id || '',
    })
    setShowEditPassword(false)
    setEditError('')
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    if (!editingUser) return
    setEditError('')

    if (!editForm.name.trim()) {
      setEditError('Name is required.')
      return
    }
    if (!EMAIL_REGEX.test(editForm.email.trim())) {
      setEditError('Please enter a valid email address.')
      return
    }
    if (editForm.password && editForm.password.length < 8) {
      setEditError('Password must be at least 8 characters long.')
      return
    }
    if (!editForm.role) {
      setEditError('Role selection is required.')
      return
    }

    const payload = {
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      role: editForm.role,
    }
    if (editForm.password) {
      payload.password = editForm.password
    }

    setIsUpdating(true)
    try {
      const data = await userService.updateUser(editingUser._id, payload)
      setEditingUser(null)
      setFeedback({
        type: 'success',
        message: data.message || 'User updated successfully.',
      })
      await fetchUsers(page, debouncedSearch, roleFilter)
    } catch (error) {
      setEditError(getErrorMessage(error, 'Failed to update user.'))
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleToggleStatus(targetUser) {
    setFeedback({ type: '', message: '' })
    setStatusLoadingId(targetUser._id)
    try {
      const data = await userService.updateUserStatus(
        targetUser._id,
        !targetUser.isActive,
      )
      setFeedback({
        type: 'success',
        message: data.message || 'User status updated successfully.',
      })
      await fetchUsers(page, debouncedSearch, roleFilter)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Failed to update user status.'),
      })
    } finally {
      setStatusLoadingId('')
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingUser) return
    setIsDeleting(true)
    setFeedback({ type: '', message: '' })
    try {
      const data = await userService.deleteUser(deletingUser._id)
      setDeletingUser(null)
      setFeedback({
        type: 'success',
        message: data.message || 'User deleted successfully.',
      })
      await fetchUsers(page, debouncedSearch, roleFilter)
    } catch (error) {
      setDeletingUser(null)
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Failed to delete user.'),
      })
    } finally {
      setIsDeleting(false)
    }
  }

  function isProtectedAccount(targetUser) {
    const isAdminAccount = targetUser.role?.name === 'Admin'
    const isSelf = targetUser._id === currentUser?.id
    return { isAdminAccount, isSelf, isLocked: isAdminAccount || isSelf }
  }

  const showActionsColumn = canEdit || canDelete

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage user accounts, role assignments, and account status.
          </p>
        </div>

        {canCreate && (
          <button
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            onClick={openCreateModal}
            type="button"
          >
            + Create User
          </button>
        )}
      </div>

      {feedback.message && (
        <Alert
          message={feedback.message}
          onClose={() => setFeedback({ type: '', message: '' })}
          type={feedback.type}
        />
      )}

      <div
        className={`rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${
          compact ? 'p-3.5' : 'p-4'
        }`}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <label className="sr-only" htmlFor="user-search">
              Search users by name or email
            </label>
            <input
              className={inputClassName}
              id="user-search"
              onChange={handleSearchChange}
              placeholder="Search by name or email..."
              type="search"
              value={searchInput}
            />
          </div>

          <div className="sm:col-span-4">
            <label className="sr-only" htmlFor="user-role-filter">
              Filter by role
            </label>
            <select
              className={inputClassName}
              id="user-role-filter"
              onChange={handleRoleFilterChange}
              value={roleFilter}
            >
              <option value="">All Roles</option>
              {roleFilters.map((roleOption) => (
                <option key={roleOption._id} value={roleOption._id}>
                  {roleOption.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              disabled={!searchInput && !roleFilter}
              onClick={handleResetFilters}
              type="button"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <Loader label="Loading users..." />
        ) : users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-base font-medium text-slate-800 dark:text-slate-200">
              No users match your criteria
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {searchInput || roleFilter
                ? 'Try clearing or adjusting your search and role filters.'
                : 'No users have been added yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Created
                  </th>
                  {showActionsColumn && (
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {users.map((item) => {
                  const { isAdminAccount, isSelf, isLocked } =
                    isProtectedAccount(item)
                  const cellPadding = compact ? 'px-4 py-2.5' : 'px-4 py-3.5'

                  return (
                    <tr
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                      key={item._id}
                    >
                      <td
                        className={`${cellPadding} font-medium text-slate-900 dark:text-white`}
                      >
                        {item.name}
                        {isSelf && (
                          <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            You
                          </span>
                        )}
                      </td>
                      <td
                        className={`${cellPadding} text-slate-600 dark:text-slate-300`}
                      >
                        {item.email}
                      </td>
                      <td className={cellPadding}>
                        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                          {item.role?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className={cellPadding}>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td
                        className={`${cellPadding} text-slate-500 dark:text-slate-400`}
                      >
                        {formatDate(item.createdAt)}
                      </td>
                      {showActionsColumn && (
                        <td className={`${cellPadding} text-right`}>
                          {isLocked ? (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {isAdminAccount ? 'Protected Admin' : 'Current User'}
                            </span>
                          ) : (
                            <div className="inline-flex flex-wrap justify-end gap-2">
                              {canEdit && (
                                <>
                                  <button
                                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                    onClick={() => openEditModal(item)}
                                    type="button"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50 ${
                                      item.isActive
                                        ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/60'
                                        : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60'
                                    }`}
                                    disabled={statusLoadingId === item._id}
                                    onClick={() => handleToggleStatus(item)}
                                    type="button"
                                  >
                                    {statusLoadingId === item._id
                                      ? 'Saving...'
                                      : item.isActive
                                        ? 'Deactivate'
                                        : 'Activate'}
                                  </button>
                                </>
                              )}
                              {canDelete && (
                                <button
                                  className="rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60"
                                  onClick={() => setDeletingUser(item)}
                                  type="button"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={pagination.currentPage}
          disabled={isLoading}
          itemLabel="users"
          limit={pagination.limit}
          onPageChange={handlePageChange}
          totalItems={pagination.totalUsers}
          totalPages={pagination.totalPages}
        />
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => !isCreating && setIsCreateOpen(false)}
        title="Create New User"
      >
        <form className="space-y-4" noValidate onSubmit={handleCreateSubmit}>
          {createError && (
            <Alert
              message={createError}
              onClose={() => setCreateError('')}
              type="error"
            />
          )}

          <div>
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="create-user-name"
            >
              Full Name
            </label>
            <input
              className={`mt-1.5 ${inputClassName}`}
              id="create-user-name"
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Jane Doe"
              required
              type="text"
              value={createForm.name}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="create-user-email"
            >
              Email Address
            </label>
            <input
              className={`mt-1.5 ${inputClassName}`}
              id="create-user-email"
              onChange={(event) =>
                setCreateForm((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
              placeholder="jane@company.com"
              required
              type="email"
              value={createForm.email}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="create-user-password"
            >
              Password (minimum 8 characters)
            </label>
            <div className="relative mt-1.5">
              <input
                className={`${inputClassName} pr-16`}
                id="create-user-password"
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="Enter password"
                required
                type={showCreatePassword ? 'text' : 'password'}
                value={createForm.password}
              />
              <button
                className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                onClick={() => setShowCreatePassword((prev) => !prev)}
                type="button"
              >
                {showCreatePassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="create-user-role"
            >
              Assign Role
            </label>
            <select
              className={`mt-1.5 ${inputClassName}`}
              id="create-user-role"
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, role: event.target.value }))
              }
              required
              value={createForm.role}
            >
              <option value="">Select a role</option>
              {assignableRoles.map((roleOption) => (
                <option key={roleOption._id} value={roleOption._id}>
                  {roleOption.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              disabled={isCreating}
              onClick={() => setIsCreateOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              disabled={isCreating}
              type="submit"
            >
              {isCreating ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => !isUpdating && setEditingUser(null)}
        title="Edit User"
      >
        <form className="space-y-4" noValidate onSubmit={handleEditSubmit}>
          {editError && (
            <Alert
              message={editError}
              onClose={() => setEditError('')}
              type="error"
            />
          )}

          <div>
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="edit-user-name"
            >
              Full Name
            </label>
            <input
              className={`mt-1.5 ${inputClassName}`}
              id="edit-user-name"
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
              type="text"
              value={editForm.name}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="edit-user-email"
            >
              Email Address
            </label>
            <input
              className={`mt-1.5 ${inputClassName}`}
              id="edit-user-email"
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, email: event.target.value }))
              }
              required
              type="email"
              value={editForm.email}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="edit-user-password"
            >
              New Password (optional — leave blank to keep current)
            </label>
            <div className="relative mt-1.5">
              <input
                autoComplete="new-password"
                className={`${inputClassName} pr-16`}
                id="edit-user-password"
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="Minimum 8 characters"
                type={showEditPassword ? 'text' : 'password'}
                value={editForm.password}
              />
              <button
                className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                onClick={() => setShowEditPassword((prev) => !prev)}
                type="button"
              >
                {showEditPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="edit-user-role"
            >
              Assigned Role
            </label>
            <select
              className={`mt-1.5 ${inputClassName}`}
              id="edit-user-role"
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, role: event.target.value }))
              }
              required
              value={editForm.role}
            >
              <option value="">Select a role</option>
              {assignableRoles.map((roleOption) => (
                <option key={roleOption._id} value={roleOption._id}>
                  {roleOption.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              disabled={isUpdating}
              onClick={() => setEditingUser(null)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              disabled={isUpdating}
              type="submit"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        confirmLabel="Delete User"
        isLoading={isDeleting}
        isOpen={Boolean(deletingUser)}
        message={
          deletingUser
            ? `Are you sure you want to delete ${deletingUser.name} (${deletingUser.email})? This action cannot be undone.`
            : ''
        }
        onCancel={() => !isDeleting && setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
      />
    </div>
  )
}
