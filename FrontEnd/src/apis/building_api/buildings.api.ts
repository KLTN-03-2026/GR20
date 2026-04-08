import type { Buildings } from 'src/types/buildings.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/buildings'

export const buildingApi = {
  getAllBuildings() {
    return http.get<SuccessResponseApi<Buildings[]>>(URL)
  },
  getBuildingById(id: string) {
    return http.get<SuccessResponseApi<Buildings>>(`${URL}/${id}`)
  },
  createBuilding(payload: Omit<Buildings, 'id' | 'createdAt'>) {
    return http.post(URL, payload)
  },
  updateBuilding(id: string, payload: Partial<Omit<Buildings, 'id' | 'createdAt'>>) {
    return http.put(`${URL}/${id}`, payload)
  },
  deleteBuilding(id: string) {
    return http.delete(`${URL}/${id}`)
  }
}
