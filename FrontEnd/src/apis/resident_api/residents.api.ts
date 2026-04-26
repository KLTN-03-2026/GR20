import http from 'src/utils/http'
import type { SuccessResponseApi } from 'src/types/utils.type'
import type { Resident, ResidentDetail } from 'src/types/resident.type'

export type UserApartment = {
  apartmentId: number
  apartmentNumber?: string
  buildingName?: string
  relationship?: string
  status?: string
}

const URL = '/api/residents'

type ResidentListResponse = Omit<SuccessResponseApi<Resident[]>, 'totalElements' | 'totalPages' | 'page' | 'pageSize'> & {
  data: Resident[]
  size: number
  totalElements: number
  totalPages: number
  page: number
  pageSize: number
}

type ResidentSingleResponse<T> = Omit<SuccessResponseApi<T>, 'totalElements' | 'totalPages' | 'page' | 'pageSize'> & { data: T }

// Dùng cho trang quản trị cư dân (đã có sẵn trong project)
export const residentApi = {
  getAllResidents(params?: { page?: number; size?: number; buildingId?: string; status?: string }) {
    return http.get<ResidentListResponse>(URL, { params })
  },
  getResidentById(id: string) {
    return http.get<ResidentSingleResponse<ResidentDetail>>(`${URL}/${id}`)
  },
  createResident(data: { userId: number; apartmentId: number; relationship: string; moveInDate: string }) {
    return http.post<ResidentSingleResponse<{ id: string }>>(URL, data)
  },
  updateResident(id: string, data: { relationship?: string; status?: string; moveInDate?: string; moveOutDate?: string }) {
    return http.put<ResidentSingleResponse<{ id: string }>>(`${URL}/${id}`, data)
  },
  deleteResident(id: string) {
    return http.delete<ResidentSingleResponse<{ id: string }>>(`${URL}/${id}`)
  },
  getResidentsByApartmentId(apartmentId: string) {
    return http.get<ResidentSingleResponse<Resident[]>>(`${URL}/apartment/${apartmentId}`)
  },
  getUserApartments(userId: string) {
    return http.get<ResidentSingleResponse<UserApartment[]>>(`${URL}/user/${userId}/apartments`)
  }
}

// Dùng cho luồng user payment (nhẹ hơn)
export const residentsApi = {
  getUserApartments(userId: string | number) {
    return http.get<SuccessResponseApi<UserApartment[]>>(`${URL}/user/${userId}/apartments`)
  }
}