// src/api/apartment_api/apartment_api.ts

import type { ApartmentData } from 'src/types/apartment.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/apartments'

export const apartmentApi = {
  // GET ALL
  getAllApartment(params?: any) {
    return http.get<SuccessResponseApi<ApartmentData[]>>(`${URL}`, { params })
  },

  // GET BY ID
  getApartmentById(id: number) {
    console.log('📡 Calling API:', `${URL}/${id}`)
    return http.get(`${URL}/${id}`).then(res => {
      console.log('📡 Response:', res)
      return res
    })
  },

  // CREATE
  createApartment(data: any) {
    return http.post(`${URL}`, data)
  },

  // UPDATE
  updateApartment(id: number, data: any) {
    return http.put(`${URL}/${id}`, data)
  },

  // DELETE
  deleteApartment(id: number) {
    return http.delete(`${URL}/${id}`)
  },
}