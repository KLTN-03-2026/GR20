/** Định dạng tiền VND — dùng chung trang hóa đơn / thanh toán */
export const formatVnd = (n: number | string | undefined | null) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n) || 0)

export const invoiceStatusVi: Record<string, string> = {
  PENDING: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  OVERDUE: 'Quá hạn',
  CANCELLED: 'Đã hủy'
}

export const paymentStatusVi: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại'
}

export const paymentMethodVi: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản'
}

export const invoiceStatusBadgeClass = (status: string | undefined) => {
  const s = (status || '').toUpperCase()
  if (s === 'PAID') return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
  if (s === 'PENDING') return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
  if (s === 'OVERDUE') return 'bg-red-50 text-red-800 ring-1 ring-red-200'
  if (s === 'CANCELLED') return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
  return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
}

export const paymentStatusBadgeClass = (status: string | undefined) => {
  const s = (status || '').toUpperCase()
  if (s === 'SUCCESS') return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
  if (s === 'PENDING') return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
  if (s === 'FAILED') return 'bg-red-50 text-red-800 ring-1 ring-red-200'
  return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
}
