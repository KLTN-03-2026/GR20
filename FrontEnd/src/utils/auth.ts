import type { User } from 'src/types/user.type'

export const localStorageEventTarget = new EventTarget()

export const setAccessToken = (access_token: string) => {
  localStorage.setItem('access_token', access_token)
}

export const setRefreshToken = (refresh_token: string) => {
  localStorage.setItem('refresh_token', refresh_token)
}

export const clearLS = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  const clearLSEvent = new Event('clearLS')
  localStorageEventTarget.dispatchEvent(clearLSEvent)
}

export const getAccessToken = () => localStorage.getItem('access_token') || ''
export const getRefeshToken = () => localStorage.getItem('refresh_token') || ''

export const getUser = (): User | null => {
  const result = localStorage.getItem('user')

  // Kiểm tra an toàn trước khi parse
  if (!result || result === 'undefined' || result === 'null') {
    return null
  }

  try {
    return JSON.parse(result)
  } catch (error) {
    // Xóa dữ liệu lỗi
    localStorage.removeItem('user')
    return null
  }
}

export const setUser = (user: User) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user))
  } else {
    localStorage.removeItem('user')
  }
}

// export const getUser = (): User | null => {
//   const result = localStorage.getItem('user')
//   return result ? JSON.parse(result) : null
// }

// export const setUser = (user: User) => {
//   localStorage.setItem('user', JSON.stringify(user))
// }

// import type { User } from 'src/types/user.type'

// export const localStorageEventTarget = new EventTarget()

// export const setAccessToken = (access_token: string) => {
//   localStorage.setItem('access_token', access_token)
// }

// export const setRefreshToken = (refresh_token: string) => {
//   localStorage.setItem('refresh_token', refresh_token)
// }

// export const clearLS = () => {
//   localStorage.removeItem('access_token')
//   localStorage.removeItem('refresh_token') // Sửa chính tả: 'refesh_token' -> 'refresh_token'
//   localStorage.removeItem('user')
//   const clearLSEvent = new Event('clearLS')
//   localStorageEventTarget.dispatchEvent(clearLSEvent)
// }

// export const getAccessToken = () => localStorage.getItem('access_token') || ''
// export const getRefreshToken = () => localStorage.getItem('refresh_token') || '' // Sửa chính tả

// export const getUser = (): User | null => {
//   const result = localStorage.getItem('user')

//   // Kiểm tra an toàn trước khi parse
//   if (!result || result === 'undefined' || result === 'null') {
//     return null
//   }

//   try {
//     return JSON.parse(result)
//   } catch (error) {
//     // console.error('Failed to parse user from localStorage:', error)
//     // Xóa dữ liệu lỗi
//     localStorage.removeItem('user')
//     return null
//   }
// }

// export const setUser = (user: User) => {
//   if (user) {
//     localStorage.setItem('user', JSON.stringify(user))
//   } else {
//     localStorage.removeItem('user')
//   }
// }
