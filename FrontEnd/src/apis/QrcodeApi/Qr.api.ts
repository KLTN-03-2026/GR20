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
  HistoryMe,
  QrScanResult,
  QRScanResponse,
  VerifyPinResponse
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
  getHistoryMe(params?: {
    page?: number
    limit?: number
    result?: string
    search?: string
    fromDate?: string
    toDate?: string
  }) {
    return http.get<SuccessResponseApi<HistoryMe[]>>('api/qr/resident/history/me', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        result: params?.result || undefined,
        search: params?.search || undefined,
        fromDate: params?.fromDate || undefined,
        toDate: params?.toDate || undefined
      }
    })
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
      pin_code: string
    }
  ) {
    return http.put<SuccessResponseApi<QRGuestDetail>>(`/api/qr/resident/guest-qrs/${id}/valid-to`, body)
  },

  getHistoryQrKhachId(
    id: string,
    params?: {
      page?: number
      limit?: number
      result?: string
      search?: string
      fromDate?: string
      toDate?: string
    }
  ) {
    return http.get<SuccessResponseApi<historyQrGuestId[]>>(`api/qr/resident/guest-qrs/${id}/history`, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        result: params?.result || undefined,
        search: params?.search || undefined,
        fromDate: params?.fromDate || undefined,
        toDate: params?.toDate || undefined
      }
    })
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
    return http.get<SuccessResponseApi<QRScanResponse>>(`api/qr/guard/scan/${qrCode}`, { params })
  },

  scanPersonalQr(
    qrCode: string,
    params?: {
      direction?: string
      gate?: string
      building_id?: number
    }
  ) {
    return http.get<SuccessResponseApi<QRScanResponse>>(`api/qr/guard/scan/${qrCode}`, { params })
  },
  scanVerifyPin(qrCode: string, pinCode: string, options?: any) {
    return http.post<SuccessResponseApi<VerifyPinResponse>>('api/qr/guard/verify-pin', {
      qrCode,
      pinCode,
      scanMetadata: options?.scanMetadata || {
        direction: 'IN',
        gate: 'Cổng chính'
      }
    })
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
  },
  // Gửi yêu cầu reset PIN
  requestPinReset(email: string, qrCode?: string) {
    return http.post('api/pin-reset/request-reset', { email, qrCode })
  },

  // Reset PIN với token
  resetPin(token: string, newPin?: string) {
    return http.post('api/pin-reset/reset', { token, newPin })
  },

  // Gửi lại PIN hiện tại (tùy chọn)
  sendPin(email: string, qrCode?: string) {
    return http.post('api/pin-reset/send-pin', { email, qrCode })
  }
}
