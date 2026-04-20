import type { deleteQrcodeId, historyQrcodeAdmin, historyQrcodeAdmin1 } from 'src/types/qrcode.type'
import type { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

export const qrApiAdmin = {
  getAllQrcodd() {
    return http.get<SuccessResponseApi<historyQrcodeAdmin[]>>('/api/qr/personal/list')
  },
  getAllHistoryQrcode() {
    return http.get<SuccessResponseApi<historyQrcodeAdmin1[]>>('/api/qr/resident/history/all')
  },
  getAllHistoryQrCodeId(id: string) {
    return http.get<SuccessResponseApi<historyQrcodeAdmin1[]>>(`/api/qr/resident/history/${id}`)
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
