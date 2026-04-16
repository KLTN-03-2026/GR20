type Role = 'ADMIN' | 'Quản lý' | 'Nhân viên' | 'Bảo vệ' | 'Người Dùng'

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  avatarUrl?: string
  dateOfBirth?: string
  gender?: string
  isActive?: boolean
  roles?: Role[]
  createdAt?: string
  updatedAt?: string
}

export type UserLogin = {
  _id: string
  roles: Role[]
  email: string
  name: string
  phone: string
  createdAt: string
  updatedAt: string
}

export type data = {
  access_token: string
  refresh_token: string
  expires: string
  refresh_expires: string
  user: UserLogin
}

export type Login = {
  data: data
}
