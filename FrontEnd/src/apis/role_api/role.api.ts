import type { SuccessResponseApi } from 'src/types/utils.type'
import type { Role, RoleListResponse } from 'src/types/role.type'
import http from 'src/utils/http'

const URL = '/api/roles'

export const roleApi = {
  getAll(params?: {
    page?: number
    size?: number
    search?: string
    includeDeleted?: boolean
    status?: 'active' | 'deleted' | 'all'
  }) {
    return http.get<SuccessResponseApi<Role[]> & RoleListResponse>(URL, { params })
  },
  getById(id: string | number) {
    return http.get<SuccessResponseApi<Role>>(`${URL}/${id}`)
  },
  create(payload: Pick<Role, 'name' | 'description'>) {
    return http.post<SuccessResponseApi<{ id: number }>>(URL, payload)
  },
  update(id: string | number, payload: Partial<Pick<Role, 'name' | 'description'>>) {
    return http.put<SuccessResponseApi<Role>>(`${URL}/${id}`, payload)
  },
  delete(id: string | number) {
    return http.delete<SuccessResponseApi<{ id: number }>>(`${URL}/${id}`)
  }
}
