import type { MeterReading } from 'src/types/meter-reading.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/meter-readings'

export const meterReadingsApi = {
  getAll(params?: {
    page?: number
    size?: number
    apartmentId?: number
    billingMonth?: number
    billingYear?: number
  }) {
    return http.get<SuccessResponseApi<MeterReading[]>>(URL, { params })
  },
  getById(id: string) {
    return http.get<SuccessResponseApi<MeterReading>>(`${URL}/${id}`)
  },
  getByUserId(
    userId: string,
    params?: {
      page?: number
      size?: number
      meterType?: 'ELECTRIC' | 'WATER' | 'GAS'
      apartmentId?: number
      billingMonth?: number
      billingYear?: number
    }
  ) {
    return http.get<SuccessResponseApi<MeterReading[]>>(`${URL}/user/${userId}`, { params })
  },
  getByUserIdAndMeterId(
    userId: string,
    meterId: string,
    params?: {
      page?: number
      size?: number
      fromMonth?: number
      fromYear?: number
      toMonth?: number
      toYear?: number
    }
  ) {
    return http.get<SuccessResponseApi<MeterReading[]>>(`${URL}/user/${userId}/by-meter/${meterId}`, { params })
  },
  create(payload: Omit<MeterReading, 'id' | 'createdAt' | 'consumption'>) {
    return http.post(URL, payload)
  },
  update(id: string, payload: Partial<Omit<MeterReading, 'id' | 'createdAt' | 'consumption'>>) {
    return http.put(`${URL}/${id}`, payload)
  },
  delete(id: string) {
    return http.delete(`${URL}/${id}`)
  },
  restore(id: string) {
    return http.patch(`${URL}/${id}/restore`)
  },
  suggestPrevious(params: { meterId: number; readingDate: string }) {
    return http.get<SuccessResponseApi<{ previousReading: number | null }>>(`${URL}/suggest-previous`, { params })
  }
}
