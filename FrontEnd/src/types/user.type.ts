type Role = 'ADMIN' | 'Quản lý' | 'Người Dùng'

export interface User {
  id: string
  fullName: string
  email: string
  avatarUrl: null
  isActive: boolean
  roles: string[]
  createdAt: string
}
