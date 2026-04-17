import type { Resident, ResidentDetail, UserApartment } from "src/types/resident.type";
import type { SuccessResponseApi } from "src/types/utils.type";
import http from "src/utils/http";

const URL = '/api/residents'

type ResidentListResponse = Omit<SuccessResponseApi<Resident[]>, 'size' | 'totalElements' | 'totalPages' | 'page' | 'pageSize'> & {
  data: Resident[]
  size: number
  totalElements: number
  totalPages: number
  page: number
  pageSize: number
}

type ResidentSingleResponse<T> = Omit<
  SuccessResponseApi<T>,
  'totalElements' | 'totalPages' | 'page' | 'pageSize'
> & {
  data: T
}

export const residentApi = {
  // Lấy danh sách cư dân
  getAllResidents(params?: { page?: number; size?: number; buildingId?: string; status?: string }) {
    return http.get<ResidentListResponse>(URL, { params })
  },

  // Lấy chi tiết cư dân
  getResidentById(id: string) {
    return http.get<ResidentSingleResponse<ResidentDetail>>(`${URL}/${id}`)
  },

  // Thêm cư dân mới
  createResident(data: {
    userId: number
    apartmentId: number
    relationship: string
    moveInDate: string
  }) {
    return http.post<ResidentSingleResponse<{ id: string }>>(URL, data)
  },

  // Cập nhật cư dân
  updateResident(id: string, data: { relationship?: string; status?: string; moveInDate?: string; moveOutDate?: string }) {
    return http.put<ResidentSingleResponse<{ id: string }>>(`${URL}/${id}`, data)
  },

  // Xóa cư dân
  deleteResident(id: string) {
    return http.delete<ResidentSingleResponse<{ id: string }>>(`${URL}/${id}`)
  },

  // Lấy cư dân theo căn hộ
  getResidentsByApartmentId(apartmentId: string) {
    return http.get<ResidentSingleResponse<Resident[]>>(`${URL}/apartments/${apartmentId}`)
  },

  // Lấy căn hộ của user
  getUserApartments(userId: string) {
    return http.get<ResidentSingleResponse<UserApartment[]>>(`${URL}/users/${userId}/apartments`)
  }
}