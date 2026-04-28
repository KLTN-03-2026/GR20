import type { Floor } from 'src/types/floor.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/floors'

export const floorsApi = {
  getAll(params?: {
    page?: number
    size?: number
    search?: string
    buildingId?: number
    includeDeleted?: boolean
    status?: 'active' | 'deleted' | 'all' | 'ACTIVE' | 'DELETED' | 'ALL'
  }) {
    const normalizedStatus = params?.status ? String(params.status).toLowerCase() : undefined
    const safeParams = {
      page: params?.page ?? 0,
      // Backend validators in some environments still cap at 100.
      size: Math.min(Math.max(Number(params?.size ?? 10), 1), 100),
      search: params?.search || undefined,
      buildingId: params?.buildingId,
      includeDeleted: params?.includeDeleted,
      status:
        normalizedStatus === 'active' || normalizedStatus === 'deleted' || normalizedStatus === 'all'
          ? (normalizedStatus as 'active' | 'deleted' | 'all')
          : undefined
    }
    return http.get<SuccessResponseApi<Floor[]>>(URL, { params: safeParams })
  },
  getById(id: string | number) {
    return http.get<SuccessResponseApi<Floor>>(`${URL}/${id}`)
  },
  create(payload: { building_id: number; floor_number: number; name?: string | null }) {
    return http.post<SuccessResponseApi<{ id: number }>>(URL, payload)
  },
  update(id: string | number, payload: Partial<{ building_id: number; floor_number: number; name?: string | null }>) {
    return http.put<SuccessResponseApi<Floor>>(`${URL}/${id}`, payload)
  },
  delete(id: string | number) {
    return http.delete<SuccessResponseApi<{ id: number }>>(`${URL}/${id}`)
  }
}

