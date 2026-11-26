import api from './api.js'

export async function getReports(role = '') {
  const params = role ? { role } : {}
  const { data } = await api.get('/reports', { params })
  return data
}

export async function getRoleReports(role = '') {
  const params = role ? { role } : {}
  const { data } = await api.get('/reports/roles', { params })
  return data
}

