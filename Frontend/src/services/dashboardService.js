import api from './api.js'

export async function getDashboardStats() {
  const { data } = await api.get('/dashboard')
  return data
}

