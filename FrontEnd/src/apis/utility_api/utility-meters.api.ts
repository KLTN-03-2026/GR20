import type { UtilityMeter } from 'src/types/utility-meter.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/utility-meters'

export const utilityMetersApi = {
  getAll(params?: {
    meterType?: 'ELECTRIC' | 'WATER' | 'GAS'
    apartmentId?: number
    status?: 'ACTIVE' | 'INACTIVE' | 'BROKEN'
    page?: number
    size?: number
  }) {
    return http.get<SuccessResponseApi<UtilityMeter[]>>(URL, { params })
  },
  getById(id: string) {
    return http.get<SuccessResponseApi<UtilityMeter>>(`${URL}/${id}`)
  },
  getByUserId(
    userId: string,
    params?: {
      page?: number
      size?: number
      meterType?: 'ELECTRIC' | 'WATER' | 'GAS'
      status?: 'ACTIVE' | 'INACTIVE' | 'BROKEN'
    }
  ) {
    return http.get<SuccessResponseApi<UtilityMeter[]>>(`${URL}/user/${userId}`, { params })
  },
  getByUserIdAndMeterId(userId: string, meterId: string) {
    return http.get<SuccessResponseApi<UtilityMeter>>(`${URL}/user/${userId}/${meterId}`)
  },
  create(payload: Omit<UtilityMeter, 'id'>) {
    return http.post(URL, payload)
  },
  update(id: string, payload: Partial<Omit<UtilityMeter, 'id'>>) {
    return http.put(`${URL}/${id}`, payload)
  },
  delete(id: string) {
    return http.delete(`${URL}/${id}`)
  },
  restore(id: string) {
    return http.patch(`${URL}/${id}/restore`)
  }
}
