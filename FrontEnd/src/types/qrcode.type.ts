// types/qrcode.type.ts

export interface Visitor {
  name: string
  phone: string
  idCard: string
}

export interface QRGuestDetail {
  id: string
  qr_code: string
  valid_from: string
  valid_to: string
  max_entries: number
  used_entries: number
  status: string
  created_at: string
  visitor_name: string
  visitor_phone: string
  visitor_id_card: string
  apartment_code: string
  original_valid_to: string
  is_active: boolean
  qr_image: string
  admin_valid_to_original?: string
}
export interface QRGuestList {
  id: string
  qr_code: string
  valid_from: string
  valid_to: string
  max_entries: number
  used_entries: number
  status: string
  created_at: string
  visitor_name: string
  visitor_phone: string
  visitor_id_card: string
  apartment_code: string
}

export interface HistoryMe {
  id: string
  scan_time: string
  direction: string
  result: string
  scanned_by: string
  building_id: string
  scanned_by_name: string
  building_name: string
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

export interface historyQrcodeAdmin2 {
  id: string
  scan_time: string
  direction: string
  gate: string | null
  result: string
  resident_id: string | null
  resident_name: string | null
  resident_email: string | null
  apartment_code: string | null
  qr_code: string | null
  scanned_by_name: string | null
  qr_type?: 'personal' | 'guest' // 👈 Thêm
  visitor_name?: string | null // 👈 Thêm (cho guest QR)
  visitor_phone?: string | null // 👈 Thêm (cho guest QR)
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
  scanned_by_name: string
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

export interface BodyCreateQrcode {
  visitorName: string
  visitorPhone: string
  visitorIdCard: string
  apartmentId?: number
  validFrom: Date | string
  validTo: Date | string
  maxEntries: number
  status?: 'EXPIRED' | 'ACTIVE' | 'REVOKED'
}

// Type cho response chi tiết QR
export interface GuestQrDetailResponse {
  data: Qrcodes
}
export interface ListGuestQr {
  user_id: string
  full_name: string
  email: string
  phone: string
  is_active: boolean
  apartment_id: string
  apartment_code: string
  building_id: string
  building_name: string
  has_guest_qr: boolean
  guest_qr_count: string
  guest_qr_id: string
  guest_qr_status: string
  guest_qr_valid_to: string
  guest_qr_used_entries: number
  guest_qr_max_entries: number
}

export interface ListQRGuest {
  id: string
  host_user_id: string
  apartment_id: string
  qr_code: string
  valid_from: string
  valid_to: string
  max_entries: number
  used_entries: number
  status: string
  created_at: string
  visitor_id: string
  host_name: string
  host_email: string
  host_phone: string
  apartment_code: string
  visitor_name: string
  visitor_phone: string
  visitor_id_card: string
}

export interface historyListQrGuest {
  id: string
  scan_time: string
  direction: string
  gate: string
  result: string
  scanned_by: string
  building_id: string
  scanned_by_name: string
  building_name: string
  qr_code: string
  visitor_name: string
  visitor_phone: string
  visitor_id_card: string
  host_user_id: string
  host_name: string
  apartment_code: string
}

export interface postQrGuest {
  id: string
  host_user_id: string
  apartment_id: string
  qr_code: string
  valid_from: string
  valid_to: string
  max_entries: number
  used_entries: number
  status: string
  created_at: string
  visitor_id: string
  qr_image: string
}

export interface historyQrGuestId {
  id: string
  scan_time: string
  direction: string
  gate: string
  result: string
  scanned_by: string
  scanned_by_name: string
  building_name: string
  qr_code: string
  valid_from: string
  valid_to: string
  max_entries: number
  used_entries: number
  visitor_name: string
  visitor_phone: string
  visitor_id_card: string
  host_name: string
  apartment_code: string
}
