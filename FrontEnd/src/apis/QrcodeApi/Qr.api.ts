import http from 'src/utils/http'
import type { SuccessResponseApi } from 'src/types/utils.type'
import type {
  Qrcodes,
  BodyCreateQrcode,
  historyQrcode,
  ResultQrcode,
  ResultQrcode1,
  QrcodeMe,
  QRGuestList,
  QRGuestDetail,
  historyQrGuestId,
  HistoryMe
} from 'src/types/qrcode.type'

export type Status = {
  body: 'ACTIVE' | 'REVOKED'
}

export const QRCodeApi = {
  // ==================== GUEST QR (Cư dân) ====================

  getGuestQrList(params?: {
    page?: number
    limit?: number
    onlyValid?: boolean
    search?: string
    fromDate?: string
    toDate?: string
  }) {
    return http.get<SuccessResponseApi<Qrcodes[]>>('api/qr/resident/guest/list', { params })
  },

  updateGuestQr(id: string, body: BodyCreateQrcode) {
    return http.put<SuccessResponseApi<Qrcodes>>(`api/qr/resident/guest/${id}`, body)
  },

  createGuestQr(body: BodyCreateQrcode) {
    return http.post<SuccessResponseApi<Qrcodes>>('api/qr/resident/guest', body)
  },

  deleteGuestQr(id: string) {
    return http.delete(`api/qr/resident/guest/${id}`)
  },

  getGuestQrDetail(id: string) {
    return http.get<SuccessResponseApi<Qrcodes>>(`api/qr/resident/guest/${id}`)
  },

  // ==================== PERSONAL QR (Cư dân) ====================

  getQrcodeMe() {
    return http.get<SuccessResponseApi<QrcodeMe>>('api/qr/resident/me')
  },
  getHistoryMe() {
    return http.get<SuccessResponseApi<HistoryMe[]>>('api/qr/resident/history/me')
  },

  getQrGuesrList() {
    return http.get<SuccessResponseApi<QRGuestList[]>>('/api/qr/resident/guest-qrs')
  },

  getDetailQrList(id: string) {
    return http.get<SuccessResponseApi<QRGuestDetail>>(`/api/qr/resident/guest-qrs/${id}`)
  },
  PutStatus(id: string, status: 'ACTIVE' | 'REVOKED') {
    return http.put<SuccessResponseApi<QRGuestDetail>>(`/api/qr/resident/guest-qrs/${id}/status`, { status })
  },
  putBodyQRGuest(
    id: string,
    body: {
      valid_to: string
      max_entries: number
      visitor_name: string
      visitor_phone: string
      visitor_id_card: string
    }
  ) {
    return http.put<SuccessResponseApi<QRGuestDetail>>(`/api/qr/resident/guest-qrs/${id}/valid-to`, body)
  },
  // putBodyQRGuest(
  //   id: string,
  //   body: {
  //     valid_to?: string
  //     max_entries?: number
  //     visitor_name?: string
  //     visitor_phone?: string
  //     visitor_id_card?: string
  //   }
  // ) {
  //   return http.put<SuccessResponseApi<QRGuestDetail>>(`/api/qr/resident/guest-qrs/${id}/status`, body)
  // },
  getHistoryQrKhachId(id: string) {
    return http.get<SuccessResponseApi<historyQrGuestId[]>>(`api/qr/resident/guest-qrs/${id}/history`)
  },

  // ==================== GUARD (Bảo vệ) ====================

  scanGuestQr(
    qrCode: string,
    params?: {
      direction?: string
      gate?: string
      building_id?: number
    }
  ) {
    return http.get<SuccessResponseApi<ResultQrcode>>(`api/qr/guard/scan/${qrCode}`, { params })
  },

  scanPersonalQr(
    qrCode: string,
    params?: {
      direction?: string
      gate?: string
      building_id?: number
    }
  ) {
    return http.get<SuccessResponseApi<ResultQrcode1>>(`api/qr/guard/scan/${qrCode}`, { params })
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
    return http.get<SuccessResponseApi<historyQrcode[]>>('api/qr/guard/history', { params })
  }
}
