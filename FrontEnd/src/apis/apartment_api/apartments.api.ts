import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

export type ApartmentOption = {
  id: number
  ownerUserId?: number | null
  apartmentCode?: string
}

export const apartmentsApi = {
  getAll(params?: { page?: number; size?: number; search?: string; buildingId?: number; floorId?: number }) {
    return http.get<SuccessResponseApi<ApartmentOption[]>>('/api/apartments', { params })
  }
}
