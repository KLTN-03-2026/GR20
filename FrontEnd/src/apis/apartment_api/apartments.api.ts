import type { SuccessResponseApi } from 'src/types/utils.type'
import type { Apartment, ApartmentStatus } from 'src/types/apartment.type'
import http from 'src/utils/http'

export type ApartmentOption = {
  id: number
  ownerUserId?: number | null
  apartmentCode?: string
}

export const apartmentsApi = {
  getAll(params?: {
    page?: number
    size?: number
    search?: string
    buildingId?: number
    floorId?: number
    status?: ApartmentStatus | 'all' | 'ALL'
  }) {
    const toPositiveInt = (value: unknown) => {
      const n = Number(value)
      return Number.isInteger(n) && n > 0 ? n : undefined
    }

    const normalizedStatus = params?.status ? String(params.status).toUpperCase() : undefined
    const safeParams = {
      page: Math.max(Number(params?.page ?? 0), 0),
      size: Math.min(Math.max(Number(params?.size ?? 10), 1), 100),
      search: params?.search?.trim() || undefined,
      buildingId: toPositiveInt(params?.buildingId),
      floorId: toPositiveInt(params?.floorId),
      status:
        normalizedStatus === 'AVAILABLE' || normalizedStatus === 'OCCUPIED' || normalizedStatus === 'INACTIVE'
          ? (normalizedStatus as ApartmentStatus)
          : undefined
    }
    return http.get<SuccessResponseApi<Apartment[]>>('/api/apartments', { params: safeParams })
  },
  getById(id: string | number) {
    return http.get<SuccessResponseApi<Apartment>>(`/api/apartments/${id}`)
  },
  create(payload: {
    buildingId: number
    ownerUserId?: number
    floorId: number
    apartmentCode: string
    area: number
    bedrooms: number
    bathrooms: number
    balconyDirection?: string
    status?: ApartmentStatus
  }) {
    return http.post<SuccessResponseApi<{ id: number }>>('/api/apartments', payload)
  },
  update(
    id: string | number,
    payload: Partial<{
      buildingId: number
      ownerUserId?: number
      floorId: number
      apartmentCode: string
      area: number
      bedrooms: number
      bathrooms: number
      balconyDirection?: string
      status?: ApartmentStatus
    }>
  ) {
    return http.put<SuccessResponseApi<Apartment>>(`/api/apartments/${id}`, payload)
  },
  delete(id: string | number) {
    return http.delete<SuccessResponseApi<{ id: number }>>(`/api/apartments/${id}`)
  }
}
