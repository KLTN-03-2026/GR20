type Role = 'User' | 'Adim'

export interface User {
  id: string
  username: string

  email: string
  phone?: string
  name?: string
  fullName?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'

  avatarUrl?: string
  dateOfBirth?: string

  idCard?: string | null
  address?: string

  roleId?: string
  roleName?: string
  roles: string[]

  isActive?: boolean

  createdAt: string
  updatedAt: string
}
