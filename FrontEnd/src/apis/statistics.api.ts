import type { AxiosResponse } from 'axios'
import http from 'src/utils/http'

const URL = '/api/statistics'

export interface StatisticsDashboard {
  year: number
  residents: {
    activeCount: number
    newInYear: number
    newPrevYear: number
    avgPerOccupiedUnit: number
    byMonth: { month: string; count: number }[]
    relationship: { relationship: string; name: string; count: number }[]
  }
  apartments: {
    totalUnits: number
    byStatus: { name: string; key: string; count: number }[]
    byBuilding: {
      buildingId: string
      buildingName: string
      occupied: number
      available: number
      maintenance: number
    }[]
  }
  finance: {
    paidYearVnd: number
    outstandingVnd: number
    paidOnTimePercent: number
    byQuarter: {
      q: string
      collectedVnd: number
      debtVnd: number
      collectedMillions: number
      debtMillions: number
    }[]
    feeStructurePercent: { name: string; percent: number }[]
  }
  maintenance: {
    totalYear: number
    openInProgress: number
    done: number
    byMonth: { month: string; total: number }[]
    byStatus: { status: string; name: string; count: number }[]
  }
}

/** Khớp `statistics.controller.js` → res.json(...) */
export type StatisticsDashboardEnvelope = {
  operationType?: string
  message?: string
  code?: string
  data?: StatisticsDashboard
  timestamp?: string
}

/** Xác định thành công/thất bại theo trường BE trả về (không chỉ HTTP 200). */
export function parseStatisticsDashboardEnvelope(
  payload: unknown
):
  | { ok: true; envelope: StatisticsDashboardEnvelope & { data: StatisticsDashboard } }
  | { ok: false; reason: string; envelope?: StatisticsDashboardEnvelope | null } {
  if (payload == null || typeof payload !== 'object') {
    return { ok: false, reason: 'Phản hồi không phải JSON object', envelope: null }
  }
  const e = payload as StatisticsDashboardEnvelope
  const codeOk = e.code === 'OK'
  const opOk =
    typeof e.operationType === 'string' && e.operationType.toLowerCase().trim() === 'success'
  const hasData = e.data != null && typeof e.data === 'object'

  if (codeOk && opOk && hasData) {
    return { ok: true, envelope: e as StatisticsDashboardEnvelope & { data: StatisticsDashboard } }
  }

  const reason =
    (typeof e.message === 'string' && e.message.trim()) ||
    `Backend không báo thành công (code=${String(e.code)}, operationType=${String(e.operationType)})`

  return { ok: false, reason, envelope: e }
}

export function parseStatisticsDashboardHttpResponse(
  res: AxiosResponse<StatisticsDashboardEnvelope>
) {
  return parseStatisticsDashboardEnvelope(res.data)
}

export interface SystemOverview {
  year: number
  buildingNamesSummary: string
  kpis: {
    buildingCount: number
    apartmentCount: number
    residentCount: number
    occupancyPercent: number
    revenueThisMonthVnd: number
    revenueGrowthPercent: number | null
  }
  revenueByMonth: { month: string; amountVnd: number }[]
  revenueStructure: { name: string; percent: number }[]
  revenueStructureTotalVnd: number
  debtByBuilding: {
    buildingId: string
    buildingName: string
    debtVnd: number
    barPercent: number
  }[]
  alerts: { type: 'error' | 'warning'; title: string; subtitle: string }[]
  aiInsights: string[]
  quickStats: {
    topRevenueBuilding: string
    activeQrCount: number
    activeStaffCount: number
    systemStatus: 'stable' | 'attention'
  }
  recentActivities: {
    category: string
    categoryIcon: string
    categoryTone: string
    detail: string
    value: number | null
    valueFormatted: string | null
    status: string
    statusTone: 'success' | 'warning' | 'error' | 'info'
  }[]
  featuredBuilding: {
    buildingId: string
    buildingName: string
    occupancyPercent: number
    revenueVnd: number
  } | null
}

export type SystemOverviewEnvelope = {
  operationType?: string
  message?: string
  code?: string
  data?: SystemOverview
  timestamp?: string
}

export function parseSystemOverviewEnvelope(payload: unknown):
  | { ok: true; data: SystemOverview }
  | { ok: false; reason: string } {
  if (payload == null || typeof payload !== 'object') {
    return { ok: false, reason: 'Phản hồi không hợp lệ' }
  }
  const e = payload as SystemOverviewEnvelope
  if (e.code === 'OK' && e.data) return { ok: true, data: e.data }
  return { ok: false, reason: e.message || 'Không tải được tổng quan' }
}

export const statisticsApi = {
  getDashboard(year: number) {
    return http.get<StatisticsDashboardEnvelope>(`${URL}/dashboard`, {
      params: { year },
    })
  },
  getSystemOverview(year?: number) {
    return http.get<SystemOverviewEnvelope>(`${URL}/system-overview`, {
      params: year != null ? { year } : undefined,
    })
  },
}
