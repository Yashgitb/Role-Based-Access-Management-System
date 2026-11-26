import api from './api.js'

export async function getProfile() {
  const { data } = await api.get('/profile')
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.put('/profile', payload)
  return data
}

export async function changePassword(payload) {
  const { data } = await api.put('/profile/password', payload)
  return data
}

