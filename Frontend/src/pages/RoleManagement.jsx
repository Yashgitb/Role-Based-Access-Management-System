import { useCallback, useEffect, useState } from 'react'
import Alert from '../components/common/Alert.jsx'
import ConfirmModal from '../components/common/ConfirmModal.jsx'
import Loader from '../components/common/Loader.jsx'
import Modal from '../components/common/Modal.jsx'
import PermissionMatrix from '../components/common/PermissionMatrix.jsx'
import { useAuth } from '../context/useAuth.js'
import * as roleService from '../services/roleService.js'
import {
  ACTIONS,
  createEmptyPermissions,
  getErrorMessage,
  MODULE_METADATA,
  MODULES,
  normalizePermissions,
} from '../utils/permissions.js'

const DEFAULT_ROLES = ['Admin', 'Manager', 'Employee']

const ESSENTIAL_ADMIN_CELLS = new Set([
  'roleManagement.view',
  'roleManagement.edit',
  'userManagement.view',
  'userManagement.create',
  'userManagement.edit',
])

const inputClassName =
  'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-950 dark:disabled:bg-slate-800 dark:disabled:text-slate-400'

function summarizeRolePermissions(permissions = {}) {
  const summaries = []
  for (const moduleKey of MODULES) {
    const granted = ACTIONS.filter(
      (action) => permissions?.[moduleKey]?.[action] === true,
    )
    if (granted.length > 0) {
      summaries.push({
        module: MODULE_METADATA[moduleKey].label,
        actions: granted.map(
          (item) => item.charAt(0).toUpperCase() + item.slice(1),
        ),
      })
    }
  }
  return summaries
}

