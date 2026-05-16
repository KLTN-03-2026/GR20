// apis/dashboard.api.ts
import http from 'src/utils/http'
import type { SuccessResponseApi } from 'src/types/utils.type'
import type { DashboardProtectionData } from 'src/types/TongQuanProtection.type'

export const DashboardApi = {
  // Lấy thống kê dashboard cho bảo vệ
  getStats() {
    return http.get<SuccessResponseApi<DashboardProtectionData>>('/api/dashboard/stats')
  }
}
