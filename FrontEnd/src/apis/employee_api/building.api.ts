import http from 'src/utils/http'

const apiClient = http

export const buildingApi = {
  // Lấy danh sách tất cả tòa nhà (Sửa lại chuỗi 'api/buildings' nếu backend của bạn đặt tên route khác)
  getAll: async () => (await apiClient.get('api/buildings')).data.data
}
