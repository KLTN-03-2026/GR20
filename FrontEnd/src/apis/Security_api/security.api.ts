import type { Resident, ResidentDetail } from 'src/types/resident.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/security/residents'

export const SecurityApi = {
  // Lấy danh sách cư dân
  getResidentList(params?: { page?: number; limit?: number; search?: string }) {
    return http.get<SuccessResponseApi<Resident[]>>(URL, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search || undefined
      }
    })
  },

  // Lấy chi tiết cư dân
  getResidentDetail(id: string) {
    return http.get<SuccessResponseApi<ResidentDetail>>(`${URL}/${id}`)
  }
}
