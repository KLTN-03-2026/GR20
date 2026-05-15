import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useContext, useMemo, useState } from 'react'
import { invoicesApi } from 'src/apis/billing_api/invoices.api'
import { paymentsApi } from 'src/apis/billing_api/payments.api'
import { residentsApi } from 'src/apis/resident_api/residents.api'
import { AppContext } from 'src/contexts/app.context'
import { formatVnd, invoiceStatusBadgeClass, invoiceStatusVi } from 'src/utils/billing-ui'
import { formatInvoicePeriodLabel } from 'src/utils/invoice-period-helpers'

const logApiError = (action: string, err: any) => {
  console.error(`[UserInvoices][${action}] error`, {
    status: err?.response?.status,
    endpoint: err?.config?.url || err?.response?.config?.url,
    method: err?.config?.method || err?.response?.config?.method,
    data: err?.response?.data,
    message: err?.message
  })
}

export default function UserInvoicesPage() {
  const { user } = useContext(AppContext)
  const userId = String((user as any)?.id || (user as any)?._id || '')
  const [page, setPage] = useState(0)
  const pageSize = 10

  const { data, error, isError, isLoading } = useQuery({
    queryKey: ['user-invoices', userId, page],
    queryFn: () => invoicesApi.getByUserId(userId, { page, size: pageSize }),
    enabled: Boolean(userId)
  })

  const { data: paymentsData } = useQuery({
    queryKey: ['user-pending-payments-for-invoices', userId],
    queryFn: () => paymentsApi.getByUserId(userId, { page: 0, size: 100, status: 'PENDING' }),
    enabled: Boolean(userId),
    retry: false
  })

  const { data: apartmentsData } = useQuery({
    queryKey: ['user-apartments-for-invoices', userId],
    queryFn: () => residentsApi.getUserApartments(userId),
    enabled: Boolean(userId)
  })

  if (isError) logApiError('GetByUserId', error)

  const list = data?.data?.data || []
  const totalPages = Number(data?.data?.totalPages || 0)
  const currentPage = Number(data?.data?.page || 0)

  const pendingPaymentByInvoiceId = useMemo(() => {
    const m = new Map<number, string>()
    const payments = paymentsData?.data?.data || []
    for (const p of payments) {
      if (String(p.status || '').toUpperCase() !== 'PENDING') continue
      const invId = Number(p.invoiceId ?? p.invoice_id)
      if (Number.isFinite(invId) && invId > 0) m.set(invId, String(p.id))
    }
    return m
  }, [paymentsData])

  const apartmentLabelById = useMemo(() => {
    const m = new Map<number, string>()
    for (const a of apartmentsData?.data?.data || []) {
      const id = Number(a.apartmentId)
      if (!Number.isFinite(id)) continue
      const num = String(a.apartmentNumber || '').trim()
      const bld = String(a.buildingName || '').trim()
      m.set(id, num && bld ? `${num} · ${bld}` : num || bld || `Căn #${id}`)
    }
    return m
  }, [apartmentsData])

  return (
    <div className='pb-10'>
      <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
        <Link to='/' className='hover:text-blue-500'>
          Trang chủ
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <span className='font-semibold text-blue-600'>Hóa đơn của tôi</span>
      </nav>

      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-extrabold text-slate-900'>Hóa đơn của tôi</h1>
        <div className='h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-700' />
        <p className='mt-2 text-sm text-slate-500'>
          Xem chi tiết từng kỳ; hóa đơn chưa thanh toán có thể bấm <strong>Thanh toán</strong> ngay tại đây.
        </p>
      </div>

      {isError && (
        <div className='mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {(error as any)?.response?.data?.message || 'Tải danh sách thất bại'}
        </div>
      )}

      <div className='overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[640px] border-collapse text-left'>
            <thead>
              <tr className='border-b border-slate-100 bg-slate-50/80'>
                <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500'>Mã hóa đơn</th>
                <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500'>Căn hộ</th>
                <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500'>Kỳ</th>
                <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500'>Tổng tiền</th>
                <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500'>Trạng thái</th>
                <th className='px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500'>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {isLoading && (
                <tr>
                  <td className='px-6 py-12 text-center text-sm text-slate-400' colSpan={6}>
                    <span className='material-symbols-outlined align-middle animate-spin'>sync</span>
                    <span className='ml-2'>Đang tải...</span>
                  </td>
                </tr>
              )}
              {!isLoading &&
                list.map((item: any) => {
                  const invId = Number(item.id)
                  const st = String(item.status || '').toUpperCase()
                  const paymentId = pendingPaymentByInvoiceId.get(invId)
                  const canPay = st === 'PENDING'
                  return (
                    <tr key={item.id} className='hover:bg-slate-50/50'>
                      <td className='px-6 py-4 text-sm font-semibold text-slate-900'>{item.invoiceCode || item.id}</td>
                      <td className='px-6 py-4 text-sm text-slate-700'>
                        {apartmentLabelById.get(Number(item.apartmentId)) ?? `Căn #${item.apartmentId}`}
                      </td>
                      <td className='px-6 py-4 text-sm tabular-nums text-slate-700'>
                        {formatInvoicePeriodLabel(item)}
                      </td>
                      <td className='px-6 py-4 text-sm font-semibold tabular-nums text-slate-800'>
                        {formatVnd(item.totalAmount)}
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${invoiceStatusBadgeClass(item.status)}`}
                        >
                          {invoiceStatusVi[st] || item.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <div className='flex flex-wrap justify-end gap-2'>
                          <Link
                            to={`/invoices/${String(item.id)}`}
                            className='inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50'
                          >
                            Chi tiết
                          </Link>
                          {canPay && (
                            <Link
                              to={
                                paymentId
                                  ? `/payments/${paymentId}?checkout=1`
                                  : `/invoices/${String(item.id)}?pay=1`
                              }
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
        {!isLoading && list.length === 0 && (
          <p className='px-6 py-16 text-center text-sm text-slate-500'>Chưa có hóa đơn nào.</p>
        )}
      </div>

      <div className='mt-6 flex flex-wrap items-center justify-end gap-3 text-sm'>
        <button
          type='button'
          className='rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50'
          disabled={currentPage <= 0}
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
        >
          Trang trước
        </button>
        <span className='tabular-nums text-slate-600'>
          Trang {totalPages === 0 ? 0 : currentPage + 1}/{totalPages}
        </span>
        <button
          type='button'
          className='rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50'
          disabled={totalPages === 0 || currentPage + 1 >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Trang sau
        </button>
      </div>
    </div>
  )
}
