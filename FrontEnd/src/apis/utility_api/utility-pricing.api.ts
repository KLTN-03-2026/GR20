import type { UtilityPricing } from 'src/types/utility-pricing.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/utility-pricing'

export const utilityPricingApi = {
  getAll(params?: {
    page?: number
    size?: number
    meterType?: 'ELECTRIC' | 'WATER' | 'GAS'
    isActive?: boolean
  }) {
    return http.get<SuccessResponseApi<UtilityPricing[]>>(URL, { params })
  },
  getById(id: string) {
    return http.get<SuccessResponseApi<UtilityPricing>>(`${URL}/${id}`)
  },
  getActive() {
    return http.get<SuccessResponseApi<UtilityPricing[]>>(`${URL}/active`)
  },
  getActiveByMeterType(meterType: 'ELECTRIC' | 'WATER' | 'GAS') {
    return http.get<SuccessResponseApi<UtilityPricing>>(`${URL}/active/${meterType}`)
  },
  create(payload: Omit<UtilityPricing, 'id' | 'createdAt'>) {
    return http.post(URL, payload)
  },
  update(id: string, payload: Partial<Omit<UtilityPricing, 'id' | 'createdAt'>>) {
    return http.put(`${URL}/${id}`, payload)
  },
  delete(id: string) {
    return http.delete(`${URL}/${id}`)
  },
  restore(id: string) {
    return http.patch(`${URL}/${id}/restore`)
  }
}
