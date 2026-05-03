export interface Role {
  id: number
  name: string
  description: string | null
  createdAt: string
  deletedAt: string | null
}

export interface RoleListResponse {
  data: Role[]
  size: number
  totalElements: number
  totalPages: number
  page: number
  pageSize: number
  timestamp: string
}
