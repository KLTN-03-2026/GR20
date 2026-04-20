// types/qrcode.type.ts

export interface Visitor {
  name: string
  phone: string
  idCard: string
}

export interface QrcodeMe {
  id: string
  user_id: string
  apartment_id: string
  qr_code: string
  expires_at: string
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED'
  created_at: string
  qrImage: string
}

export interface deleteQrcodeId {
  id: string
  user_id: string
  apartment_id: string
  qr_code: string
  expires_at: string
  status: string
  created_at: string
}

export interface historyQrcodeAdmin1 {
  id: string
  scan_time: string
  direction: string
  gate: string
  result: string
  building_id: string
  scanned_by: string
  building_name: string
  scanned_by_name: string
  qr_code: string
  user_id: string
  resident_name: string
  resident_phone: string
  resident_email: string
  apartment_code: string
}

export interface historyQrcodeAdmin {
  user_id: string
  user_name: string
  user_email: string
  user_phone: string
  apartment_id: string
  apartment_code: string
  qr_id: string
  qr_code: string
  qr_status: 'ACTIVE' | 'EXPIRED' | 'REVOKED'
  expires_at: string
  created_at: string
  qr_exists: string
}

const a = {
  user_id: '1',
  user_name: 'Nguyễn Hoàn Bão',
  user_email: 'hoanbao@gmail.com',
  user_phone: '0378686654',
  apartment_id: '2',
  apartment_code: 'AS-201',
  qr_id: null,
  qr_code: null,
  qr_status: null,
  expires_at: null,
  created_at: null,
  qr_exists: 'NO_QR'
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
