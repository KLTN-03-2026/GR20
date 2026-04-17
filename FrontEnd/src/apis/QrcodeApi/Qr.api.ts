// apis/QrcodeApi/Qr.api.ts
import http from 'src/utils/http'
import type { SuccessResponseApi } from 'src/types/utils.type'
import type { Qrcodes, GuestQrListResponse, BodyCreateQrcode, historyQrcode } from 'src/types/qrcode.type'

export const QRCodeApi = {
  // Lấy danh sách guest QR
  getGuestQrList(params?: { limit?: number; offset?: number; onlyValid?: boolean }) {
    return http.get<SuccessResponseApi<GuestQrListResponse>>('api/qr/guest/list', { params })
  },
  updateGuestQr(id: string, body: BodyCreateQrcode) {
    return http.put<SuccessResponseApi<Qrcodes>>(`api/qr/guest/${id}`, body)
  },
  // Tạo guest QR
  createGuestQr(body: BodyCreateQrcode) {
    return http.post<SuccessResponseApi<Qrcodes>>('api/qr/guest', body)
  },

  // Thu hồi guest QR
  deleteGuestQr(id: string) {
    return http.delete(`api/qr/guest/${id}`)
  },

  // Lấy chi tiết guest QR
  getGuestQrDetail(id: string) {
    return http.get<SuccessResponseApi<Qrcodes>>(`api/qr/guest/${id}`)
  },
  scanQr(qrCode: string) {
    return http.get<SuccessResponseApi<Qrcodes>>(`api/qr/guest/scan/${qrCode}`)
  },
  getGuestQrHistory() {
    return http.get<SuccessResponseApi<historyQrcode[]>>('api/qr/guest/history')
  }
}
