import type { ApartmentData } from "src/types/apartment.type";
import type { SuccessResponseApi } from "src/types/utils.type";
import http from "src/utils/http";

const URL = "/api/apartments";

export const apartmentApi = {
  getAllApartment(params?: any) {
    return http.get<SuccessResponseApi<ApartmentData[]>>(`${URL}`, { params });
  },
  getApartmentById(id: number) {
    return http.get(`${URL}/${id}`);
  },
  createApartment(data: any) {
    return http.post(`${URL}`, data);
  },
  updateApartment(id: number, data: any) {
    return http.put(`${URL}/${id}`, data);
  },
  deleteApartment(id: number) {
    return http.delete(`${URL}/${id}`);
  },
};
