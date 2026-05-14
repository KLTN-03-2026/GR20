import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { AppContext } from 'src/contexts/app.context'
import { invoiceItemsApi } from 'src/apis/billing_api/invoice-items.api'
import { paymentsApi } from 'src/apis/billing_api/payments.api'
import { utilityPricingApi } from 'src/apis/utility_api/utility-pricing.api'
import { logPaymentConsoleError } from 'src/utils/payment-console-log'

const getApiErrorMessage = (err: any, fallbackMessage: string) => {
  const apiErr = err?.response?.data
  if (typeof apiErr?.message === 'string' && apiErr.message.trim()) return apiErr.message.trim()
  const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
  if (typeof rawMessage !== 'string') return fallbackMessage
  const translated: Array<[string, string]> = [
    ['Payment not found', 'Không tìm thấy thanh toán'],
    ['Invoice not found', 'Không tìm thấy hóa đơn'],
    ['Webhook chưa xác nhận giao dịch.', 'Webhook chưa xác nhận giao dịch. Vui lòng đợi thêm.'],
    ['Invalid payment amount', 'Số tiền thanh toán không hợp lệ']
  ]
  const m = translated.find(([en]) => String(rawMessage).includes(en))
  return m?.[1] || String(rawMessage)
}

type PayRow = {
  id?: string
  invoiceId?: number
  amount?: number
  status?: string
  invoiceCode?: string | null
  apartmentId?: number | null
  billingMonth?: number | null
  billingYear?: number | null
  invoiceStatus?: string | null
}

