import type { BuildingAssignment } from 'src/types/building-assignment.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/building-assignments'

export const buildingAssignmentsApi = {
  getAll(params?: {
    page?: number
    size?: number
    userId?: number
    buildingId?: number
    role?: string
    isActive?: boolean
    search?: string
  }) {
    return http.get<SuccessResponseApi<BuildingAssignment[]>>(URL, { params })
  },
  create(payload: { userId: number; buildingId: number; role: string }) {
    return http.post(URL, payload)
  },
  update(id: string, payload: Partial<{ userId: number; buildingId: number; role: string; isActive: boolean }>) {
    return http.put(`${URL}/${id}`, payload)
  },
  delete(id: string) {
    return http.delete(`${URL}/${id}`)
  }
}
