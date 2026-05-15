import http from 'src/utils/http'
import type { DashboardStats } from 'src/types/dashboard.type'

// ĐÃ SỬA: Thêm /api vào trước đường dẫn
const URL = '/api/dashboardstaff'

export const dashboardApi = {
  getDashboardStats() {
    return http.get<any>(`${URL}/stats`)
  }
}