export default function UserPaymentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const checkout = searchParams.get('checkout') === '1'
  const queryClient = useQueryClient()
  const { user } = useContext(AppContext)
  const userId = String((user as any)?.id || (user as any)?._id || '')

  const bankTransferAwaitingWebhookRef = useRef(false)
  const cashConfirmSuccessRef = useRef(false)
  const didRedirectToSuccessRef = useRef(false)

  const [payError, setPayError] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH')

  const paymentQuery = useQuery({
    queryKey: ['user-payment-detail', userId, id],
    queryFn: () => paymentsApi.getByUserIdAndPaymentId(userId, String(id)),
    enabled: Boolean(userId && id),
    refetchInterval: (q) => {
      const r = q.state.data?.data?.data as PayRow | undefined
      if (!bankTransferAwaitingWebhookRef.current) return false
      if (!r || String(r.status).toUpperCase() !== 'PENDING') return false
      return 4000
    },
    refetchOnWindowFocus: true
  })

  const row = paymentQuery.data?.data?.data as PayRow | null

  const invoiceIdStr = row?.invoiceId != null ? String(row.invoiceId) : ''

  const itemsQuery = useQuery({
    queryKey: ['invoice-items-payment', invoiceIdStr],
    queryFn: () => invoiceItemsApi.getByInvoiceId(invoiceIdStr),
    enabled: Boolean(row && invoiceIdStr)
  })

  const activePricingQuery = useQuery({
    queryKey: ['active-utility-pricing'],
    queryFn: () => utilityPricingApi.getActive()
  })

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n) || 0)

  const pending = row?.status === 'PENDING'
  const paid = String(row?.status || '').toUpperCase() === 'SUCCESS'
  const showCheckout = checkout || pending

  const vietQrQuery = useQuery({
    queryKey: ['payment-vietqr', row?.invoiceId],
    queryFn: async () => {
      try {
        if (row?.invoiceId == null) throw new Error('Thiếu hóa đơn')
        const qrRes = await paymentsApi.getMbVietQrByInvoiceId(String(row.invoiceId))
        const d = (qrRes.data as { data?: { qrCodeUrl?: string; content?: string } }).data
        return {
          qrUrl: d?.qrCodeUrl ?? '',
          content: d?.content ?? ''
        }
      } catch (e) {
        logPaymentConsoleError('vietqr-fetch', e)
        throw e
      }
    },
    enabled: Boolean(showCheckout && pending && selectedMethod === 'BANK_TRANSFER' && row?.invoiceId),
    retry: 1,
    staleTime: 60_000
  })

  useEffect(() => {
    bankTransferAwaitingWebhookRef.current = false
    cashConfirmSuccessRef.current = false
    didRedirectToSuccessRef.current = false
  }, [id])

  useEffect(() => {
    if (showCheckout && pending && selectedMethod === 'BANK_TRANSFER' && vietQrQuery.isSuccess) {
      bankTransferAwaitingWebhookRef.current = true
    }
    if (selectedMethod === 'CASH' && pending) {
      bankTransferAwaitingWebhookRef.current = false
    }
  }, [showCheckout, pending, selectedMethod, vietQrQuery.isSuccess])

  useEffect(() => {
    if (!id || !userId || !row) return
    if (String(row.status).toUpperCase() !== 'SUCCESS') return
    if (didRedirectToSuccessRef.current) return
    if (!bankTransferAwaitingWebhookRef.current && !cashConfirmSuccessRef.current) return
    didRedirectToSuccessRef.current = true
    toast.success('Thanh toán thành công')
    void queryClient.invalidateQueries({ queryKey: ['user-payments'] })
    void queryClient.invalidateQueries({ queryKey: ['user-invoices'] })
    void queryClient.invalidateQueries({ queryKey: ['user-payment-detail', userId, id] })
    navigate(`/payments/${id}/success`, { replace: true })
  }, [row, row?.status, id, userId, navigate, queryClient])

  useEffect(() => {
    if (selectedMethod === 'BANK_TRANSFER') setPayError(null)
  }, [selectedMethod])

  useEffect(() => {
    if (paymentQuery.isError && paymentQuery.error) {
      logPaymentConsoleError('payment-detail-load', paymentQuery.error)
    }
  }, [paymentQuery.isError, paymentQuery.error])

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!row?.invoiceId) return
      const latestPaymentRes = await paymentsApi.getByInvoiceId(String(row.invoiceId))
      const paymentId = latestPaymentRes.data.data.id
      await paymentsApi.update(paymentId, {
        paymentMethod: 'CASH',
        paymentGateway: 'OFFLINE',
        status: 'SUCCESS',
        paymentDate: new Date().toISOString()
      })
    },
    onSuccess: () => {
      cashConfirmSuccessRef.current = true
      queryClient.invalidateQueries({ queryKey: ['user-invoices'] })
      queryClient.invalidateQueries({ queryKey: ['user-payments'] })
      queryClient.invalidateQueries({ queryKey: ['user-payment-detail', userId, id] })
      setPayError(null)
    },
    onError: (err: unknown) => {
      logPaymentConsoleError('confirm-cash', err)
      const msg = getApiErrorMessage(err, 'Thanh toán thất bại')
      setPayError(msg)
      toast.error(msg)
    }
  })

  const items = itemsQuery.data?.data?.data || []
  const pricing = activePricingQuery.data?.data?.data || []

  const statusBadge = useMemo(() => {
    const s = String(row?.status || '').toUpperCase()
    if (s === 'SUCCESS') return 'bg-emerald-100 text-emerald-800'
    if (s === 'FAILED') return 'bg-red-100 text-red-800'
    return 'bg-amber-100 text-amber-900'
  }, [row?.status])

  if (!userId) {
    return <div className='pb-8 text-center text-slate-500'>Vui lòng đăng nhập.</div>
  }

  if (paymentQuery.isLoading) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center text-slate-400'>
        <span className='material-symbols-outlined animate-spin'>sync</span>
        <span className='ml-2 text-sm'>Đang tải...</span>
      </div>
    )
  }

  if (!row) {
    return (
      <div className='pb-10'>
        <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
          <Link to='/' className='hover:text-blue-500'>
            Trang chủ
          </Link>
          <span className='material-symbols-outlined text-xs'>chevron_right</span>
          <Link to='/payments' className='hover:text-blue-500'>
            Thanh toán của tôi
          </Link>
          <span className='material-symbols-outlined text-xs'>chevron_right</span>
          <span className='font-semibold text-blue-600'>Chi tiết</span>
        </nav>
        <div className='rounded-2xl border border-slate-100 bg-white py-16 text-center'>
          <span className='material-symbols-outlined mx-auto mb-4 block text-5xl text-slate-200'>payments</span>
          <p className='font-semibold text-slate-700'>Không tìm thấy phiên thanh toán</p>
          <Link
            to='/payments'
            className='mt-4 inline-block text-sm font-bold text-blue-600 hover:underline'
          >
            Về danh sách thanh toán
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='pb-10'>
      <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
        <Link to='/' className='hover:text-blue-500'>
          Trang chủ
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <Link to='/payments' className='hover:text-blue-500'>
          Thanh toán của tôi
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <span className='font-semibold text-blue-600'>Chi tiết thanh toán</span>
      </nav>

      {paid && (
        <div className='mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 shadow-sm'>
          <span className='material-symbols-outlined text-emerald-600'>check_circle</span>
          <div>
            <p className='font-bold'>Thanh toán thành công</p>
            <p className='text-sm text-emerald-800/90'>Giao dịch đã được ghi nhận. Bạn có thể quay về danh sách khi cần.</p>
          </div>
        </div>
      )}

      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-extrabold text-slate-900'>Chi tiết thanh toán</h1>
        <div className='h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-700' />
        <p className='mt-2 text-sm text-slate-500'>
          Phiếu #{row.id} · Hóa đơn {row.invoiceCode || `#${row.invoiceId ?? '—'}`} · Căn #{row.apartmentId ?? '—'}
        </p>
      </div>

      <div className='relative mb-8 flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8'>
        <div className='flex items-center gap-6'>
          <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50'>
            <span className='material-symbols-outlined text-3xl text-blue-600'>account_balance_wallet</span>
          </div>
          <div>
            <p className='text-2xl font-extrabold text-slate-900'>{fmtMoney(Number(row.amount) || 0)}</p>
            <p className='text-sm text-slate-500'>
              Kỳ {row.billingMonth}/{row.billingYear} · HĐ:{' '}
              <span className='font-semibold text-slate-700'>{row.invoiceStatus || '—'}</span>
            </p>
          </div>
        </div>
        <span className={`inline-flex shrink-0 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wide ${statusBadge}`}>
          {String(row.status || '—')}
        </span>
      </div>

      {showCheckout && pending && (
        <div className='mb-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 shadow-sm'>
          <h2 className='mb-4 flex items-center gap-2 text-lg font-bold text-slate-900'>
            <span className='material-symbols-outlined text-blue-600'>point_of_sale</span>
            Thanh toán
          </h2>

          <div className='mb-4 grid gap-2 sm:grid-cols-2'>
            <button
              type='button'
              className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                selectedMethod === 'CASH'
                  ? 'border-blue-600 bg-white text-blue-800 shadow-sm'
                  : 'border-slate-200 bg-white/80 text-slate-700'
              }`}
              onClick={() => setSelectedMethod('CASH')}
            >
              Tiền mặt (tại Ban quản lý)
            </button>
            <button
              type='button'
              className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                selectedMethod === 'BANK_TRANSFER'
                  ? 'border-blue-600 bg-white text-blue-800 shadow-sm'
                  : 'border-slate-200 bg-white/80 text-slate-700'
              }`}
              onClick={() => setSelectedMethod('BANK_TRANSFER')}
            >
              Chuyển khoản (VietQR)
            </button>
          </div>

          {selectedMethod === 'CASH' && (
            <>
              <p className='mb-4 text-sm text-slate-600'>
                Xác nhận bạn đã nộp tiền mặt đúng hạn tại Ban quản lý. Hệ thống sẽ cập nhật trạng thái và hóa đơn liên quan.
              </p>
              {payError && <div className='mb-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700'>{payError}</div>}
              <button
                type='button'
                className='rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50'
                disabled={payMutation.isPending}
                onClick={() => {
                  setPayError(null)
                  payMutation.mutate()
                }}
              >
                {payMutation.isPending ? 'Đang xử lý…' : 'Xác nhận đã thanh toán tiền mặt'}
              </button>
            </>
          )}

          {selectedMethod === 'BANK_TRANSFER' && (
            <div className='rounded-xl border border-blue-100 bg-white p-4'>
              <p className='text-sm font-semibold text-slate-800'>Quét mã QR để chuyển khoản</p>
              <p className='mt-1 text-xs text-slate-600'>
                Mã được tạo sẵn theo khoản phải trả. Sau khi chuyển khoản, hệ thống tự kiểm tra vài giây một lần — khi ngân hàng xác nhận bạn sẽ được chuyển sang trang hoàn tất thanh toán.
              </p>
              {vietQrQuery.isLoading && (
                <div className='mt-4 flex items-center justify-center gap-2 py-8 text-sm text-slate-500'>
                  <span className='material-symbols-outlined animate-spin'>sync</span>
                  Đang lấy mã QR...
                </div>
              )}
              {vietQrQuery.isError && (
                <div className='mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700'>
                  {getApiErrorMessage(vietQrQuery.error, 'Không tải được mã QR. Thử chọn lại hoặc liên hệ BQL.')}
                </div>
              )}
              {vietQrQuery.isSuccess && vietQrQuery.data.qrUrl ? (
                <>
                  <div className='mt-3 flex justify-center'>
                    <img
                      src={vietQrQuery.data.qrUrl}
                      alt='VietQR'
                      className='h-52 w-52 rounded-xl border border-slate-100 object-contain'
                    />
                  </div>
                  {vietQrQuery.data.content ? (
                    <p className='mt-3 text-xs text-slate-600'>
                      Nội dung chuyển khoản:{' '}
                      <span className='font-bold text-slate-900'>{vietQrQuery.data.content}</span>
                    </p>
                  ) : null}
                </>
              ) : vietQrQuery.isSuccess && !vietQrQuery.data.qrUrl ? (
                <p className='mt-3 text-sm text-amber-800'>Không nhận được ảnh QR từ máy chủ.</p>
              ) : null}
            </div>
          )}
        </div>
      )}

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        <div className='rounded-2xl border border-slate-100 bg-white p-8 shadow-sm lg:col-span-8'>
          <div className='mb-4 flex items-center gap-3'>
            <span className='material-symbols-outlined text-blue-600'>receipt_long</span>
            <h3 className='text-xs font-bold uppercase tracking-widest text-slate-400'>Chi tiết hóa đơn liên quan</h3>
          </div>
          {itemsQuery.isLoading ? (
            <p className='text-sm text-slate-400'>Đang tải...</p>
          ) : items.length === 0 ? (
            <p className='text-sm text-slate-500'>Không có dòng chi tiết.</p>
          ) : (
            <div className='divide-y divide-slate-100'>
              {(items as { id?: string; itemName?: string; amount?: number }[]).map((it) => (
                <div key={String(it.id)} className='flex justify-between py-3 first:pt-0'>
                  <span className='text-sm text-slate-800'>{it.itemName}</span>
                  <span className='text-sm font-bold tabular-nums'>{fmtMoney(Number(it.amount) || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-4'>
          <h3 className='mb-3 text-xs font-bold uppercase tracking-wider text-slate-400'>Bảng giá đang áp dụng</h3>
          {pricing.length === 0 ? (
            <p className='text-xs text-slate-500'>Không có dữ liệu.</p>
          ) : (
            <div className='space-y-2 text-xs text-slate-700'>
              {(pricing as { id?: string; meterType?: string; unit?: string; pricePerUnit?: number }[]).map((p) => (
                <div key={String(p.id)} className='flex justify-between'>
                  <span>{p.meterType}</span>
                  <span className='font-semibold'>{fmtMoney(Number(p.pricePerUnit) || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!pending && (
        <p className='mt-8 text-center text-sm text-slate-500'>
          Đơn đã hoàn tất. Cần hỗ trợ đối soát — liên hệ Ban quản lý.
        </p>
      )}

      <div className='relative mt-8 h-28 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-800 to-indigo-950'>
        <div className='flex h-full items-center px-6'>
          <div className='max-w-lg'>
            <div className='mb-1 flex items-center gap-2'>
              <span className='material-symbols-outlined text-sm text-blue-300'>auto_awesome</span>
              <span className='text-[10px] font-bold uppercase tracking-widest text-blue-100'>Homelink AI Insight</span>
            </div>
            <p className='text-sm text-white/90'>
              Tiền mặt: sau khi xác nhận, chuyển sang trang hoàn tất. Chuyển khoản: hệ thống tự làm mới trạng thái khi nhận được
              tiền (webhook ngân hàng).
            </p>
          </div>
        </div>
      </div>

      <div className='mt-8 flex flex-wrap gap-3'>
        <Link
          to='/payments'
          className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50'
        >
          <span className='material-symbols-outlined text-lg'>arrow_back</span>
          Về danh sách thanh toán
        </Link>
        {pending && !checkout && (
          <Link
            to={`/payments/${id}?checkout=1`}
            className='inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700'
          >
            Mở bước thanh toán
          </Link>
        )}
      </div>
    </div>
  )
}
