import axios from 'axios'

const TOKEN_KEY = 'rbac_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message = error?.response?.data?.message
    const requestUrl = error?.config?.url || ''

    const isLoginRequest = requestUrl.includes('/auth/login')
    const isDeactivatedOrMissingRole =
      status === 403 &&
      (message === 'Your account is deactivated' ||
        message === 'No valid role assigned')

    if (!isLoginRequest && (status === 401 || isDeactivatedOrMissingRole)) {
      if (unauthorizedHandler) {
        unauthorizedHandler(message || 'Your session has expired. Please sign in again.')
      } else {
        setStoredToken(null)
      }
    }

    return Promise.reject(error)
  },
)

export default api

