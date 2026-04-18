// types/qrcode.type.ts

export interface Visitor {
  name: string
  phone: string
  idCard: string
}

export interface historyQrcode {
  id: string
  scan_time: string
  direction: string
  gate: string | null
  result: string
  scanned_by: string
  qr_type: string
  qr_code: string
  valid_to: string
  valid_from: string | null
  visitor_name: string
  visitor_phone: string
  apartment_code: string
  creator_name: string
}

export interface ResultQrcode {
  id: string
  qrCode: string
  status: string
  qrType: 'personal' | 'guest'
  qrImage: string
  hostName: string
  visitorName: string
  visitorPhone: string
  apartmentCode: string
  usedEntries: number
  maxEntries: number
  remainingEntries: number
  validFrom: string
  validTo: string
}
export interface ResultQrcode1 {
  id: string
  qrCode: string
  status: string
  qrType: 'personal' | 'guest'
  qrImage: string
  userName: string
  userPhone: string
  userEmail: string
  apartmentCode: string
  expiresAt: string
}
export type QrScanResult = ResultQrcode | ResultQrcode1
export interface Qrcodes {
  id: string
  hostUserId: string
  hostName: string
  apartmentId: string
  apartmentCode: string
  visitor: Visitor
  qrCode: string
  validFrom: string
  validTo: string
  maxEntries: number
  usedEntries: number
  remainingEntries: number
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED'
  isExpired: boolean
  isRevoked: boolean
  isActive: boolean
  createdAt: string
  qrImage?: string // base64 image
}

export interface GuestQrListResponse {
  total: number
  limit: number
  offset: number
  data: Qrcodes[]
}

export interface BodyCreateQrcode {
  visitorName: string
  visitorPhone: string
  visitorIdCard: string
  apartmentId: number
  validFrom: Date | string
  validTo: Date | string
  maxEntries: number
  status?: 'EXPIRED' | 'ACTIVE' | 'REVOKED'
}

// Type cho response chi tiết QR
export interface GuestQrDetailResponse {
  data: Qrcodes
}
