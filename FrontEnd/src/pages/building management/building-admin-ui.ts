export const buildingStatusLabel: Record<string, string> = {
  ACTIVE: 'Đang hoạt động',
  MAINTENANCE: 'Bảo trì',
  CLOSED: 'Đã đóng'
}

export const buildingStatusBadgeClass = (status: string | undefined) => {
  const s = (status || '').toUpperCase()
  if (s === 'ACTIVE') return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
  if (s === 'MAINTENANCE') return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
  if (s === 'CLOSED') return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
  return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'
}

export function buildingHasLinkedData(b: { linkedFloorCount?: number; linkedApartmentCount?: number }) {
  const f = Number(b.linkedFloorCount ?? 0)
  const a = Number(b.linkedApartmentCount ?? 0)
  return f > 0 || a > 0
}
