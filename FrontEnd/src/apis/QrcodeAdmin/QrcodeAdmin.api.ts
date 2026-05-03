import type {
  deleteQrcodeId,
  historyListQrGuest,
  historyQrcodeAdmin,
  historyQrcodeAdmin1,
  historyQrcodeAdmin2,
  ListGuestQr,
  ListQRGuest,
  postQrGuest
} from 'src/types/qrcode.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

export const qrApiAdmin = {
  getAllQrcode(params?: { page?: number; limit?: number; search?: string; status?: string; hasQrOnly?: boolean }) {
    return http.get<SuccessResponseApi<historyQrcodeAdmin[]>>('/api/qr/admin/personal/list', { params })
  },
  getAllHistoryQrcode(params?: {
    page?: number
    limit?: number
    search?: string
    result?: string
    fromDate?: string
    toDate?: string
  }) {
    return http.get<SuccessResponseApi<historyQrcodeAdmin2[]>>('/api/qr/admin/history/all', { params })
  },
  getHistoryQrcodeByUserId(
    userId: string,
    params?: {
      page?: number
      limit?: number
      search?: string
      result?: string
      fromDate?: string
      toDate?: string
    }
  ) {
    return http.get<SuccessResponseApi<historyQrcodeAdmin1[]>>(`/api/qr/admin/history/${userId}`, { params })
  },
  deleteQrcodeAdmin(id: string) {
    return http.delete<SuccessResponseApi<deleteQrcodeId>>(`/api/qr/admin/personal/${id}`)
  },
  updateQrcodeAdmin(id: string, body: { status: string; expiresAt: string; apartmentId?: string }) {
    return http.put<SuccessResponseApi<deleteQrcodeId>>(`/api/qr/admin/personal/${id}`, body)
  },
  postQrcodeAdmin(body: { userId: string; apartmentId?: string; expiresAt?: string }) {
    return http.post('/api/qr/admin/personal', body)
  },
  //qr guest admin
  getAllResidents(params?: {
    page?: number
    limit?: number
    search?: string
    hasQrOnly?: boolean
    noQrOnly?: boolean
  }) {
    return http.get<SuccessResponseApi<ListGuestQr[]>>('/api/qr/admin/guest/list', { params })
  },
  getDetailQrGuest(id: string) {
    return http.get<SuccessResponseApi<ListQRGuest>>(`/api/qr/admin/guest/${id}`)
  },
  PostQrGuest(body: { hostUserId: string; apartmentId: string; validTo: string }) {
    return http.post<SuccessResponseApi<postQrGuest>>(`/api/qr/admin/guest`, body)
  },
  PutQrQuest(body: { validTo: string; status: string }, id: string) {
    return http.put<SuccessResponseApi<ListQRGuest>>(`api/qr/admin/guest/${id}`, body)
  },
  DeleteQrGuest(id: string) {
    return http.delete<SuccessResponseApi<postQrGuest>>(`api/qr/admin/guest/${id}`)
  },
  getHistoryListGuest(
    id: string,
    params?: { page?: number; limit?: number; search?: string; fromDate?: string; toDate?: string }
  ) {
    return http.get<SuccessResponseApi<historyListQrGuest[]>>(`/api/qr/admin/guest/${id}/history`, { params })
  }
}
