/** Nhãn tiếng Việt cho loại đồng hồ / công tơ (giá trị API: ELECTRIC | WATER | GAS). */
export function meterTypeVi(t?: string | null) {
  const x = String(t || '').toUpperCase()
  if (x === 'ELECTRIC') return 'Điện'
  if (x === 'WATER') return 'Nước'
  if (x === 'GAS') return 'Gas'
  return t ? String(t) : '—'
}

/** Trạng thái đồng hồ (ACTIVE | INACTIVE | BROKEN). */
export function meterStatusVi(s?: string | null) {
  const x = String(s || '').toUpperCase()
  if (x === 'ACTIVE') return 'Đang hoạt động'
  if (x === 'INACTIVE') return 'Ngừng hoạt động'
  if (x === 'BROKEN') return 'Hỏng'
  return s ? String(s) : '—'
}

/** Trạng thái bản giá (isActive). */
export function pricingActiveVi(isActive?: boolean | null) {
  if (isActive === true) return 'Đang áp dụng'
  if (isActive === false) return 'Ngừng áp dụng'
  return '—'
}

export const METER_TYPE_OPTIONS = [
  { value: 'ELECTRIC', label: 'Điện' },
  { value: 'WATER', label: 'Nước' },
  { value: 'GAS', label: 'Gas' }
] as const

export const METER_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động (dữ liệu cũ)' },
  { value: 'BROKEN', label: 'Hỏng' }
] as const

export const PRICING_UNIT_OPTIONS = [
  { value: 'kWh', label: 'kWh (điện)' },
  { value: 'm3', label: 'm³ (nước)' },
  { value: 'kg', label: 'kg (gas)' }
] as const
