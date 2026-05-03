import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { paymentsApi } from 'src/apis/billing_api/payments.api'

type PaymentDetail = Record<string, unknown>

function displayValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return '-'
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

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
        <Link to='/admin/payments' className='inline-flex items-center gap-2 text-sm font-semibold text-[#0052CC] hover:underline'>
          ← Quản lý thanh toán
        </Link>

        <div className='mt-6'>
          <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
            Administration
          </span>
          <h1 className='mt-4 text-3xl font-bold text-gray-900'>Chi tiết thanh toán {paymentId ? `#${paymentId}` : ''}</h1>
          <p className='mt-2 text-sm text-gray-500'>Thông tin giao dịch và liên kết hóa đơn.</p>
        </div>

        <div className='mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
          {isLoading && <p className='text-gray-600'>Đang tải…</p>}
          {isError && <p className='text-red-600'>Không tải được chi tiết thanh toán.</p>}
          {!isLoading && !isError && detail && (
            <dl className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
              {(
                [
                  ['Payment ID', detail.id],
                  ['Invoice ID', detail.invoiceId],
                  ['Mã hóa đơn', detail.invoiceCode],
                  ['Căn hộ (ID)', detail.apartmentId],
                  [
                    'Kỳ',
                    detail.billingMonth != null && detail.billingYear != null ? `${detail.billingMonth}/${detail.billingYear}` : '-'
                  ],
                  ['Số tiền', detail.amount],
                  ['Phương thức', detail.paymentMethod],
                  ['Cổng', detail.paymentGateway],
                  ['Mã giao dịch', detail.gatewayTransactionNo],
                  ['Trạng thái thanh toán', detail.status],
                  ['Trạng thái hóa đơn', detail.invoiceStatus],
                  ['Ngày thanh toán', detail.paymentDate],
                  ['Đã xóa mềm', detail.deletedAt ? 'Có' : 'Không']
                ] as const satisfies ReadonlyArray<readonly [string, unknown]>
              ).map(([label, value]) => (
                <div key={label}>
                  <dt className='font-semibold text-gray-500'>{label}</dt>
                  <dd className='mt-1 text-gray-900'>
                    <span>{displayValue(value)}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {!isLoading && !isError && !detail && <p className='text-gray-600'>Không có dữ liệu.</p>}
        </div>
      </div>
    </div>
  )
}
