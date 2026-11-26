export const MODULES = [
  'dashboard',
  'userManagement',
  'roleManagement',
  'reports',
  'settings',
  'myProfile',
]

export const ACTIONS = ['view', 'create', 'edit', 'delete']

export const MODULE_METADATA = {
  dashboard: {
    label: 'Dashboard',
    supportedActions: ['view'],
  },
  userManagement: {
    label: 'User Management',
    supportedActions: ['view', 'create', 'edit', 'delete'],
  },
  roleManagement: {
    label: 'Role Management',
    supportedActions: ['view', 'create', 'edit', 'delete'],
  },
  reports: {
    label: 'Reports',
    supportedActions: ['view', 'create', 'edit', 'delete'],
  },
  settings: {
    label: 'Settings',
    supportedActions: ['view', 'create', 'edit', 'delete'],
  },
  myProfile: {
    label: 'My Profile',
    supportedActions: ['view', 'edit'],
  },
}

export const NAV_ITEMS = [
  { module: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { module: 'userManagement', label: 'User Management', path: '/users' },
  { module: 'roleManagement', label: 'Role Management', path: '/roles' },
  { module: 'reports', label: 'Reports', path: '/reports' },
  { module: 'settings', label: 'Settings', path: '/settings' },
  { module: 'myProfile', label: 'My Profile', path: '/profile' },
]

export function hasPermission(user, module, action = 'view') {
  return user?.permissions?.[module]?.[action] === true
}

export function getFirstAccessibleRoute(user) {
  const firstMatch = NAV_ITEMS.find((item) =>
    hasPermission(user, item.module, 'view'),
  )
  return firstMatch ? firstMatch.path : '/unauthorized'
}

export function createEmptyPermissions() {
  return MODULES.reduce((acc, moduleKey) => {
    acc[moduleKey] = {
      view: false,
      create: false,
      edit: false,
      delete: false,
    }
    return acc
  }, {})
}

export function normalizePermissions(rawPermissions = {}) {
  const normalized = createEmptyPermissions()

  for (const moduleKey of MODULES) {
    const supported = MODULE_METADATA[moduleKey].supportedActions
    for (const actionKey of ACTIONS) {
      normalized[moduleKey][actionKey] =
        supported.includes(actionKey) &&
        rawPermissions?.[moduleKey]?.[actionKey] === true
    }
  }

  return normalized
}

export function isActionSupported(moduleKey, actionKey) {
  return MODULE_METADATA[moduleKey]?.supportedActions.includes(actionKey) ?? false
}

export function getErrorMessage(error, fallback = 'Something went wrong') {
  if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
    return ''
  }
  return error?.response?.data?.message || error?.message || fallback
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

