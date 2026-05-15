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
    <div className='min-h-screen bg-white'>
      <div className='mx-auto max-w-xl px-4 pb-20 pt-10 sm:pt-16'>
        <nav className='mb-10 flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-slate-400'>
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

        {/* Tiến trình 2 bước — giống mẫu: đều hoàn thành */}
        <div className='mb-14 flex items-start justify-center px-2'>
          <div className='flex w-full max-w-md items-start justify-between gap-0'>
            <div className='flex flex-1 flex-col items-center text-center'>
              <div className='z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-md ring-4 ring-violet-100'>
                <span className='material-symbols-outlined text-xl' style={{ fontVariationSettings: "'FILL' 1" }}>
                  check
                </span>
              </div>
              <p className='mt-3 max-w-[120px] text-xs font-semibold leading-snug text-slate-700 sm:max-w-none sm:text-sm'>
                Dịch vụ và tài khoản
              </p>
            </div>

            <div className='relative mx-1 mt-5 h-px min-w-0 flex-1 bg-violet-200 sm:mx-4' aria-hidden />

            <div className='flex flex-1 flex-col items-center text-center'>
              <div className='z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-md ring-4 ring-violet-100'>
                <span className='material-symbols-outlined text-xl' style={{ fontVariationSettings: "'FILL' 1" }}>
                  check
                </span>
              </div>
              <p className='mt-3 max-w-[130px] text-xs font-semibold leading-snug text-slate-700 sm:max-w-none sm:text-sm'>
                Thanh toán và xuất hóa đơn
              </p>
            </div>
          </div>
        </div>

        <div className='relative flex flex-col items-center px-2 text-center'>
          {/* Chấm trang trí quanh icon thành công */}
          <div className='pointer-events-none relative mb-2 flex h-36 w-full max-w-xs items-center justify-center'>
            <span className='absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-emerald-400/90' />
            <span className='absolute right-1 top-6 h-2 w-2 rounded-full bg-emerald-300/80' />
            <span className='absolute bottom-10 left-2 h-1.5 w-1.5 rounded-full bg-emerald-500/70' />
            <span className='absolute bottom-6 right-4 h-2 w-2 rounded-full bg-emerald-400' />
            <span className='absolute left-8 top-1/2 h-1 w-1 rounded-full bg-emerald-500/60' />
            <span className='absolute right-10 top-1/3 h-1.5 w-1.5 rounded-full bg-emerald-300' />
            <span className='absolute left-1/4 bottom-2 h-1 w-1 rounded-full bg-emerald-600/40' />

            <div className='relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/25 ring-[10px] ring-emerald-50'>
              <span className='material-symbols-outlined text-7xl font-bold text-white' style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
            </div>
          </div>

          <h1 className='mt-2 text-2xl font-extrabold tracking-tight text-emerald-600 sm:text-3xl'>Thanh toán thành công</h1>

          {isLoading && <p className='mt-6 text-sm text-slate-500'>Đang xác nhận thông tin...</p>}

          {!isLoading && isError && (
            <p className='mt-6 max-w-md text-sm text-red-600'>Không tải được phiếu thanh toán. Thử quay lại danh sách.</p>
          )}

          {!isLoading && !isError && ok && (
            <>
              <p className='mt-6 max-w-lg text-sm leading-relaxed text-slate-500'>
                Đơn hàng của quý khách đã được thanh toán thành công. Thông tin dịch vụ, đơn đặt hàng, biên bản bàn giao và hóa
                đơn điện tử sẽ được thông báo qua email kích hoạt tài khoản.
              </p>
              <p className='mt-5 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-xs leading-relaxed text-slate-600'>
                <span className='font-semibold text-slate-800'>Theo hệ thống căn hộ:</span> Hóa đơn{' '}
                <span className='font-semibold text-slate-800'>{row?.invoiceCode || `#${row?.invoiceId ?? '—'}`}</span> kỳ{' '}
                <span className='font-semibold text-slate-800'>
                  {row?.billingMonth}/{row?.billingYear}
                </span>
                {row?.apartmentId != null && (
                  <>
                    {' '}
                    · Căn <span className='font-semibold text-slate-800'>#{row.apartmentId}</span>
                  </>
                )}
                . Số tiền đã thanh toán:{' '}
                <span className='font-bold tabular-nums text-slate-900'>{fmtMoney(Number(row?.amount) || 0)}</span>. Bạn có thể
                xem lại trong mục <strong>Hóa đơn của tôi</strong> hoặc <strong>Thanh toán</strong>.
              </p>
            </>
          )}

          {!isLoading && !isError && row && !ok && (
            <div className='mt-8 max-w-md rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-left text-sm text-amber-900'>
              <p className='font-semibold'>Chưa ghi nhận thanh toán</p>
              <p className='mt-2 text-amber-800/90'>
                Trạng thái hiện tại: <strong>{row.status}</strong>. Nếu bạn vừa chuyển khoản, vui lòng đợi vài phút hoặc mở lại
                trang chi tiết thanh toán.
              </p>
              <Link
                to={`/payments/${id}${String(row.status).toUpperCase() === 'PENDING' ? '?checkout=1' : ''}`}
                className='mt-4 inline-block text-sm font-bold text-amber-900 underline'
              >
                Về chi tiết thanh toán
              </Link>
            </div>
          )}
        </div>

        <div className='mt-14 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center'>
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
    </div>
  )
}
