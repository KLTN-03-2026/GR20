// type Role = 'ADMIN' | 'Quản lý' | 'Người Dùng'

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  avatarUrl: string
  dateOfBirth: string
  gender: string
  isActive: boolean
  roles: string[]
  createdAt: string
  updatedAt: string
}
