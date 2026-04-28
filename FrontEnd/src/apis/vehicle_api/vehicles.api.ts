import type { Vehicle, VehicleStatus } from 'src/types/vehicle.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/vehicles'

export const vehiclesApi = {
  getAll(params?: {
    page?: number
    size?: number
    search?: string
    status?: VehicleStatus
    ownerId?: number
    apartmentId?: number
  }) {
    return http.get<SuccessResponseApi<Vehicle[]>>(URL, { params })
  },
  getById(id: string | number) {
    return http.get<SuccessResponseApi<Vehicle>>(`${URL}/${id}`)
  },
  create(payload: Partial<Vehicle> & { plateNumber: string; vehicleType: Vehicle['vehicleType'] }) {
    return http.post<SuccessResponseApi<Vehicle>>(URL, payload)
  },
  update(id: string | number, payload: Partial<Vehicle>) {
    return http.put<SuccessResponseApi<Vehicle>>(`${URL}/${id}`, payload)
  },
  delete(id: string | number) {
    return http.delete<SuccessResponseApi<{ id: number }>>(`${URL}/${id}`)
  }
}
