import type { Invoice } from 'src/types/invoice.type'

export { meterTypeVi } from 'src/utils/utility-labels'

export function formatInvoicePeriodLabel(inv: Pick<Invoice, 'billingMonth' | 'billingYear'>) {
  const m = Number(inv.billingMonth)
  const y = Number(inv.billingYear)
  if (!Number.isFinite(m) || !Number.isFinite(y) || m < 1 || m > 12) return '—'
  return `${String(m).padStart(2, '0')}/${y}`
}

function periodScore(inv: Invoice): number | null {
  const y = Number(inv.billingYear)
  const m = Number(inv.billingMonth)
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return null
  return y * 12 + m
}

/** Hóa đơn PAID cùng danh sách có kỳ < kỳ hiện tại, chọn kỳ lớn nhất. */
export function nearestPaidInvoiceBefore(rows: Invoice[], current: Invoice): Invoice | null {
  const cur = periodScore(current)
  if (cur == null) return null
  let best: Invoice | null = null
  let bestScore = -Infinity
  for (const inv of rows) {
    if (String(inv.id) === String(current.id)) continue
    const s = periodScore(inv)
    if (s == null || s >= cur) continue
    if (String(inv.status || '').toUpperCase() !== 'PAID') continue
    const idNum = Number(inv.id)
    if (best == null || s > bestScore || (s === bestScore && Number.isFinite(idNum) && idNum > Number(best.id))) {
      bestScore = s
      best = inv
    }
  }
  return best
}

/** Có kỳ hợp lệ; sắp xếp kỳ từ cao xuống thấp. */
export function sortInvoicesByPeriodDesc(rows: Invoice[]): Invoice[] {
  return [...rows]
    .map((inv) => ({ inv, s: periodScore(inv), idNum: Number(inv.id) }))
    .filter((x): x is { inv: Invoice; s: number; idNum: number } => x.s != null)
    .sort((a, b) => (b.s !== a.s ? b.s - a.s : (Number.isFinite(b.idNum) && Number.isFinite(a.idNum) ? b.idNum - a.idNum : 0)))
    .map((x) => x.inv)
}
