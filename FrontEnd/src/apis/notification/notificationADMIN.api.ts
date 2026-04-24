import http from '../../utils/http'

export interface INotificationAdmin {
  id: number
  title: string
  content: string
  type: 'NORMAL' | 'EMERGENCY' | 'MAINTENANCE' | 'PAYMENT'
  targetType: 'ALL' | 'BUILDING' | 'FLOOR' | 'INDIVIDUAL'
  targetId?: number | null
  senderId: number
  isBanner: boolean
  createdAt: string
}

export interface CreateNotificationBody {
  title: string
  content: string
  type: string
  targetType: string
  targetId?: number
}

interface SuccessResponse<T> {
  success: boolean
  message?: string
  data: T
}

export const notificationAdminApi = {
  // Lấy lịch sử thông báo đã gửi
  getHistory: () => {
    return http.get<SuccessResponse<INotificationAdmin[]>>('/api/admin/notifications')
  },

  // BQL gửi thông báo mới
  sendNotification: (body: CreateNotificationBody) => {
    return http.post<SuccessResponse<INotificationAdmin>>('/api/admin/notifications', body)
  },

  // Thu hồi thông báo
  recallNotification: (id: number) => {
    return http.delete<SuccessResponse<null>>(`/api/admin/notifications/${id}/recall`)
  }
}
