// types/qrcode.type.ts

export interface Visitor {
  name: string
  phone: string
  idCard: string
}

export interface historyQrcode {
  id: string
  user_id: string
  building_id: string
  qr_code_id: string
  direction: string
  // gate: any
  scan_time: string
  result: string
  scanned_by: string
  qr_code: string
  valid_from: string
  valid_to: string
  visitor_name: string
  visitor_phone: string
  apartment_code: string
  host_name: string
}

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
