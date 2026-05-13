// types/dashboard.types.ts

export interface DashboardOverview {
  totalScansToday: number
  successRate: number
  deniedCount: number
  peakHour: string
  peakHourCount: number
}

export interface BuildingDistribution {
  name: string
  percentage: string
}

export interface ChartsData {
  hourlyStats: number[] // Mảng 24 số, mỗi số là số lượt quét trong giờ đó
  buildingDistribution: BuildingDistribution[]
}

export interface TopDeniedQr {
  qr_code: string
  attempt_count: string
  gate: string
  visitor_name: string
}

export interface Anomaly {
  qr_code: string
  scan_count: string
  first_scan: string // ISO date string
  last_scan: string // ISO date string
  visitor_name: string
}

export interface AlertsData {
  topDeniedQr: TopDeniedQr[]
  anomalies: Anomaly[]
}

export interface RecentLog {
  id: string
  time: string // ISO date string
  visitorName: string
  apartmentCode: string
  result: string // 'SUCCESS' | 'DENIED' | 'PIN_FAILED'
  gate: string
  qrType: string // 'guest' | 'personal'
}

export interface DashboardStats {
  activeResidents: number
  personalQrCount: number
  guestQrCount: number
}

export interface DashboardProtectionData {
  overview: DashboardOverview
  charts: ChartsData
  alerts: AlertsData
  recentLogs: RecentLog[]
  stats: DashboardStats
}

export interface DashboardProtectionResponse {
  operationType: 'Success' | 'Error'
  message: string
  code: string
  data: DashboardProtectionData
  timestamp: string
}
