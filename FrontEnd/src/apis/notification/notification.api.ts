import http from '../../utils/http'

// 1. Mang định nghĩa INotification
export interface INotification {
  receiverId: number
  notificationId: number
  title: string
  content: string
  type: 'NORMAL' | 'EMERGENCY' | 'MAINTENANCE' | 'PAYMENT'
  isRead: boolean
  readAt: string | null
  createdAt: string
  buildingId?: number | null
  targetType: 'ALL' | 'BUILDING' | 'INDIVIDUAL'
}

// 2. Khuôn mẫu trả về của Backend
interface SuccessResponse<T> {
  success: boolean
  message?: string
  data: T
}

// 3. Các hàm gọi API
export const notificationApi = {
  getMyNotifications: () => {
    return http.get<SuccessResponse<INotification[]>>('/api/notifications/me')
  },

  markAsRead: (id: number) => {
    return http.patch<SuccessResponse<null>>(`/api/notifications/me/${id}/read`)
  },

  deleteNotification: (id: number) => {
    return http.delete<SuccessResponse<null>>(`/api/notifications/me/${id}`)
  }
}
