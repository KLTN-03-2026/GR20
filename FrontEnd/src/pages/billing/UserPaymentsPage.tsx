import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useContext, useMemo, useState } from 'react'
import { paymentsApi } from 'src/apis/billing_api/payments.api'
import { residentsApi } from 'src/apis/resident_api/residents.api'
import { AppContext } from 'src/contexts/app.context'

const logApiSuccess = (action: string, response: any) => {
  console.log(`[UserPayments][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

const logApiError = (action: string, err: any) => {
  console.error(`[UserPayments][${action}] error`, {
    status: err?.response?.status,
    endpoint: err?.config?.url || err?.response?.config?.url,
    method: err?.config?.method || err?.response?.config?.method,
    data: err?.response?.data,
    message: err?.message
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

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n) || 0)

  if (isError) logApiError('GetUserPayments', error)

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
          Hóa đơn theo căn hộ của bạn. Mở chi tiết để xem dòng tiền; thanh toán trực tiếp trên trang đó.
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
                {['Mã hóa đơn', 'Căn hộ', 'Kỳ', 'Số tiền', 'TT hóa đơn', 'TT thanh toán', 'Hành động'].map((h) => (
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
                  const pending = row.status === 'PENDING'
                  return (
                    <tr key={paymentId} className='hover:bg-slate-50/50'>
                      <td className='px-6 py-4 text-sm font-medium text-slate-800'>
                        {row.invoiceCode || row.invoiceId}
                      </td>
                      <td className='px-6 py-4 text-sm text-slate-700'>Apt {row.apartmentId}</td>
                      <td className='px-6 py-4 text-sm tabular-nums text-slate-700'>
                        {row.billingMonth}/{row.billingYear}
                      </td>
                      <td className='px-6 py-4 text-sm font-semibold tabular-nums text-slate-800'>
                        {fmtMoney(Number(row.amount) || 0)}
                      </td>
                      <td className='px-6 py-4 text-sm text-slate-700'>{row.invoiceStatus || '—'}</td>
                      <td className='px-6 py-4 text-sm text-slate-700'>{row.status}</td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-wrap justify-end gap-2'>
                          <Link
                            to={`/payments/${paymentId}`}
                            className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50'
                          >
                            Chi tiết
                          </Link>
                          {pending && (
                            <Link
                              to={`/payments/${paymentId}?checkout=1`}
                              className='rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700'
                            >
                              Thanh toán
                            </Link>
                          )}
                        </div>
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
