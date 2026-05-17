// src/apis/qr_api/qr.api.ts
import http from 'src/utils/http'
import type { SuccessResponseApi } from 'src/types/utils.type'
import type { GuestQrDetail } from 'src/types/Qr.type'

const URL = '/api/qr'

export const qrApi = {
  scanQr(id: number) {
    return http.get<SuccessResponseApi<GuestQrDetail>>(`${URL}/guest/${id}`)
  },

  createGuestQr(data: CreateGuestQrRequest) {
    return http.post<SuccessResponseApi<GuestQrDetail>>(`${URL}/guest`, data)
  },

  getGuestQrsByHost(userId: string | number) {
    return http.get<SuccessResponseApi<GuestQrDetail[]>>(`${URL}/guest/host/${userId}`)
  },

  getGuestQrById(id: string | number) {
    return http.get<SuccessResponseApi<GuestQrDetail>>(`${URL}/guest/${id}`)
  },

  updateGuestQr(id: string | number, data: UpdateGuestQrRequest) {
    return http.put<SuccessResponseApi<GuestQrDetail>>(`${URL}/guest/${id}`, data)
  },

  deleteGuestQr(id: string | number) {
    return http.delete<SuccessResponseApi<{ id: string }>>(`${URL}/guest/${id}`)
  },

  getGuestQrHistory(userId: string | number) {
    return http.get<SuccessResponseApi<GuestQrDetail[]>>(`${URL}/guest/history/${userId}`)
  },

  getPersonalQr(userId: string | number) {
    return http.get<SuccessResponseApi<GuestQrDetail>>(`${URL}/personal/${userId}`)
  }
}

export interface CreateGuestQrRequest {
  hostUserId: number
  apartmentId: number
  visitorName: string
  visitorPhone: string
  visitorIdCard?: string
  validFrom: string
  validTo: string
  maxEntries: number
}

export interface UpdateGuestQrRequest {
  validFrom?: string
  validTo?: string
  maxEntries?: number
  status?: string
}
