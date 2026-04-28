export interface UserManagementItem {
  id: number
  username: string
  fullName: string | null
  email: string
  phone: string | null
  avatarUrl: string | null
  dateOfBirth: string | null
  gender: string | null
  idCard: string | null
  isActive: boolean
  roleId: number | null
  roleName: string | null
  createdAt: string
  updatedAt: string
}

export interface UserListResponse {
  data: UserManagementItem[]
  size: number
  totalElements: number
  totalPages: number
  page: number
  pageSize: number
  timestamp: string
}
