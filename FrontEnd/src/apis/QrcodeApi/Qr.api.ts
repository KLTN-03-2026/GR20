// apis/QrcodeApi/Qr.api.ts
import http from 'src/utils/http'
import type { SuccessResponseApi } from 'src/types/utils.type'
import type {
  Qrcodes,
  BodyCreateQrcode,
  historyQrcode,
  ResultQrcode,
  ResultQrcode1,
  QrcodeMe
} from 'src/types/qrcode.type'

export const QRCodeApi = {
  // Lấy danh sách guest QR
  getGuestQrList(params?: {
    page?: number
    limit?: number
    onlyValid?: boolean
    search?: string
    fromDate?: string
    toDate?: string
  }) {
    return http.get<SuccessResponseApi<Qrcodes[]>>('api/qr/guest/list', { params })
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
  scanPersonalQr(qrCode: string) {
    return http.get<SuccessResponseApi<ResultQrcode1>>(`api/qr/guest/scan/${qrCode}`)
  },
  scanGuestQr(qrCode: string) {
    return http.get<SuccessResponseApi<ResultQrcode>>(`api/qr/guest/scan/${qrCode}`)
  },
  getGuestQrHistory(params?: {
    page?: number
    limit?: number
    search?: string
    toDate?: string
    fromDate?: string
    result?: string
    qrType?: string
  }) {
    return http.get<SuccessResponseApi<historyQrcode[]>>('api/qr/guest/history', { params })
  },
  getQrcodeMe() {
    return http.get<SuccessResponseApi<QrcodeMe>>('api/qr/personal/me')
  }
}
