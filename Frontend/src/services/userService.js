import api from './api.js'

export async function getUsers({ page = 1, search = '', role = '' } = {}, signal) {
  const params = { page }
  if (search.trim()) params.search = search.trim()
  if (role) params.role = role

  const { data } = await api.get('/users', { params, signal })
  return data
}

export async function getUserById(id) {
  const { data } = await api.get(`/users/${id}`)
  return data
}

export async function createUser(payload) {
  const { data } = await api.post('/users', payload)
  return data
}

export async function updateUser(id, payload) {
  const { data } = await api.put(`/users/${id}`, payload)
  return data
}

export async function updateUserStatus(id, isActive) {
  const { data } = await api.patch(`/users/${id}/status`, { isActive })
  return data
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/users/${id}`)
  return data
}

export async function getAvailableRoles() {
  const { data } = await api.get('/users/available-roles')
  return data
}

export async function getRoleFilters() {
  const { data } = await api.get('/users/role-filters')
  return data
}

