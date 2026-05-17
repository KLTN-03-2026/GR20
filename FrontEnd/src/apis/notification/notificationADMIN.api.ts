import http from '../../utils/http'

export interface INotificationAdmin {
  id: number
  title: string
  content: string
  buildingId?: number | null
  senderId: number
  isBanner: boolean
  createdAt: string
  // targetType/targetUserId không lưu trong DB nên chỉ dùng lúc gửi
}

export interface IResident {
  userId: number
  fullName: string
  phone: string
  email: string
}

export interface CreateNotificationBody {
  title: string
  content: string
  targetType: 'ALL' | 'BUILDING' | 'INDIVIDUAL'
  buildingId?: number
  targetUserId?: number
  isBanner?: boolean
}

interface SuccessResponse<T> {
  success: boolean
  message?: string
  data: T
}

export const notificationAdminApi = {
  getHistory: () => http.get<SuccessResponse<INotificationAdmin[]>>('/api/admin/notifications'),

  sendNotification: (body: CreateNotificationBody) =>
    http.post<SuccessResponse<INotificationAdmin>>('/api/admin/notifications', body),

  recallNotification: (id: number) => http.delete<SuccessResponse<null>>(`/api/admin/notifications/${id}/recall`),

  // Lấy cư dân theo tòa nhà, có thể kèm search
  getResidentsByBuilding: (buildingId: number, search = '') =>
    http.get<SuccessResponse<IResident[]>>(`/api/admin/notifications/buildings/${buildingId}/residents`, {
      params: { search }
    })
}
