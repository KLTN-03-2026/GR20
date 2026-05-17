import type { Buildings } from 'src/types/buildings.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/buildings'

export const buildingApi = {
  getAllBuildings(params?: { page?: number; size?: number; search?: string; status?: string }) {
    const normalizedStatus = params?.status ? String(params.status).toUpperCase() : undefined
    const safeParams = {
      page: Math.max(Number(params?.page ?? 0), 0),
      size: Math.min(Math.max(Number(params?.size ?? 10), 1), 100),
      search: params?.search?.trim() || undefined,
      status:
        normalizedStatus === 'ACTIVE' || normalizedStatus === 'MAINTENANCE' || normalizedStatus === 'CLOSED'
          ? normalizedStatus
          : undefined
    }
    return http.get<SuccessResponseApi<Buildings[]>>(URL, { params: safeParams })
  },
  getBuildingById(id: string) {
    return http.get<SuccessResponseApi<Buildings>>(`${URL}/${id}`)
  },
  createBuilding(payload: Omit<Buildings, 'id' | 'createdAt'>) {
    return http.post(URL, payload)
  },
  updateBuilding(id: string, payload: Partial<Omit<Buildings, 'id' | 'createdAt'>>) {
    return http.put(`${URL}/${id}`, payload)
  },
  deleteBuilding(id: string) {
    return http.delete(`${URL}/${id}`)
  }
}
