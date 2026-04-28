import type { MaintenanceRequest } from 'src/types/maintenance.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/maintenances'

export const maintenanceRequestsApi = {
  getAll(params?: {
    page?: number
    size?: number
    status?: string
    priority?: string
    buildingId?: number
    search?: string
  }) {
    return http.get<SuccessResponseApi<MaintenanceRequest[]>>(URL, { params })
  },
  getById(id: string | number) {
    return http.get<SuccessResponseApi<MaintenanceRequest>>(`${URL}/${id}`)
  },
  create(payload: Partial<MaintenanceRequest> & { title: string }) {
    return http.post<SuccessResponseApi<{ id: number }>>(URL, payload)
  },
  update(id: string | number, payload: Partial<MaintenanceRequest>) {
    return http.put<SuccessResponseApi<MaintenanceRequest>>(`${URL}/${id}`, payload)
  },
  delete(id: string | number) {
    return http.delete<SuccessResponseApi<{ id: number }>>( `${URL}/${id}` )
  },
  updateStatus(id: string | number, status: string) {
    return http.patch<SuccessResponseApi<MaintenanceRequest>>(`${URL}/${id}/status`, { status })
  },
  assign(id: string | number, payload: { technicianId: number; technicianName: string }) {
    return http.patch<SuccessResponseApi<MaintenanceRequest>>(`${URL}/${id}/assign`, payload)
  }
}

