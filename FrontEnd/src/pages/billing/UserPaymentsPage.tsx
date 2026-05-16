import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useContext, useMemo, useState } from 'react'
import { paymentsApi } from 'src/apis/billing_api/payments.api'
import { residentsApi } from 'src/apis/resident_api/residents.api'
import { AppContext } from 'src/contexts/app.context'
import { logPaymentConsoleError } from 'src/utils/payment-console-log'
import {
  formatVnd,
  invoiceStatusBadgeClass,
  invoiceStatusVi,
  paymentStatusBadgeClass,
  paymentStatusVi
} from 'src/utils/billing-ui'
import { formatInvoicePeriodLabel } from 'src/utils/invoice-period-helpers'

const logApiSuccess = (action: string, response: any) => {
  console.log(`[UserPayments][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

export default function UserPaymentsPage() {
  const { user } = useContext(AppContext)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_ONLY' | 'PAID_ONLY'>('ALL')

  const userId = String((user as any)?.id || (user as any)?._id || '')

  const { data: apartmentsData } = useQuery({
    queryKey: ['user-apartments-by-resident', userId],
    queryFn: async () => {
      const response = await residentsApi.getUserApartments(userId)
      logApiSuccess('GetUserApartments', response)
      return response
    },
    enabled: Boolean(userId)
  })
  const { data: paymentsData, isLoading, error, isError } = useQuery({
    queryKey: ['user-payments', userId],
    queryFn: async () => {
      const response = await paymentsApi.getByUserId(userId, { page: 0, size: 100 })
      logApiSuccess('GetUserPayments', response)
      return response
    },
    enabled: Boolean(userId)
  })

  const apartments = apartmentsData?.data?.data || []
  const payments = paymentsData?.data?.data || []

  const myApartmentIds = useMemo(() => apartments.map((a) => Number(a.apartmentId)), [apartments])

  const myInvoices = useMemo(
    () =>
      payments.filter(
        (payment) =>
          myApartmentIds.includes(Number(payment.apartmentId)) &&
          (statusFilter === 'ALL' ||
            (statusFilter === 'PENDING_ONLY' && payment.status === 'PENDING') ||
            (statusFilter === 'PAID_ONLY' && payment.status === 'SUCCESS'))
      ),
    [payments, myApartmentIds, statusFilter]
  )

  const apartmentLabelById = useMemo(() => {
    const m = new Map<number, string>()
    for (const a of apartments) {
      const id = Number(a.apartmentId)
      if (!Number.isFinite(id)) continue
      const num = String(a.apartmentNumber || '').trim()
      const bld = String(a.buildingName || '').trim()
      m.set(id, num && bld ? `${num} · ${bld}` : num || bld || `Căn #${id}`)
    }
    return m
  }, [apartments])

  if (isError && error) logPaymentConsoleError('payment-list-load', error)

  return (
    <div className='pb-10'>
      <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
        <Link to='/' className='hover:text-blue-500'>
          Trang chủ
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <span className='font-semibold text-blue-600'>Thanh toán của tôi</span>
      </nav>

      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-extrabold text-slate-900'>Thanh toán của tôi</h1>
        <div className='h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-700' />
        <p className='mt-2 text-sm text-slate-500'>
          Lịch sử và trạng thái các lần thanh toán. Để thanh toán hóa đơn mới, vào mục{' '}
          <Link to='/invoices' className='font-semibold text-blue-600 hover:underline'>
            Hóa đơn của tôi
          </Link>
          .
        </p>
      </div>

      {isError && (
        <div className='mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {(error as any)?.response?.data?.message || 'Tải danh sách thất bại'}
        </div>
      )}

      <div className='mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm'>
        <label className='block text-xs font-bold uppercase tracking-widest text-slate-500'>Lọc</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className='mt-2 w-full max-w-md rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        >
          <option value='PENDING_ONLY'>Chưa thanh toán</option>
          <option value='PAID_ONLY'>Đã thanh toán</option>
          <option value='ALL'>Tất cả</option>
        </select>
      </div>

      <div className='overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[760px] border-collapse text-left'>
            <thead>
              <tr className='border-b border-slate-100 bg-slate-50/80'>
                {['Mã hóa đơn', 'Căn hộ', 'Kỳ', 'Số tiền', 'Hóa đơn', 'Thanh toán', 'Hành động'].map((h) => (
                  <th
                    key={h}
                    className={`whitespace-nowrap px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 ${
                      h === 'Hành động' ? 'text-right' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {isLoading && (
                <tr>
                  <td className='px-6 py-12 text-center text-sm text-slate-400' colSpan={7}>
                    <span className='material-symbols-outlined align-middle animate-spin'>sync</span>
                    <span className='ml-2'>Đang tải...</span>
                  </td>
                </tr>
              )}
              {!isLoading && myInvoices.length === 0 && (
                <tr>
                  <td className='px-6 py-12 text-center text-sm text-slate-500' colSpan={7}>
                    Không có bản ghi thanh toán nào.
                  </td>
                </tr>
              )}
              {!isLoading &&
                myInvoices.map((row: any) => {
                  const paymentId = String(row.id)
                  const invSt = String(row.invoiceStatus || '').toUpperCase()
                  const paySt = String(row.status || '').toUpperCase()
                  return (
                    <tr key={paymentId} className='hover:bg-slate-50/50'>
                      <td className='px-6 py-4 text-sm font-medium text-slate-800'>
                        {row.invoiceCode || row.invoiceId}
                      </td>
                      <td className='px-6 py-4 text-sm text-slate-700'>
                        {apartmentLabelById.get(Number(row.apartmentId)) ?? `Căn #${row.apartmentId}`}
                      </td>
                      <td className='px-6 py-4 text-sm tabular-nums text-slate-700'>
                        {formatInvoicePeriodLabel({
                          billingMonth: row.billingMonth,
                          billingYear: row.billingYear
                        })}
                      </td>
                      <td className='px-6 py-4 text-sm font-semibold tabular-nums text-slate-800'>
                        {formatVnd(row.amount)}
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${invoiceStatusBadgeClass(row.invoiceStatus)}`}
                        >
                          {invoiceStatusVi[invSt] || row.invoiceStatus || '—'}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStatusBadgeClass(row.status)}`}
                        >
                          {paymentStatusVi[paySt] || row.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <Link
                          to={`/payments/${paymentId}`}
                          className='inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50'
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