export default function RoleManagement() {
  const { user: currentUser, can, refreshUser, preferences } = useAuth()
  const compact = preferences.compactLayout

  const canCreate = can('roleManagement', 'create')
  const canEdit = can('roleManagement', 'edit')
  const canDelete = can('roleManagement', 'delete')

  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [roleName, setRoleName] = useState('')
  const [rolePermissions, setRolePermissions] = useState(createEmptyPermissions)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [deletingRole, setDeletingRole] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchRoles = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await roleService.getRoles()
      setRoles(data.roles || [])
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Failed to load roles.'),
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    roleService
      .getRoles()
      .then((data) => {
        if (isMounted) {
          setRoles(data.roles || [])
        }
      })
      .catch((error) => {
        if (isMounted) {
          setFeedback({
            type: 'error',
            message: getErrorMessage(error, 'Failed to load roles.'),
          })
        }
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

  function openCreateModal() {
    setEditingRole(null)
    setRoleName('')
    setRolePermissions(createEmptyPermissions())
    setFormError('')
    setIsFormOpen(true)
  }

  function openEditModal(role) {
    setEditingRole(role)
    setRoleName(role.name)
    setRolePermissions(normalizePermissions(role.permissions))
    setFormError('')
    setIsFormOpen(true)
  }

  function handlePermissionChange(moduleKey, actionKey, checked) {
    setRolePermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [actionKey]: checked,
      },
    }))
  }

  function isCellDisabled(moduleKey, actionKey) {
    if (currentUser?.role !== 'Admin' && !can(moduleKey, actionKey)) {
      return true
    }
    if (
      editingRole?.name === 'Admin' &&
      ESSENTIAL_ADMIN_CELLS.has(`${moduleKey}.${actionKey}`)
    ) {
      return true
    }
    return false
  }

  function handleResetModalChanges() {
    if (!editingRole) return
    setRoleName(editingRole.name)
    setRolePermissions(normalizePermissions(editingRole.permissions))
    setFormError('')
  }

  async function handleFormSubmit(event) {
    event.preventDefault()
    setFormError('')

    const trimmedName = roleName.trim()
    if (!trimmedName) {
      setFormError('Role name is required.')
      return
    }

    setIsSaving(true)
    try {
      if (editingRole) {
        const payload = {
          permissions: rolePermissions,
        }
        if (!DEFAULT_ROLES.includes(editingRole.name)) {
          payload.name = trimmedName
        }

        const data = await roleService.updateRole(editingRole._id, payload)
        setIsFormOpen(false)
        setFeedback({
          type: 'success',
          message: data.message || 'Role updated successfully.',
        })
      } else {
        const data = await roleService.createRole({
          name: trimmedName,
          permissions: rolePermissions,
        })
        setIsFormOpen(false)
        setFeedback({
          type: 'success',
          message: data.message || 'Role created successfully.',
        })
      }

      await fetchRoles()
      await refreshUser()
    } catch (error) {
      setFormError(getErrorMessage(error, 'Failed to save role.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingRole) return
    setIsDeleting(true)
    setFeedback({ type: '', message: '' })

    try {
      const data = await roleService.deleteRole(deletingRole._id)
      setDeletingRole(null)
      setFeedback({
        type: 'success',
        message: data.message || 'Role deleted successfully.',
      })
      await fetchRoles()
    } catch (error) {
      setDeletingRole(null)
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Failed to delete role.'),
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create custom roles and dynamically manage module-level permissions.
          </p>
        </div>

        {canCreate && (
          <button
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            onClick={openCreateModal}
            type="button"
          >
            + Create Role
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

      {isLoading ? (
        <Loader label="Loading roles..." />
      ) : roles.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-base font-medium text-slate-800 dark:text-slate-200">
            No roles found
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 ${
            compact ? 'gap-4' : 'gap-5'
          }`}
        >
          {roles.map((role) => {
            const isDefault = DEFAULT_ROLES.includes(role.name)
            const isProtectedAdminRole =
              role.name === 'Admin' && currentUser?.role !== 'Admin'
            const summaries = summarizeRolePermissions(role.permissions)

            return (
              <article
                className={`flex flex-col justify-between rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${
                  compact ? 'p-4' : 'p-5'
                }`}
                key={role._id}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {role.name}
                      </h2>
                      {isDefault && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Default Role
                        </span>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {canEdit && !isProtectedAdminRole && (
                        <button
                          className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          onClick={() => openEditModal(role)}
                          type="button"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && !isDefault && (
                        <button
                          className="rounded-md border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60"
                          onClick={() => setDeletingRole(role)}
                          type="button"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {summaries.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No permissions granted.
                      </p>
                    ) : (
                      summaries.map((item) => (
                        <div
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/50"
                          key={item.module}
                        >
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {item.module}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.actions.map((action) => (
                              <span
                                className="rounded bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300"
                                key={action}
                              >
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        maxWidth="max-w-2xl"
        onClose={() => !isSaving && setIsFormOpen(false)}
        title={editingRole ? `Edit Role: ${editingRole.name}` : 'Create Role'}
      >
        <form className="space-y-4" noValidate onSubmit={handleFormSubmit}>
          {formError && (
            <Alert
              message={formError}
              onClose={() => setFormError('')}
              type="error"
            />
          )}

          <div>
            <label
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="role-name-input"
            >
              Role Name
            </label>
            <input
              className={`mt-1.5 ${inputClassName}`}
              disabled={Boolean(
                editingRole && DEFAULT_ROLES.includes(editingRole.name),
              )}
              id="role-name-input"
              onChange={(event) => setRoleName(event.target.value)}
              placeholder="e.g. Auditor"
              required
              type="text"
              value={roleName}
            />
            {editingRole && DEFAULT_ROLES.includes(editingRole.name) && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Default roles (Admin, Manager, Employee) cannot be renamed.
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Module Permissions
            </p>
            <PermissionMatrix
              isCellDisabled={isCellDisabled}
              onChange={handlePermissionChange}
              permissions={rolePermissions}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            {editingRole && (
              <button
                className="mr-auto rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                disabled={isSaving}
                onClick={handleResetModalChanges}
                type="button"
              >
                Reset Changes
              </button>
            )}
            <button
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              disabled={isSaving}
              onClick={() => setIsFormOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? 'Saving...'
                : editingRole
                  ? 'Save Role'
                  : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        confirmLabel="Delete Role"
        isLoading={isDeleting}
        isOpen={Boolean(deletingRole)}
        message={
          deletingRole
            ? `Are you sure you want to delete the "${deletingRole.name}" role? Roles currently assigned to users cannot be deleted.`
            : ''
        }
        onCancel={() => !isDeleting && setDeletingRole(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Role"
      />
    </div>
  )
}
