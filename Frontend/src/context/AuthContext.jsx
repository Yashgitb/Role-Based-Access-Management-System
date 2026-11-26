import { useCallback, useEffect, useState } from 'react'
import {
  getStoredToken,
  setStoredToken,
  setUnauthorizedHandler,
} from '../services/api.js'
import * as authService from '../services/authService.js'
import * as settingsService from '../services/settingsService.js'
import { hasPermission } from '../utils/permissions.js'
import { AuthContext } from './useAuth.js'

const DEFAULT_PREFERENCES = {
  compactLayout: false,
  showWelcomeMessage: true,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(() =>
    Boolean(getStoredToken()),
  )
  const [authNotice, setAuthNotice] = useState('')
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES)

  const syncPreferences = useCallback(async (nextUser) => {
    if (!nextUser || !hasPermission(nextUser, 'settings', 'view')) {
      setPreferences(DEFAULT_PREFERENCES)
      return
    }

    try {
      const data = await settingsService.getSettings()
      if (data?.settings) {
        setPreferences({
          compactLayout: Boolean(data.settings.compactLayout),
          showWelcomeMessage: data.settings.showWelcomeMessage ?? true,
        })
      }
    } catch {
      setPreferences(DEFAULT_PREFERENCES)
    }
  }, [])

  const clearSession = useCallback((notice = '') => {
    setStoredToken(null)
    setUser(null)
    setPreferences(DEFAULT_PREFERENCES)
    setAuthNotice(notice)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler((message) => {
      clearSession(message)
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [clearSession])

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      return undefined
    }

    let isMounted = true

    authService
      .getMe()
      .then(async (data) => {
        if (!isMounted) return
        setUser(data.user)
        setAuthNotice('')
        await syncPreferences(data.user)
      })
      .catch((error) => {
        if (!isMounted) return
        const msg =
          error?.response?.data?.message ||
          'Session expired. Please sign in again.'
        clearSession(msg)
      })
      .finally(() => {
        if (isMounted) {
          setIsInitializing(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [clearSession, syncPreferences])

  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(credentials)
      setStoredToken(data.token)
      setUser(data.user)
      setAuthNotice('')
      await syncPreferences(data.user)
      return data.user
    },
    [syncPreferences],
  )

  const logout = useCallback(async () => {
    try {
      if (getStoredToken()) {
        await authService.logout()
      }
    } catch {
      // Token may already be expired or invalid; clear client state regardless.
    } finally {
      clearSession('')
    }
  }, [clearSession])

  const refreshUser = useCallback(async () => {
    if (!getStoredToken()) return null
    try {
      const data = await authService.getMe()
      setUser(data.user)
      await syncPreferences(data.user)
      return data.user
    } catch {
      return null
    }
  }, [syncPreferences])

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev))
  }, [])

  const updatePreferences = useCallback((nextPrefs) => {
    setPreferences({
      compactLayout: Boolean(nextPrefs.compactLayout),
      showWelcomeMessage: nextPrefs.showWelcomeMessage ?? true,
    })
  }, [])

  const clearAuthNotice = useCallback(() => {
    setAuthNotice('')
  }, [])

  const can = useCallback(
    (module, action = 'view') => hasPermission(user, module, action),
    [user],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isInitializing,
        authNotice,
        clearAuthNotice,
        preferences,
        login,
        logout,
        refreshUser,
        updateUser,
        updatePreferences,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
