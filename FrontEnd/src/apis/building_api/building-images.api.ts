import type { BuildingImage } from 'src/types/building-image.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = '/api/building-images'

export const buildingImagesApi = {
  getAllByBuildingId(buildingId: string) {
    return http.get<SuccessResponseApi<BuildingImage[]>>(`${URL}/buildings/${buildingId}`)
  },
  createBuildingImage(payload: { buildingId: number; imageUrl: string }) {
    return http.post(URL, payload)
  },
  uploadBuildingImage(payload: { buildingId: number; image: File }) {
    const formData = new FormData()
    formData.append('buildingId', String(payload.buildingId))
    formData.append('image', payload.image)
    return http.post(`${URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  deleteBuildingImage(id: string) {
    return http.delete(`${URL}/${id}`)
  }
}
