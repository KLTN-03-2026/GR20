import type { deleteQrcodeId, historyQrcodeAdmin, historyQrcodeAdmin1 } from 'src/types/qrcode.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

export const qrApiAdmin = {
  getAllQrcodd(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    return http.get<SuccessResponseApi<historyQrcodeAdmin[]>>('/api/qr/personal/list', { params })
  },
  getAllHistoryQrcode(params?: {
    page?: number
    limit?: number
    search?: string
    result?: string
    fromDate?: string
    toDate?: string
  }) {
    return http.get<SuccessResponseApi<historyQrcodeAdmin1[]>>('/api/qr/resident/history/all', { params })
  },
  getAllHistoryQrCodeId(
    id: string,
    params?: {
      page?: number
      limit?: number
      search?: string
      result?: string
      fromDate?: string
      toDate?: string
    }
  ) {
    return http.get<SuccessResponseApi<historyQrcodeAdmin1[]>>(`/api/qr/resident/history/${id}`, { params })
  },
  deleteQrcodeAdmin(id: string) {
    return http.delete<SuccessResponseApi<deleteQrcodeId>>(`/api/qr/personal/${id}`)
  },
  updateQrcodeAdmin(id: string, body: { status: string; expiresAt: string }) {
    return http.put<SuccessResponseApi<deleteQrcodeId>>(`/api/qr/personal/${id}`, body)
  },
  postQrcodeAdmin(body: { userId: string; apartmentId: string; expiresAt: string }) {
    return http.post('/api/qr/personal', body)
  }
}
