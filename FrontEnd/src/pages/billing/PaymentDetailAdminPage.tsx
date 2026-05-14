import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { paymentsApi } from 'src/apis/billing_api/payments.api'
import {
  formatVnd,
  invoiceStatusBadgeClass,
  invoiceStatusVi,
  paymentMethodVi,
  paymentStatusBadgeClass,
  paymentStatusVi
} from 'src/utils/billing-ui'

type PaymentDetail = Record<string, unknown>

function displayText(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return '—'
}

function formatDateVi(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  const s = String(value)
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function PaymentDetailAdminPage() {
  const { id } = useParams<{ id: string }>()
  const paymentId = id ?? ''

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payment-detail-admin', paymentId],
    queryFn: () => paymentsApi.getDetailById(paymentId),
    enabled: Boolean(paymentId)
  })

  const detail = data?.data?.data as PaymentDetail | undefined

  const invoiceIdRaw = detail?.invoiceId
  const invoiceIdStr = invoiceIdRaw != null && invoiceIdRaw !== '' ? String(invoiceIdRaw) : ''
  const amountNum = detail?.amount != null ? Number(detail.amount) : NaN
  const paymentStatus = displayText(detail?.status)
  const invoiceStatus = displayText(detail?.invoiceStatus)
  const methodKey = displayText(detail?.paymentMethod)
  const methodLabel =
    methodKey && methodKey !== '—' && methodKey in paymentMethodVi
      ? paymentMethodVi[methodKey as keyof typeof paymentMethodVi]
      : methodKey

  return (
    <div className='min-h-screen bg-slate-50 p-6 font-sans text-slate-900 sm:p-8'>
      <div className='mx-auto max-w-3xl'>
        <Link
          to='/admin/payments'
          className='inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline'
        >
          ← Quản lý thanh toán
        </Link>

        <div className='mt-6'>
          <span className='rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 ring-1 ring-blue-100'>
            Quản trị
          </span>
          <h1 className='mt-3 text-3xl font-bold tracking-tight text-slate-900'>
            Chi tiết thanh toán{paymentId ? ` #${paymentId}` : ''}
          </h1>
          <p className='mt-1 text-sm text-slate-600'>Đối chiếu với hóa đơn và trạng thái ghi nhận.</p>
        </div>

        <div className='mt-6 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm'>
          {isLoading && <p className='text-slate-600'>Đang tải…</p>}
          {isError && <p className='text-red-600'>Không tải được chi tiết thanh toán.</p>}
          {!isLoading && !isError && detail && (
            <dl className='grid grid-cols-1 gap-5 text-sm sm:grid-cols-2'>
              <div>
                <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Mã thanh toán</dt>
                <dd className='mt-1 font-mono text-slate-900'>{displayText(detail.id)}</dd>
              </div>
              <div>
                <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Hóa đơn liên kết</dt>
                <dd className='mt-1'>
                  {invoiceIdStr ? (
                    <Link
                      to={`/admin/invoices/${invoiceIdStr}`}
                      className='font-semibold text-blue-600 hover:text-blue-700 hover:underline'
                    >
                      Mở hóa đơn #{invoiceIdStr}
                    </Link>
                  ) : (
                    <span className='text-slate-900'>—</span>
                  )}
                  {detail.invoiceCode != null && detail.invoiceCode !== '' && (
                    <span className='mt-1 block text-xs text-slate-500'>Mã: {displayText(detail.invoiceCode)}</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Căn hộ (ID)</dt>
                <dd className='mt-1 text-slate-900'>{displayText(detail.apartmentId)}</dd>
              </div>
              <div>
                <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Kỳ hóa đơn</dt>
                <dd className='mt-1 text-slate-900'>
                  {detail.billingMonth != null && detail.billingYear != null
                    ? `${detail.billingMonth}/${detail.billingYear}`
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Số tiền</dt>
                <dd className='mt-1 text-lg font-bold tabular-nums text-slate-900'>
                  {Number.isFinite(amountNum) ? formatVnd(amountNum) : displayText(detail.amount)}
                </dd>
              </div>
              <div>
                <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Phương thức</dt>
                <dd className='mt-1 text-slate-900'>{methodLabel}</dd>
              </div>
              <div>
                <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Cổng thanh toán</dt>
                <dd className='mt-1 text-slate-900'>{displayText(detail.paymentGateway)}</dd>
              </div>
              <div>
                <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Mã giao dịch cổng</dt>
                <dd className='mt-1 break-all font-mono text-xs text-slate-800'>{displayText(detail.gatewayTransactionNo)}</dd>
              </div>
              <div>
                <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Trạng thái thanh toán</dt>
                <dd className='mt-1'>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${paymentStatusBadgeClass(paymentStatus)}`}
                  >
                    {paymentStatusVi[paymentStatus as keyof typeof paymentStatusVi] || paymentStatus}
                  </span>
                </dd>
              </div>
              <div>
                <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Trạng thái hóa đơn</dt>
                <dd className='mt-1'>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${invoiceStatusBadgeClass(invoiceStatus)}`}
                  >
                    {invoiceStatusVi[invoiceStatus as keyof typeof invoiceStatusVi] || invoiceStatus}
                  </span>
                </dd>
              </div>
              <div>
                <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Ngày thanh toán</dt>
                <dd className='mt-1 text-slate-900'>{formatDateVi(detail.paymentDate)}</dd>
              </div>
              <div>
                <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Đã xóa mềm</dt>
                <dd className='mt-1 text-slate-900'>{detail.deletedAt ? 'Có' : 'Không'}</dd>
              </div>
            </dl>
          )}
          {!isLoading && !isError && !detail && <p className='text-slate-600'>Không có dữ liệu.</p>}
        </div>
      </div>
    </div>
  )
}
