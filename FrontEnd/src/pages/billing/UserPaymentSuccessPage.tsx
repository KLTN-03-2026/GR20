import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from 'src/contexts/app.context'
import { paymentsApi } from 'src/apis/billing_api/payments.api'

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n) || 0)

export default function UserPaymentSuccessPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useContext(AppContext)
  const userId = String((user as any)?.id || (user as any)?._id || '')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-payment-detail', userId, id],
    queryFn: () => paymentsApi.getByUserIdAndPaymentId(userId, String(id)),
    enabled: Boolean(userId && id)
  })

  const row = data?.data?.data as
    | {
        status?: string
        invoiceCode?: string | null
        invoiceId?: number
        amount?: number
        apartmentId?: number | null
        billingMonth?: number | null
        billingYear?: number | null
      }
    | undefined

  const ok = String(row?.status || '').toUpperCase() === 'SUCCESS'

  if (!userId) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center text-slate-500'>
        Vui lòng đăng nhập.
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-lg px-4 pb-16 pt-8'>
      <nav className='mb-8 flex flex-wrap items-center justify-center gap-2 text-center text-sm font-medium text-slate-400'>
        <Link to='/' className='hover:text-violet-600'>
          Trang chủ
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <Link to='/payments' className='hover:text-violet-600'>
          Thanh toán
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <span className='font-semibold text-violet-700'>Hoàn tất</span>
      </nav>

      {/* Bước tiến trình — 2 bước đều hoàn thành */}
      <div className='mb-12 flex items-start justify-center gap-2 sm:gap-6'>
        <div className='flex max-w-[140px] flex-col items-center text-center'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white shadow-md ring-4 ring-violet-100'>
            <span className='material-symbols-outlined text-xl'>check</span>
          </div>
          <p className='mt-2 text-xs font-semibold leading-snug text-slate-700 sm:text-sm'>Hóa đơn & phương thức</p>
        </div>
        <div className='mt-5 h-px w-8 shrink-0 bg-slate-200 sm:w-16' aria-hidden />
        <div className='flex max-w-[140px] flex-col items-center text-center'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white shadow-md ring-4 ring-violet-100'>
            <span className='material-symbols-outlined text-xl'>check</span>
          </div>
          <p className='mt-2 text-xs font-semibold leading-snug text-slate-700 sm:text-sm'>Thanh toán & ghi nhận</p>
        </div>
      </div>

      <div className='relative flex flex-col items-center text-center'>
        {/* Chấm trang trí quanh icon */}
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <span className='absolute left-[12%] top-0 h-2 w-2 rounded-full bg-emerald-300/80' />
          <span className='absolute right-[10%] top-4 h-1.5 w-1.5 rounded-full bg-emerald-400/70' />
          <span className='absolute bottom-8 left-[8%] h-1 w-1 rounded-full bg-emerald-500/60' />
          <span className='absolute bottom-12 right-[14%] h-2 w-2 rounded-full bg-emerald-300/90' />
          <span className='absolute left-[22%] top-1/3 h-1 w-1 rounded-full bg-emerald-400/50' />
          <span className='absolute right-[20%] top-1/4 h-1.5 w-1.5 rounded-full bg-emerald-500/40' />
        </div>

        <div className='relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30 ring-8 ring-emerald-50'>
          <span className='material-symbols-outlined text-6xl font-bold text-white'>check</span>
        </div>

        <h1 className='mt-8 text-2xl font-extrabold tracking-tight text-emerald-600 sm:text-3xl'>Thanh toán thành công</h1>

        {isLoading && <p className='mt-4 text-sm text-slate-500'>Đang xác nhận thông tin...</p>}

        {!isLoading && isError && (
          <p className='mt-4 text-sm text-red-600'>Không tải được phiếu thanh toán. Thử quay lại danh sách.</p>
        )}

        {!isLoading && !isError && ok && (
          <>
            <p className='mt-4 max-w-md text-sm leading-relaxed text-slate-500'>
              Giao dịch của quý khách đã được ghi nhận. Chi tiết hóa đơn{' '}
              <span className='font-semibold text-slate-700'>{row?.invoiceCode || `#${row?.invoiceId ?? ''}`}</span> kỳ{' '}
              <span className='font-semibold text-slate-700'>
                {row?.billingMonth}/{row?.billingYear}
              </span>
              . Có thể xem lại trong mục <strong>Hóa đơn của tôi</strong> hoặc <strong>Thanh toán</strong>.
            </p>
            <p className='mt-2 text-lg font-bold tabular-nums text-slate-800'>{fmtMoney(Number(row?.amount) || 0)}</p>
          </>
        )}

        {!isLoading && !isError && row && !ok && (
          <div className='mt-6 max-w-md rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
            <p className='font-semibold'>Chưa ghi nhận thanh toán</p>
            <p className='mt-1 text-amber-800/90'>
              Trạng thái hiện tại: <strong>{row.status}</strong>. Nếu bạn vừa chuyển khoản, vui lòng đợi vài phút hoặc mở lại
              trang chi tiết thanh toán.
            </p>
            <Link to={`/payments/${id}${String(row.status).toUpperCase() === 'PENDING' ? '?checkout=1' : ''}`} className='mt-3 inline-block text-sm font-bold text-amber-900 underline'>
              Về chi tiết thanh toán
            </Link>
          </div>
        )}
      </div>

      <div className='mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center'>
        <Link
          to='/payments'
          className='inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50'
        >
          <span className='material-symbols-outlined text-lg'>list</span>
          Danh sách thanh toán
        </Link>
        <Link
          to='/invoices'
          className='inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-violet-700'
        >
          <span className='material-symbols-outlined text-lg'>receipt_long</span>
          Hóa đơn của tôi
        </Link>
      </div>
    </div>
  )
}
