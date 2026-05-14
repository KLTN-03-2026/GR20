import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { invoicesApi } from 'src/apis/billing_api/invoices.api'
import { invoiceItemsApi } from 'src/apis/billing_api/invoice-items.api'
import { meterReadingsApi } from 'src/apis/utility_api/meter-readings.api'
import { utilityMetersApi } from 'src/apis/utility_api/utility-meters.api'
import { utilityPricingApi } from 'src/apis/utility_api/utility-pricing.api'
import type { Invoice } from 'src/types/invoice.type'
import type { InvoiceItem } from 'src/types/invoice-item.type'
import {
  formatVnd,
  invoiceStatusBadgeClass,
  invoiceStatusVi
} from 'src/utils/billing-ui'
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

export default function InvoiceDetailAdminPage() {
  const { id } = useParams<{ id: string }>()
  const invoiceId = id ?? ''

  const {
    data: invoiceRes,
    isLoading: invoiceLoading,
    isError: invoiceError
  } = useQuery({
    queryKey: ['invoice-detail-admin', invoiceId],
    queryFn: () => invoicesApi.getById(invoiceId),
    enabled: Boolean(invoiceId)
  })

  const { data: itemsRes, isLoading: itemsLoading } = useQuery({
    queryKey: ['invoice-items-by-invoice', invoiceId],
    queryFn: () => invoiceItemsApi.getByInvoiceId(invoiceId),
    enabled: Boolean(invoiceId)
  })

  const invoice = invoiceRes?.data?.data
  const items: InvoiceItem[] = itemsRes?.data?.data || []

  const aptId = invoice?.apartmentId != null ? Number(invoice.apartmentId) : NaN
  const billM = invoice?.billingMonth != null ? Number(invoice.billingMonth) : NaN
  const billY = invoice?.billingYear != null ? Number(invoice.billingYear) : NaN
  const hasPeriod =
    Number.isFinite(aptId) &&
    aptId > 0 &&
    Number.isFinite(billM) &&
    billM >= 1 &&
    billM <= 12 &&
    Number.isFinite(billY) &&
    billY >= 2000 &&
    billY <= 2100
  const aptOkForList = Boolean(invoice && Number.isFinite(aptId) && aptId > 0)

  const { data: aptInvoices = [], isLoading: aptInvoicesLoading } = useQuery({
    queryKey: ['invoices-same-apartment-admin', aptId],
    queryFn: async () => {
      const size = 100
      const merged: Invoice[] = []
      let page = 0
      let totalPages = 1
      while (page < totalPages && page < 30) {
        const r = await invoicesApi.getAll({ apartmentId: aptId, page, size })
        const body = r.data
        const batch = (body?.data as Invoice[] | undefined) ?? []
        merged.push(...batch)
        totalPages = Math.max(1, Number(body?.totalPages ?? 1))
        page += 1
        if (batch.length === 0) break
      }
      return merged
    },
    enabled: aptOkForList
  })
  const nearestPaidBefore = useMemo(
    () => (invoice ? nearestPaidInvoiceBefore(aptInvoices, invoice) : null),
    [aptInvoices, invoice]
  )
  const invoicesByPeriodDesc = useMemo(() => sortInvoicesByPeriodDesc(aptInvoices), [aptInvoices])

  const { data: pricingRes, isLoading: pricingLoading } = useQuery({
    queryKey: ['active-utility-pricing', 'invoice-admin', invoiceId],
    queryFn: () => utilityPricingApi.getActive(),
    enabled: Boolean(invoice && hasPeriod)
  })

  const { data: readingsRes, isLoading: readingsLoading } = useQuery({
    queryKey: ['meter-readings-invoice-admin', invoiceId, aptId, billM, billY],
    queryFn: () =>
      meterReadingsApi.getAll({
        page: 0,
        size: 100,
        apartmentId: aptId,
        billingMonth: billM,
        billingYear: billY
      }),
    enabled: Boolean(invoice && hasPeriod)
  })

  const { data: metersRes } = useQuery({
    queryKey: ['utility-meters-invoice-admin', aptId],
    queryFn: () => utilityMetersApi.getAll({ apartmentId: aptId, size: 100 }),
    enabled: Boolean(invoice && hasPeriod)
  })

  const readings: MeterRow[] = (readingsRes?.data?.data as MeterRow[] | undefined) ?? []
  const meters: UtilityMeterRow[] = (metersRes?.data?.data as UtilityMeterRow[] | undefined) ?? []
  const pricing: PricingRow[] = (pricingRes?.data?.data as PricingRow[] | undefined) ?? []

  const meterTypeById = useMemo(() => {
    const m = new Map<number, string>()
    for (const u of meters) {
      if (u.id != null && u.meterType) m.set(Number(u.id), String(u.meterType))
    }
    return m
  }, [meters])

  const priceByMeterType = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of pricing) {
      if (p.meterType) m.set(String(p.meterType).toUpperCase(), Number(p.pricePerUnit) || 0)
    }
    return m
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

  const itemsSum = useMemo(
    () => Number(items.reduce((s, row) => s + Number(row.amount || 0), 0).toFixed(2)),
    [items]
  )

  return (
    <div className='min-h-screen bg-slate-50 px-6 py-8 font-sans text-slate-900 md:px-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='flex flex-wrap items-center gap-x-6 gap-y-2'>
          <Link
            to='/admin/invoices'
            className='inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline'
          >
            ← Quản lý hóa đơn
          </Link>
        </div>

        {invoice && aptOkForList && (
          <div className='mt-4 flex flex-wrap gap-3'>
            {aptInvoicesLoading ? (
              <span className='inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm'>
                Đang tải hóa đơn cùng căn…
              </span>
            ) : (
              <>
                {hasPeriod && nearestPaidBefore && (
                  <Link
                    to={`/admin/invoices/${encodeURIComponent(String(nearestPaidBefore.id))}`}
                    title='Hóa đơn đã thanh toán (PAID) có kỳ gần nhất nhưng vẫn trước kỳ đang xem — ví dụ đang xem tháng 2 thì nhảy tháng 1 nếu tháng 1 đã PAID.'
                    className='inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-100'
                  >
                    <span>Hóa đơn đã thanh toán gần nhất</span>
                    <span className='font-mono text-xs font-bold text-emerald-800'>
                      (kỳ {formatInvoicePeriodLabel(nearestPaidBefore)})
                    </span>
                  </Link>
                )}
                {hasPeriod && !nearestPaidBefore && !aptInvoicesLoading && aptInvoices.length > 0 && (
                  <span className='inline-flex items-center rounded-lg border border-amber-100 bg-amber-50/90 px-4 py-2 text-sm text-amber-950'>
                    Không có hóa đơn <strong className='mx-1'>PAID</strong> nào ở kỳ trước kỳ đang xem (cùng căn).
                  </span>
                )}
              </>
            )}
            {!aptInvoicesLoading && invoicesByPeriodDesc.length > 0 && (
              <details className='basis-full w-full max-w-lg rounded-lg border border-slate-200 bg-white text-sm shadow-sm'>
                <summary className='cursor-pointer select-none list-none px-4 py-2.5 font-semibold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden'>
                  Các kỳ cùng căn (mới → cũ)
                </summary>
                <ol className='max-h-56 divide-y divide-slate-100 overflow-y-auto border-t border-slate-100'>
                  {invoicesByPeriodDesc.map((inv) => {
                    const active = String(inv.id) === String(invoiceId)
                    const st = String(inv.status || '').toUpperCase()
                    return (
                      <li key={inv.id} className='flex flex-wrap items-center justify-between gap-2 px-4 py-2'>
                        <Link
                          to={`/admin/invoices/${encodeURIComponent(String(inv.id))}`}
                          className={`font-mono text-sm ${active ? 'font-bold text-blue-700' : 'text-slate-800 hover:underline'}`}
                        >
                          Kỳ {formatInvoicePeriodLabel(inv)}
                          {active ? ' · đang xem' : ''}
                        </Link>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${invoiceStatusBadgeClass(inv.status)}`}
                        >
                          {invoiceStatusVi[st as keyof typeof invoiceStatusVi] || inv.status}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </details>
            )}
            {hasPeriod && (
              <>
                <a
                  href='#muc-2-chi-so-thang'
                  className='inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-100'
                >
                  Nhảy tới chỉ số kỳ này
                </a>
                <Link
                  to='/admin/meter-readings'
                  className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50'
                >
                  Nhập / sửa chỉ số (trang riêng) →
                </Link>
                <Link
                  to='/admin/utility-meters'
                  className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50'
                >
                  Quản lý đồng hồ →
                </Link>
              </>
            )}
          </div>
        )}

        <div className='mt-6 border-b border-slate-200/80 pb-8'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100'>
              Chi tiết hóa đơn
            </span>
            {invoiceId ? (
              <span className='rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600'>#{invoiceId}</span>
            ) : null}
          </div>
          <h1 className='mt-3 text-3xl font-extrabold tracking-tight md:text-4xl'>
            {invoice?.invoiceCode || (invoiceId ? `Hóa đơn #${invoiceId}` : 'Hóa đơn')}
          </h1>
          <p className='mt-2 max-w-2xl text-sm text-slate-600'>
            Trang này gom <strong>giá điện/nước chung</strong>, <strong>chỉ số kỳ hóa đơn</strong> và <strong>cách tính tiền</strong> trên
            một màn hình.
          </p>
          {invoice != null && hasPeriod && (
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

        {(invoiceLoading || invoiceError || !invoice) && (
          <div className='mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
            <p className={invoiceError ? 'text-red-600' : 'text-slate-600'}>
              {invoiceError ? 'Không tải được hóa đơn.' : invoiceLoading ? 'Đang tải…' : 'Không có dữ liệu.'}
            </p>
          </div>
        )}

        {invoice && (
          <>
            <div className='mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
              <dl className='grid grid-cols-1 gap-5 text-sm md:grid-cols-2'>
                <div>
                  <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Căn hộ</dt>
                  <dd className='mt-1 font-medium text-slate-900'>Mã căn ID {invoice.apartmentId}</dd>
                </div>
                <div>
                  <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Kỳ thanh toán</dt>
                  <dd className='mt-1 font-medium text-slate-900'>
                    Tháng {invoice.billingMonth}/{invoice.billingYear}
                  </dd>
                </div>
                <div>
                  <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Trạng thái</dt>
                  <dd className='mt-2'>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${invoiceStatusBadgeClass(invoice.status)}`}
                    >
                      {invoiceStatusVi[String(invoice.status || '').toUpperCase()] || invoice.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Tổng tiền hóa đơn</dt>
                  <dd className='mt-1 text-2xl font-bold tabular-nums text-slate-900'>{formatVnd(invoice.totalAmount)}</dd>
                </div>
                {invoice.dueDate && (
                  <div className='md:col-span-2'>
                    <dt className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Hạn thanh toán</dt>
                    <dd className='mt-1 text-slate-900'>{String(invoice.dueDate).slice(0, 10)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {hasPeriod && (
              <div className='mt-8 space-y-8'>
                <section id='muc-1-gia-dien-nuoc' className='scroll-mt-24 overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-white shadow-sm'>
                  <div className='border-b border-amber-100 px-6 py-4'>
                    <h2 className='text-lg font-extrabold text-slate-900'>
                      <span className='mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white'>
                        1
                      </span>
                      Giá điện — nước chung (đơn giá đang áp dụng)
                    </h2>
                    <p className='mt-1 text-sm text-slate-600'>
                      Đơn giá dùng nhân với tiêu thụ chỉ số (theo loại đồng hồ) khi lập dòng tiện ích trên hóa đơn.
                    </p>
                  </div>
                  <div className='overflow-x-auto px-2 pb-4 pt-2'>
                    {pricingLoading ? (
                      <p className='px-4 py-6 text-sm text-slate-500'>Đang tải bảng giá…</p>
                    ) : pricing.length === 0 ? (
                      <p className='px-4 py-6 text-sm text-amber-900'>Chưa có bản giá ACTIVE trong hệ thống.</p>
                    ) : (
                      <table className='w-full min-w-[480px] border-collapse text-left text-sm'>
                        <thead>
                          <tr className='border-b border-slate-100 text-xs font-bold uppercase text-slate-500'>
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
                    )}
                  </div>
                </section>

                <section id='muc-2-chi-so-thang' className='scroll-mt-24 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm'>
                  <div className='border-b border-blue-100 bg-blue-50/50 px-6 py-4'>
                    <h2 className='text-lg font-extrabold text-slate-900'>
                      <span className='mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white'>
                        2
                      </span>
                      Chỉ số tháng mới (kỳ hóa đơn {billM}/{billY}, căn #{aptId})
                    </h2>
                    <p className='mt-1 text-sm text-slate-600'>
                      Các bản ghi chỉ số có <strong>ngày ghi</strong> thuộc tháng/năm trùng kỳ hóa đơn (theo bộ lọc hệ thống).
                    </p>
                  </div>
                  <div className='overflow-x-auto'>
                    {readingsLoading ? (
                      <p className='px-6 py-8 text-sm text-slate-500'>Đang tải chỉ số…</p>
                    ) : readings.length === 0 ? (
                      <p className='px-6 py-8 text-sm text-slate-600'>
                        Chưa có chỉ số cho kỳ này. Dùng liên kết phía trên để mở trang nhập chỉ số nếu cần.
                      </p>
                    ) : (
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
                                  {r.readingDate ? new Date(r.readingDate).toLocaleDateString('vi-VN') : '—'}
                                </td>
                                <td className='px-6 py-3 text-right tabular-nums'>{r.previousReading ?? '—'}</td>
                                <td className='px-6 py-3 text-right tabular-nums'>{r.currentReading ?? '—'}</td>
                                <td className='px-6 py-3 text-right font-semibold tabular-nums'>{r.consumption ?? '—'}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </section>

                <section id='muc-3-cach-tinh-tien' className='scroll-mt-24 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white shadow-sm'>
                  <div className='border-b border-emerald-100 px-6 py-4'>
                    <h2 className='text-lg font-extrabold text-slate-900'>
                      <span className='mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white'>
                        3
                      </span>
                      Cách tính tiền điện / nước (tóm tắt nhanh)
                    </h2>
                    <p className='mt-1 text-sm text-slate-600'>
                      Hệ thống dùng cùng một logic cho dòng tiện ích trên hóa đơn (trừ khi chỉnh tay tổng tiền).
                    </p>
                  </div>
                  <div className='space-y-4 px-6 py-5 text-sm text-slate-800'>
                    <ol className='list-decimal space-y-2 pl-5'>
                      <li>
                        <strong>Tiêu thụ</strong> = chỉ số mới − chỉ số cũ (cùng một lần ghi trong kỳ).
                      </li>
                      <li>
                        <strong>Tiền một loại</strong> = tiêu thụ × đơn giá ở mục 1 (đúng loại ELECTRIC / WATER / GAS).
                      </li>
                      <li>
                        <strong>Tổng hóa đơn</strong> = tổng các dòng mục (tiện ích + tiền thuê tháng nếu có hợp đồng RENT
                        hiệu lực).
                      </li>
                    </ol>
                    {calcRows.length > 0 && (
                      <div className='overflow-x-auto rounded-xl border border-slate-100 bg-white'>
                        <table className='w-full min-w-[520px] border-collapse text-left text-sm'>
                          <thead>
                            <tr className='border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase text-slate-500'>
                              <th className='px-4 py-3'>Loại</th>
                              <th className='px-4 py-3 text-right'>Tiêu thụ</th>
                              <th className='px-4 py-3 text-right'>Đơn giá</th>
                              <th className='px-4 py-3 text-right'>Tiền (= TT × ĐG)</th>
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
                    )}
                    <p className='text-xs text-slate-500'>
                      Số tiền ước tính trên chỉ để tham khảo; giá trị chính thức nằm ở bảng dòng mục hóa đơn bên dưới.
                    </p>
                  </div>
                </section>
              </div>
            )}

            <div className='mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm'>
              <div className='border-b border-slate-100 px-6 py-4'>
                <h2 className='text-lg font-bold text-slate-900'>Dòng mục (invoice items)</h2>
                <p className='text-sm text-slate-500'>
                  Mỗi dòng là một khoản đã cộng vào tổng; hệ thống lưu tổng trên bảng hóa đơn sau khi tạo các dòng.
                </p>
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
                    {itemsLoading && (
                      <tr>
                        <td colSpan={2} className='px-6 py-6 text-slate-500'>
                          Đang tải…
                        </td>
                      </tr>
                    )}
                    {!itemsLoading && items.length === 0 && (
                      <tr>
                        <td colSpan={2} className='px-6 py-6 text-slate-500'>
                          Chưa có mục hóa đơn.
                        </td>
                      </tr>
                    )}
                    {!itemsLoading &&
                      items.map((row) => (
                        <tr key={row.id} className='border-b border-slate-50'>
                          <td className='px-6 py-4 font-medium'>{row.itemName}</td>
                          <td className='px-6 py-4 text-right tabular-nums font-medium'>{formatVnd(row.amount)}</td>
                        </tr>
                      ))}
                  </tbody>
                  {!itemsLoading && items.length > 0 && (
                    <tfoot>
                      <tr className='bg-slate-50/80'>
                        <td className='px-6 py-4 text-right text-sm font-semibold text-slate-700'>Cộng các mục</td>
                        <td className='px-6 py-4 text-right text-sm font-bold tabular-nums text-slate-900'>
                          {formatVnd(itemsSum)}
                        </td>
                      </tr>
                      {Math.abs(itemsSum - Number(invoice.totalAmount || 0)) > 0.01 && (
                        <tr>
                          <td colSpan={2} className='px-6 py-3 text-right text-xs text-amber-700'>
                            Lưu ý: tổng các mục ({formatVnd(itemsSum)}) khác tổng trên hóa đơn ({formatVnd(invoice.totalAmount)}).
                          </td>
                        </tr>
                      )}
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
