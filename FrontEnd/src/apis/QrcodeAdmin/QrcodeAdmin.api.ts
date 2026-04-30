// import type { deleteQrcodeId, historyQrcodeAdmin, historyQrcodeAdmin1 } from 'src/types/qrcode.type'
// import type { SuccessResponseApi } from 'src/types/utils.type'
// import http from 'src/utils/http'

// export const qrApiAdmin = {
//   getAllQrcodd(params?: { page?: number; limit?: number; search?: string; status?: string }) {
//     return http.get<SuccessResponseApi<historyQrcodeAdmin[]>>('api/qr/admin/personal/list', { params })
//   },
//   getAllHistoryQrcode(params?: {
//     page?: number
//     limit?: number
//     search?: string
//     result?: string
//     fromDate?: string
//     toDate?: string
//   }) {
//     return http.get<SuccessResponseApi<historyQrcodeAdmin1[]>>('/api/qr/resident/history/all', { params })
//   },
//   getAllHistoryQrCodeId(
//     id: string,
//     params?: {
//       page?: number
//       limit?: number
//       search?: string
//       result?: string
//       fromDate?: string
//       toDate?: string
//     }
//   ) {
//     return http.get<SuccessResponseApi<historyQrcodeAdmin1[]>>(`/api/qr/admin/history/all/${id}`, { params })
//   },
//   deleteQrcodeAdmin(id: string) {
//     return http.delete<SuccessResponseApi<deleteQrcodeId>>(`/api/qr/personal/${id}`)
//   },
//   updateQrcodeAdmin(id: string, body: { status: string; expiresAt: string }) {
//     return http.put<SuccessResponseApi<deleteQrcodeId>>(`/api/qr/personal/${id}`, body)
//   },
//   postQrcodeAdmin(body: { userId: string; apartmentId: string; expiresAt: string }) {
//     return http.post('/api/qr/personal', body)
//   }
// }

import type { deleteQrcodeId, historyQrcodeAdmin, historyQrcodeAdmin1 } from 'src/types/qrcode.type'
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
    return http.get<SuccessResponseApi<historyQrcodeAdmin1[]>>('/api/qr/admin/history/all', { params })
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
  }
}
