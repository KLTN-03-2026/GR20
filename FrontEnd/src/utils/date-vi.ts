const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }

/**
 * Hiển thị ngày theo locale Việt Nam (thường dd/MM/yyyy).
 * Chuỗi chỉ ngày `YYYY-MM-DD` được parse theo lịch local, tránh lệch một ngày do UTC.
 */
export function formatDateViVN(value: unknown): string {
  if (value == null || value === '') return '—'
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '—'
    return value.toLocaleDateString('vi-VN', opts)
  }
  const str = String(value).trim()
  if (!str) return '—'
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})(?:T|\s|$)/.exec(str)
  if (isoDate) {
    const y = Number(isoDate[1])
    const m = Number(isoDate[2])
    const d = Number(isoDate[3])
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
      const local = new Date(y, m - 1, d)
      return local.toLocaleDateString('vi-VN', opts)
    }
  }
  const parsed = new Date(str)
  if (Number.isNaN(parsed.getTime())) return str
  return parsed.toLocaleDateString('vi-VN', opts)
}
