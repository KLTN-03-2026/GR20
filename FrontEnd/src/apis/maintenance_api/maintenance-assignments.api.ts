import type { MaintenanceAssignment } from 'src/types/maintenance.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/maintenance-assignments'

export const maintenanceAssignmentsApi = {
  getAll(params?: { page?: number; size?: number; requestId?: number; technicalId?: number }) {
    return http.get<SuccessResponseApi<MaintenanceAssignment[]>>(URL, { params })
  },
  create(payload: { requestId: number; technicalId: number }) {
    return http.post<SuccessResponseApi<MaintenanceAssignment>>(URL, payload)
  },
  delete(id: string | number) {
    return http.delete<SuccessResponseApi<{ id: number }>>(`${URL}/${id}`)
  }
}

