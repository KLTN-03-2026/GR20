import { useContext, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppContext } from 'src/contexts/app.context'
import { invoiceItemsApi } from 'src/apis/billing_api/invoice-items.api'
import { invoicesApi } from 'src/apis/billing_api/invoices.api'
import { paymentsApi } from 'src/apis/billing_api/payments.api'
import { meterReadingsApi } from 'src/apis/utility_api/meter-readings.api'
import { utilityMetersApi } from 'src/apis/utility_api/utility-meters.api'
import { utilityPricingApi } from 'src/apis/utility_api/utility-pricing.api'
import type { Invoice } from 'src/types/invoice.type'
import type { InvoiceItem } from 'src/types/invoice-item.type'
import type { UtilityMeter } from 'src/types/utility-meter.type'
import { formatVnd, invoiceStatusBadgeClass, invoiceStatusVi } from 'src/utils/billing-ui'
import { formatDateViVN } from 'src/utils/date-vi'
import { getPaymentApiErrorMessage } from 'src/utils/payment-console-log'
import {
  formatInvoicePeriodLabel,
  meterTypeVi,
  nearestPaidInvoiceBefore,
  sortInvoicesByPeriodDesc
} from 'src/utils/invoice-period-helpers'

type MeterRow = {
  id?: string
  meterId?: number
  readingDate?: string
  previousReading?: number
  currentReading?: number
  consumption?: number
}

type UtilityMeterRow = { id?: string | number; meterType?: string; meterCode?: string }

type PricingRow = { id?: string; meterType?: string; unit?: string; pricePerUnit?: number }

