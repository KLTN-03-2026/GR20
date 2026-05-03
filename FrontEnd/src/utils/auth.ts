import type { User } from 'src/types/user.type'

export const localStorageEventTarget = new EventTarget()

export const setAccessToken = (access_token: string) => {
  localStorage.setItem('access_token', access_token)
}

export const clearLS = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('profile')
  const clearLSEvent = new Event('clearLS')
  localStorageEventTarget.dispatchEvent(clearLSEvent)
}

export const getAccessToken = () => localStorage.getItem('access_token') || ''

export const getProfile = () => {
  const result = localStorage.getItem('profile')
  return result ? JSON.parse(result) : null
}

export const setProfile = (profile: User) => {
  localStorage.setItem('profile', JSON.stringify(profile))
}
