import type { Resident, ResidentDetail } from "src/types/resident.type";
import type { SuccessResponseApi } from "src/types/utils.type";
import http from "src/utils/http";

const URL = '/api/residents'

export const residentApi = {
  // Lấy danh sách cư dân
  getAllResidents(params?: { page?: number; size?: number; buildingId?: string; status?: string }) {
    return http.get<SuccessResponseApi<Resident[]>>(URL, { params })
  },

  // Lấy chi tiết cư dân
  getResidentById(id: string) {
    return http.get<SuccessResponseApi<ResidentDetail>>(`${URL}/${id}`)
  },

  // Thêm cư dân mới
  createResident(data: {
    userId: number
    apartmentId: number
    relationship: string
    moveInDate: string
  }) {
    return http.post<SuccessResponseApi<{ id: string }>>(URL, data)
  },

  // Cập nhật cư dân
  updateResident(id: string, data: { relationship?: string; status?: string }) {
    return http.put<SuccessResponseApi<null>>(`${URL}/${id}`, data)
  },

  // Xóa cư dân
  deleteResident(id: string) {
    return http.delete<SuccessResponseApi<{ id: string }>>(`${URL}/${id}`)
  },

  // Lấy cư dân theo căn hộ
  //getResidentsByApartment(apartmentId: string) {
    //return http.get<SuccessResponseApi<Resident[]>>(`/api/apartments/${apartmentId}/residents`)
  //},

  // Lấy căn hộ của user
  //getUserApartments(userId: string) {
    //return http.get<SuccessResponseApi<any[]>>(`/api/users/${userId}/apartments`)
  //}

}