export default function UserInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const wantPay = searchParams.get('pay') === '1'
  const { user } = useContext(AppContext)
  const userId = String((user as any)?.id || (user as any)?._id || '')
  const invoiceId = id ?? ''

  const invoiceQuery = useQuery({
    queryKey: ['user-invoice-detail', userId, invoiceId],
    queryFn: () => invoicesApi.getByUserIdAndInvoiceId(userId, String(invoiceId)),
    enabled: Boolean(userId && invoiceId)
  })

  const inv = invoiceQuery.data?.data?.data ?? null
  const invPending = String(inv?.status || '').toUpperCase() === 'PENDING'

  const paymentByInvoiceQuery = useQuery({
    queryKey: ['payment-by-invoice', invoiceId],
    queryFn: async () => {
      try {
        const r = await paymentsApi.getByInvoiceId(String(invoiceId))
        const row = r.data?.data as { id?: string | number; status?: string } | undefined
        if (row && String(row.status || '').toUpperCase() === 'PENDING') return row
        return null
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 404) return null
        throw err
      }
    },
    enabled: Boolean(invoiceId && invPending),
    retry: false
  })
  const pendingPaymentId =
    paymentByInvoiceQuery.data?.id != null ? String(paymentByInvoiceQuery.data.id) : ''

  useEffect(() => {
    if (wantPay && pendingPaymentId) {
      navigate(`/payments/${pendingPaymentId}?checkout=1`, { replace: true })
    }
  }, [wantPay, pendingPaymentId, navigate])

  const itemsQuery = useQuery({
    queryKey: ['invoice-items', invoiceId],
    queryFn: () => invoiceItemsApi.getByInvoiceId(String(invoiceId)),
    enabled: Boolean(inv && invoiceId)
  })

  const aptId = inv?.apartmentId != null ? Number(inv.apartmentId) : NaN
  const billM = inv?.billingMonth != null ? Number(inv.billingMonth) : NaN
  const billY = inv?.billingYear != null ? Number(inv.billingYear) : NaN
  const hasPeriod =
    Number.isFinite(aptId) &&
    aptId > 0 &&
    Number.isFinite(billM) &&
    billM >= 1 &&
    billM <= 12 &&
    Number.isFinite(billY) &&
    billY >= 2000 &&
    billY <= 2100
  const aptOkForList = Boolean(inv && Number.isFinite(aptId) && aptId > 0)

  const { data: myInvoicesSameApt = [], isLoading: myInvoicesLoading } = useQuery({
    queryKey: ['user-invoices-same-apt-for-detail', userId, aptId],
    queryFn: async () => {
      const size = 100
      const merged: Invoice[] = []
      let page = 0
      let totalPages = 1
      while (page < totalPages && page < 30) {
        const r = await invoicesApi.getByUserId(userId, { page, size })
        const body = r.data
        const batch = (body?.data as Invoice[] | undefined) ?? []
        merged.push(...batch)
        totalPages = Math.max(1, Number(body?.totalPages ?? 1))
        page += 1
        if (batch.length === 0) break
      }
      return merged.filter((x) => Number(x.apartmentId) === aptId)
    },
    enabled: Boolean(userId && aptOkForList)
  })

  const nearestPaidBefore = useMemo(
    () => (inv ? nearestPaidInvoiceBefore(myInvoicesSameApt, inv) : null),
    [myInvoicesSameApt, inv]
  )
  const invoicesByPeriodDesc = useMemo(() => sortInvoicesByPeriodDesc(myInvoicesSameApt), [myInvoicesSameApt])

  const pricingQuery = useQuery({
    queryKey: ['active-utility-pricing', 'user-invoice', invoiceId],
    queryFn: () => utilityPricingApi.getActive(),
    enabled: Boolean(inv && hasPeriod)
  })

  const readingsQuery = useQuery({
    queryKey: ['user-invoice-meter-readings', userId, inv?.apartmentId, inv?.billingMonth, inv?.billingYear],
    queryFn: () =>
      meterReadingsApi.getByUserId(userId, {
        page: 0,
        size: 100,
        apartmentId: inv?.apartmentId != null ? Number(inv.apartmentId) : undefined,
        billingMonth: inv?.billingMonth != null ? Number(inv.billingMonth) : undefined,
        billingYear: inv?.billingYear != null ? Number(inv.billingYear) : undefined
      }),
    enabled: Boolean(userId && inv && hasPeriod)
  })

  const { data: metersRaw = [] } = useQuery({
    queryKey: ['user-utility-meters-invoice-detail', userId],
    queryFn: async () => {
      const r = await utilityMetersApi.getByUserId(userId, { page: 0, size: 100 })
      return (r.data?.data as UtilityMeter[]) ?? []
    },
    enabled: Boolean(userId && aptOkForList)
  })

  const meters: UtilityMeterRow[] = useMemo(
    () => metersRaw.filter((m) => Number(m.apartmentId) === aptId) as UtilityMeterRow[],
    [metersRaw, aptId]
  )

  const items: InvoiceItem[] = (itemsQuery.data?.data?.data as InvoiceItem[] | undefined) ?? []
  const pricing: PricingRow[] = (pricingQuery.data?.data?.data as PricingRow[] | undefined) ?? []
  const readings: MeterRow[] = (readingsQuery.data?.data?.data as MeterRow[] | undefined) ?? []

  const meterTypeById = useMemo(() => {
    const m = new Map<number, string>()
    for (const u of meters) {
      if (u.id != null && u.meterType) m.set(Number(u.id), String(u.meterType))
    }
    return m
  }, [meters])

  const priceByMeterType = useMemo(() => {
    const mp = new Map<string, number>()
    for (const p of pricing) {
      if (p.meterType) mp.set(String(p.meterType).toUpperCase(), Number(p.pricePerUnit) || 0)
    }
    return mp
  }, [pricing])

  const calcRows = useMemo(() => {
    return readings.map((r) => {
      const mid = r.meterId != null ? Number(r.meterId) : NaN
      const mt = meterTypeById.get(mid) || ''
      const unit = Number(r.consumption) || 0
      const ppu = priceByMeterType.get(String(mt).toUpperCase()) ?? 0
      const line = unit * ppu
      return { ...r, meterType: mt, unitPrice: ppu, lineTotal: line }
    })
  }, [readings, meterTypeById, priceByMeterType])

  const itemsSum = useMemo(() => Number(items.reduce((s, row) => s + Number(row.amount || 0), 0).toFixed(2)), [items])

  if (!userId) {
    return <div className='px-4 py-8 text-center text-slate-500'>Vui lòng đăng nhập.</div>
  }

  if (invoiceQuery.isLoading) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center text-slate-400'>
        <span className='material-symbols-outlined animate-spin'>sync</span>
        <span className='ml-2 text-sm'>Đang tải...</span>
      </div>
    )
  }

  if (!inv) {
    return (
      <div className='min-h-screen bg-slate-50 px-4 py-8 font-sans text-slate-900 sm:px-6 md:px-8'>
        <div className='mx-auto max-w-6xl pb-10'>
          <Link
            to='/invoices'
            className='inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline'
          >
            ← Hóa đơn của tôi
          </Link>
          <div className='mt-8 rounded-2xl border border-slate-100 bg-white py-16 text-center shadow-sm'>
            <span className='material-symbols-outlined mx-auto mb-4 block text-5xl text-slate-200'>receipt_long</span>
            <p className='font-semibold text-slate-700'>Không tìm thấy hóa đơn</p>
            <button
              type='button'
              className='mt-4 text-sm font-bold text-blue-600 hover:underline'
              onClick={() => navigate(-1)}
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50 px-4 py-8 font-sans text-slate-900 sm:px-6 md:px-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='flex flex-wrap items-center gap-x-6 gap-y-2'>
          <Link
            to='/invoices'
            className='inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline'
          >
            ← Hóa đơn của tôi
          </Link>
        </div>

        {inv && aptOkForList && (
          <div className='mt-4 flex flex-wrap gap-3'>
            {myInvoicesLoading ? (
              <span className='inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm'>
                Đang tải hóa đơn cùng căn…
              </span>
            ) : (
              <>
                {hasPeriod && nearestPaidBefore && String(nearestPaidBefore.id) !== String(invoiceId) && (
                  <Link
                    to={`/invoices/${encodeURIComponent(String(nearestPaidBefore.id))}`}
                    title='Hóa đơn đã thanh toán (PAID) có kỳ gần nhất trước kỳ đang xem.'
                    className='inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-100'
                  >
                    <span>Hóa đơn đã thanh toán gần nhất</span>
                    <span className='font-mono text-xs font-bold text-emerald-800'>
                      (kỳ {formatInvoicePeriodLabel(nearestPaidBefore)})
                    </span>
                  </Link>
                )}
                {hasPeriod && !nearestPaidBefore && !myInvoicesLoading && myInvoicesSameApt.length > 0 && (
                  <span className='inline-flex items-center rounded-lg border border-amber-100 bg-amber-50/90 px-4 py-2 text-sm text-amber-950'>
                    Không có hóa đơn <strong className='mx-1'>PAID</strong> nào ở kỳ trước kỳ đang xem (cùng căn).
                  </span>
                )}
              </>
            )}
            {!myInvoicesLoading && invoicesByPeriodDesc.length > 0 && (
              <details className='basis-full w-full max-w-lg rounded-lg border border-slate-200 bg-white text-sm shadow-sm'>
                <summary className='cursor-pointer select-none list-none px-4 py-2.5 font-semibold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden'>
                  Các kỳ của tôi (mới → cũ)
                </summary>
                <ol className='max-h-56 divide-y divide-slate-100 overflow-y-auto border-t border-slate-100'>
                  {invoicesByPeriodDesc.map((row) => {
                    const active = String(row.id) === String(invoiceId)
                    const st = String(row.status || '').toUpperCase()
                    return (
                      <li key={row.id} className='flex flex-wrap items-center justify-between gap-2 px-4 py-2'>
                        <Link
                          to={`/invoices/${encodeURIComponent(String(row.id))}`}
                          className={`font-mono text-sm ${active ? 'font-bold text-blue-700' : 'text-slate-800 hover:underline'}`}
                        >
                          Kỳ {formatInvoicePeriodLabel(row)}
                          {active ? ' · đang xem' : ''}
                        </Link>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${invoiceStatusBadgeClass(row.status)}`}
                        >
                          {invoiceStatusVi[st as keyof typeof invoiceStatusVi] || row.status}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </details>
            )}
            {hasPeriod && (
              <a
                href='#muc-2-chi-so-thang'
                className='inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-100'
              >
                Nhảy tới chỉ số kỳ này
              </a>
            )}
          </div>
        )}

        <div className='mt-6 border-b border-slate-200/80 pb-8'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100'>
              Chi tiết hóa đơn
            </span>
            <span className='rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600'>#{invoiceId}</span>
          </div>
          <h1 className='mt-3 text-3xl font-extrabold tracking-tight md:text-4xl'>
            {inv.invoiceCode || `Hóa đơn #${invoiceId}`}
          </h1>
          <p className='mt-2 max-w-2xl text-sm text-slate-600'>
            Trang này gom <strong>giá điện/nước đang áp dụng</strong>, <strong>chỉ số kỳ hóa đơn</strong> và{' '}
            <strong>cách tính tiền ước lượng</strong> giúp bạn so sánh với tổng và từng dòng trên hóa đơn.
          </p>
          {hasPeriod && (
            <nav className='mt-4 flex flex-wrap gap-2 text-sm'>
              <a
                href='#muc-1-gia-dien-nuoc'
                className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm hover:bg-slate-50'
              >
                1. Giá điện / nước
              </a>
              <a
                href='#muc-2-chi-so-thang'
                className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm hover:bg-slate-50'
              >
                2. Chỉ số tháng
              </a>
              <a
                href='#muc-3-cach-tinh-tien'
                className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm hover:bg-slate-50'
              >
                3. Cách tính tiền
              </a>
            </nav>
          )}
        </div>

        <div className='mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
          <dl className='grid grid-cols-1 gap-5 text-sm md:grid-cols-2'>
            <div>
              <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Căn hộ</dt>
              <dd className='mt-1 font-medium text-slate-900'>Mã căn ID {inv.apartmentId}</dd>
            </div>
            <div>
              <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Kỳ thanh toán</dt>
              <dd className='mt-1 font-medium text-slate-900'>
                {inv.billingMonth != null && inv.billingYear != null
                  ? `Tháng ${inv.billingMonth}/${inv.billingYear}`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Trạng thái</dt>
              <dd className='mt-2'>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${invoiceStatusBadgeClass(inv.status)}`}
                >
                  {invoiceStatusVi[String(inv.status || '').toUpperCase()] || inv.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Tổng tiền hóa đơn</dt>
              <dd className='mt-1 text-2xl font-bold tabular-nums text-slate-900'>{formatVnd(inv.totalAmount)}</dd>
            </div>
            {inv.dueDate && (
              <div className='md:col-span-2'>
                <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Hạn thanh toán</dt>
                <dd className='mt-1 text-slate-900'>{formatDateViVN(inv.dueDate)}</dd>
              </div>
            )}
          </dl>
        </div>
        {hasPeriod && (
          <div className='mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
            {/* HEADER */}
            <div className='border-b border-slate-200 bg-gradient-to-r from-blue-50 to-emerald-50 px-6 py-5'>
              <h2 className='text-2xl font-extrabold text-slate-900'>Thông tin điện / nước kỳ này</h2>

              <p className='mt-1 text-sm text-slate-600'>
                Kỳ{' '}
                <strong>
                  {billM}/{billY}
                </strong>{' '}
                — căn hộ <strong>#{aptId}</strong>
              </p>
            </div>

            <div className='space-y-8 p-6'>
              {/* ================= GIÁ ================= */}
              <section>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 font-bold text-white'>
                    1
                  </div>

                  <div>
                    <h3 className='text-lg font-bold text-slate-900'>Giá điện — nước</h3>

                    <p className='text-sm text-slate-500'>Đơn giá đang áp dụng theo từng loại đồng hồ.</p>
                  </div>
                </div>

                <div className='overflow-x-auto rounded-xl border border-slate-100'>
                  <table className='w-full min-w-[480px] border-collapse text-left text-sm'>
                    <thead>
                      <tr className='border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase text-slate-500'>
                        <th className='px-4 py-3'>Loại</th>
                        <th className='px-4 py-3'>Đơn vị</th>
                        <th className='px-4 py-3 text-right'>Đơn giá</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pricing.map((p) => (
                        <tr key={String(p.id)} className='border-b border-slate-50'>
                          <td className='px-4 py-3 font-medium text-slate-900'>{meterTypeVi(p.meterType)}</td>

                          <td className='px-4 py-3 text-slate-700'>{p.unit || '—'}</td>

                          <td className='px-4 py-3 text-right font-semibold tabular-nums'>
                            {formatVnd(Number(p.pricePerUnit) || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ================= CHỈ SỐ ================= */}
              <section>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white'>
                    2
                  </div>

                  <div>
                    <h3 className='text-lg font-bold text-slate-900'>Chỉ số kỳ hóa đơn</h3>

                    <p className='text-sm text-slate-500'>Chỉ số tiêu thụ theo từng đồng hồ.</p>
                  </div>
                </div>

                <div className='overflow-x-auto rounded-xl border border-slate-100'>
                  <table className='w-full min-w-[640px] border-collapse text-left text-sm'>
                    <thead>
                      <tr className='border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase text-slate-500'>
                        <th className='px-6 py-3'>Đồng hồ</th>
                        <th className='px-6 py-3'>Loại</th>
                        <th className='px-6 py-3'>Ngày ghi</th>
                        <th className='px-6 py-3 text-right'>Cũ</th>
                        <th className='px-6 py-3 text-right'>Mới</th>
                        <th className='px-6 py-3 text-right'>Tiêu thụ</th>
                      </tr>
                    </thead>

                    <tbody className='text-slate-800'>
                      {readings.map((r) => {
                        const mid = r.meterId != null ? String(r.meterId) : '—'

                        const mt = r.meterId != null ? meterTypeVi(meterTypeById.get(Number(r.meterId))) : '—'

                        return (
                          <tr key={String(r.id)} className='border-b border-slate-50'>
                            <td className='px-6 py-3 font-mono text-xs'>#{mid}</td>

                            <td className='px-6 py-3'>{mt}</td>

                            <td className='px-6 py-3 tabular-nums'>
                              {r.readingDate ? formatDateViVN(r.readingDate) : '—'}
                            </td>

                            <td className='px-6 py-3 text-right tabular-nums'>{r.previousReading ?? '—'}</td>

                            <td className='px-6 py-3 text-right tabular-nums'>{r.currentReading ?? '—'}</td>

                            <td className='px-6 py-3 text-right font-semibold tabular-nums'>{r.consumption ?? '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ================= CÁCH TÍNH ================= */}
              <section>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 font-bold text-white'>
                    3
                  </div>

                  <div>
                    <h3 className='text-lg font-bold text-slate-900'>Cách tính tiền</h3>

                    <p className='text-sm text-slate-500'>Công thức tính tiền điện / nước.</p>
                  </div>
                </div>

                <div className='overflow-x-auto rounded-xl border border-slate-100'>
                  <table className='w-full min-w-[520px] border-collapse text-left text-sm'>
                    <thead>
                      <tr className='border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase text-slate-500'>
                        <th className='px-4 py-3'>Loại</th>
                        <th className='px-4 py-3 text-right'>Tiêu thụ</th>
                        <th className='px-4 py-3 text-right'>Đơn giá</th>
                        <th className='px-4 py-3 text-right'>Thành tiền</th>
                      </tr>
                    </thead>

                    <tbody>
                      {calcRows.map((row) => (
                        <tr key={String(row.id)} className='border-b border-slate-50'>
                          <td className='px-4 py-3'>{meterTypeVi(row.meterType)}</td>

                          <td className='px-4 py-3 text-right tabular-nums'>{row.consumption ?? '—'}</td>

                          <td className='px-4 py-3 text-right tabular-nums'>{formatVnd(row.unitPrice)}</td>

                          <td className='px-4 py-3 text-right font-semibold tabular-nums'>
                            {formatVnd(row.lineTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        )}
        <div className='mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm'>
          <div className='border-b border-slate-100 px-6 py-4'>
            <h2 className='text-lg font-bold text-slate-900'>Dòng mục</h2>
            <p className='text-sm text-slate-500'>Mỗi dòng là một khoản đã cộng vào tổng hóa đơn.</p>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left text-sm'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500'>
                  <th className='px-6 py-4'>Tên mục</th>
                  <th className='px-6 py-4 text-right'>Số tiền</th>
                </tr>
              </thead>
              <tbody className='text-slate-800'>
                {itemsQuery.isLoading && (
                  <tr>
                    <td colSpan={2} className='px-6 py-6 text-slate-500'>
                      Đang tải…
                    </td>
                  </tr>
                )}
                {!itemsQuery.isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={2} className='px-6 py-6 text-slate-500'>
                      Chưa có mục hóa đơn.
                    </td>
                  </tr>
                )}
                {!itemsQuery.isLoading &&
                  items.map((row) => (
                    <tr key={row.id} className='border-b border-slate-50'>
                      <td className='px-6 py-4 font-medium'>{row.itemName}</td>
                      <td className='px-6 py-4 text-right tabular-nums font-medium'>{formatVnd(row.amount)}</td>
                    </tr>
                  ))}
              </tbody>
              {!itemsQuery.isLoading && items.length > 0 && (
                <tfoot>
                  <tr className='bg-slate-50/80'>
                    <td className='px-6 py-4 text-right text-sm font-semibold text-slate-700'>Cộng các mục</td>
                    <td className='px-6 py-4 text-right text-sm font-bold tabular-nums text-slate-900'>
                      {formatVnd(itemsSum)}
                    </td>
                  </tr>
                  {Math.abs(itemsSum - Number(inv.totalAmount || 0)) > 0.01 && (
                    <tr>
                      <td colSpan={2} className='px-6 py-3 text-right text-xs text-amber-700'>
                        Lưu ý: tổng các mục ({formatVnd(itemsSum)}) khác tổng trên hóa đơn ({formatVnd(inv.totalAmount)}
                        ).
                      </td>
                    </tr>
                  )}
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className='mt-6 flex flex-wrap gap-3'>
          <Link
            to='/invoices'
            className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50'
          >
            ← Về danh sách hóa đơn
          </Link>
          {invPending && paymentByInvoiceQuery.isError && (
            <div className='flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800'>
              <span>{getPaymentApiErrorMessage(paymentByInvoiceQuery.error, 'Không tải được phiếu thanh toán.')}</span>
              <button
                type='button'
                className='self-start text-xs font-bold text-blue-700 underline'
                onClick={() => paymentByInvoiceQuery.refetch()}
              >
                Thử lại
              </button>
            </div>
          )}
          {invPending && pendingPaymentId && (
            <Link
              to={`/payments/${pendingPaymentId}?checkout=1`}
              className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700'
            >
              Thanh toán
              <span className='material-symbols-outlined text-base'>payments</span>
            </Link>
          )}
          {invPending && !pendingPaymentId && paymentByInvoiceQuery.isFetching && (
            <span className='inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500'>
              Đang tải phiếu thanh toán…
            </span>
          )}
          {invPending && !paymentByInvoiceQuery.isError && !pendingPaymentId && !paymentByInvoiceQuery.isFetching && (
            <span className='text-sm text-amber-800'>
              Chưa có phiếu thanh toán cho hóa đơn này. Vui lòng liên hệ ban quản lý.
            </span>
          )}
          {!invPending && (
            <Link
              to='/payments'
              className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50'
            >
              Lịch sử thanh toán
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
