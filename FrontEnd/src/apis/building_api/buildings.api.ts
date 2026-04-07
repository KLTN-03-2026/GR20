import type { Buildings } from 'src/types/buildings.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/buildings'

export const buildingApi = {
  getAllBuildings() {
    return http.get<SuccessResponseApi<Buildings[]>>(URL)
  }
}
