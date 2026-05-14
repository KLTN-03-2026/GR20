import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { invoicesApi } from 'src/apis/billing_api/invoices.api'
import { meterReadingsApi } from 'src/apis/utility_api/meter-readings.api'
import { utilityMetersApi } from 'src/apis/utility_api/utility-meters.api'
import { utilityPricingApi } from 'src/apis/utility_api/utility-pricing.api'
import type { Invoice } from 'src/types/invoice.type'
import { logResourceConsoleError } from 'src/utils/payment-console-log'
import {
  formatVnd,
  invoiceStatusBadgeClass,
  invoiceStatusVi
} from 'src/utils/billing-ui'
import {
  ROW_ACTION_DELETE,
  ROW_ACTION_EDIT,
  ROW_ACTION_RESTORE
} from 'src/utils/row-action-buttons'

const getApiErrorMessage = (err: any, fallbackMessage: string) => {
  const apiErr = err?.response?.data
  const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
  if (typeof rawMessage !== 'string') return fallbackMessage

  const translatedMessages: Array<[string, string]> = [
    ['Validation failed', 'Dữ liệu không hợp lệ'],
    ['billingMonth and billingYear must be provided together', 'Tháng và năm lập hóa đơn phải được nhập cùng nhau'],
    ['Invalid meterId', 'Đồng hồ không hợp lệ'],
    ['Meter reading not found', 'Không tìm thấy bản ghi chỉ số'],
    ['Căn hộ đang có cư dân', 'Căn hộ đang có cư dân, không được xóa chỉ số công tơ.'],
    ['currentReading must be greater than or equal to previousReading', 'Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ'],
    ['Invoice not found or not cancelled', 'Không tìm thấy hóa đơn đã xóa để khôi phục'],
    ['Invoice not found', 'Không tìm thấy hóa đơn']
  ]
  const mapped = translatedMessages.find(([en]) => rawMessage.includes(en))
  return mapped?.[1] || rawMessage
}

const logApiSuccess = (action: string, response: any) => {
  console.log(`[Invoices][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

type MeterReadingRow = { id?: string; consumption?: number }

function summarizeReadings(rows: MeterReadingRow[] | undefined) {
  if (!rows?.length) return { count: 0, sumTT: 0 }
  const sumTT = rows.reduce((s, r) => s + (Number(r.consumption) || 0), 0)
  return { count: rows.length, sumTT }
}

export default function InvoicesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pageSize = 10
  const [page, setPage] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [aptForReading, setAptForReading] = useState('')
  const [billMForReading, setBillMForReading] = useState(String(new Date().getMonth() + 1))
  const [billYForReading, setBillYForReading] = useState(String(new Date().getFullYear()))
  const [cMeter, setCMeter] = useState('')
  const [cDate, setCDate] = useState('')
  const [cPrev, setCPrev] = useState('')
  const [cCurr, setCCurr] = useState('')

  const aptNum = aptForReading.trim() !== '' && !Number.isNaN(Number(aptForReading)) ? Number(aptForReading) : NaN

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['invoices', page],
    queryFn: async () => {
      const response = await invoicesApi.getAll({ page, size: pageSize })
      logApiSuccess('GetAll', response)
      return response
    }
  })
  const list = (data?.data?.data || []) as Invoice[]
  const totalPages = Number(data?.data?.totalPages || 0)
  const currentPage = Number(data?.data?.page || 0)

  const readingQueries = useQueries({
    queries: list.map((item) => ({
      queryKey: ['invoice-row-readings', item.id, item.apartmentId, item.billingMonth, item.billingYear],
      queryFn: async () => {
        const r = await meterReadingsApi.getAll({
          page: 0,
          size: 100,
          apartmentId: Number(item.apartmentId),
          billingMonth: Number(item.billingMonth),
          billingYear: Number(item.billingYear)
        })
        return (r.data?.data as MeterReadingRow[] | undefined) ?? []
      },
      enabled: (() => {
        if (isLoading || isError) return false
        const apt = Number(item.apartmentId)
        const bm = Number(item.billingMonth)
        const by = Number(item.billingYear)
        return (
          Number.isFinite(apt) &&
          apt > 0 &&
          Number.isFinite(bm) &&
          bm >= 1 &&
          bm <= 12 &&
          Number.isFinite(by) &&
          by >= 2000 &&
          by <= 2100
        )
      })()
    }))
  })

  const { data: metersFormData } = useQuery({
    queryKey: ['utility-meters-invoices-form', aptNum],
    queryFn: async () => {
      const r = await utilityMetersApi.getAll({ apartmentId: aptNum, status: 'ACTIVE', size: 100 })
      return r
    },
    enabled: Number.isFinite(aptNum) && aptNum > 0
  })

  const { data: pricingFormData } = useQuery({
    queryKey: ['active-utility-pricing-invoices-form'],
    queryFn: () => utilityPricingApi.getActive()
  })

  const metersForm = metersFormData?.data?.data || []
  const pricingForm = (pricingFormData?.data?.data || []) as { meterType?: string; pricePerUnit?: number; unit?: string }[]

  const meterLabel = (meterId: string | number) => {
    const m = metersForm.find((x) => String(x.id) === String(meterId))
    if (!m) return `Đồng hồ #${meterId}`
    return `${m.meterCode ?? '—'} · ${m.meterType ?? '—'}`
  }

  useEffect(() => {
    const m = Number(billMForReading)
    const y = Number(billYForReading)
    if (!Number.isFinite(m) || !Number.isFinite(y) || m < 1 || m > 12) return
    const pad = (n: number) => String(n).padStart(2, '0')
    setCDate(`${y}-${pad(m)}-05`)
  }, [billMForReading, billYForReading])

  const suggestQuery = useQuery({
    queryKey: ['meter-suggest-prev-invoices', cMeter, cDate],
    queryFn: async () => {
      const response = await meterReadingsApi.suggestPrevious({
        meterId: Number(cMeter),
        readingDate: cDate
      })
      const v = (response.data as { data?: { previousReading?: number | null } })?.data?.previousReading
      return v == null ? null : Number(v)
    },
    enabled: Boolean(cMeter && cDate && /^\d{4}-\d{2}-\d{2}$/.test(cDate))
  })

  useEffect(() => {
    if (suggestQuery.data == null || Number.isNaN(suggestQuery.data)) return
    setCPrev(String(suggestQuery.data))
  }, [suggestQuery.data])

  const createReadingMutation = useMutation({
    mutationFn: (payload: { meterId: number; readingDate: string; previousReading: number; currentReading: number }) =>
      meterReadingsApi.create(payload),
    onSuccess: (response) => {
      logApiSuccess('CreateReading', response)
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-row-readings'] })
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-items-by-invoice'] })
      setErrorMsg(null)
      setSuccessMsg('Đã lưu chỉ số. Hệ thống đã tạo/cập nhật hóa đơn kỳ tương ứng (theo căn + tháng ghi chỉ số).')
      setCMeter('')
      setCPrev('')
      setCCurr('')
    },
    onError: (err: any) => {
      logResourceConsoleError('Invoices', 'CreateReading', err)
      setSuccessMsg(null)
      setErrorMsg(getApiErrorMessage(err, 'Lưu chỉ số thất bại'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-row-readings'] })
      setErrorMsg(null)
    },
    onError: (err: any) => {
      logResourceConsoleError('Invoices', 'Delete', err)
      setErrorMsg(getApiErrorMessage(err, 'Xóa hóa đơn thất bại'))
    }
  })
  const restoreMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.restore(id),
    onSuccess: (response) => {
      logApiSuccess('Restore', response)
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-row-readings'] })
      setErrorMsg(null)
    },
    onError: (err: any) => {
      logResourceConsoleError('Invoices', 'Restore', err)
      setErrorMsg(getApiErrorMessage(err, 'Khôi phục hóa đơn thất bại'))
    }
  })

  if (isError) {
    logResourceConsoleError('Invoices', 'GetAll', error)
  }
  const summary = {
    total: list.length,
    pending: list.filter((item) => item.status === 'PENDING').length,
    paid: list.filter((item) => item.status === 'PAID').length,
    overdue: list.filter((item) => item.status === 'OVERDUE').length,
    cancelled: list.filter((item) => item.status === 'CANCELLED').length
  }

  return (
    <div className='min-h-screen bg-slate-50 p-6 font-sans text-slate-900 sm:p-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <span className='rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 ring-1 ring-blue-100'>
              Quản trị
            </span>
            <h1 className='mt-3 text-3xl font-bold tracking-tight text-slate-900'>Hóa đơn & chỉ số</h1>
            <p className='mt-1 max-w-2xl text-sm text-slate-600'>
              Nhập chỉ số công tơ theo căn và kỳ — sau khi lưu, hệ thống <strong>tự tạo hoặc cập nhật hóa đơn</strong> kỳ đó
              (giống luồng chỉ số). Danh sách bên dưới gộp thông tin hóa đơn với tóm tắt chỉ số trong kỳ.
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <a
              href='#nhap-chi-so'
              className='inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700'
            >
              Nhập chỉ số
            </a>
          </div>
        </div>

        <div className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
          <div className='rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm'>
            <div className='text-xs font-medium text-slate-500'>Trên trang này</div>
            <div className='mt-1 text-2xl font-bold text-slate-900'>{summary.total}</div>
            <div className='mt-0.5 text-xs text-slate-500'>hóa đơn</div>
          </div>
          <div className='rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm'>
            <div className='text-xs font-medium text-slate-500'>{invoiceStatusVi.PENDING}</div>
            <div className='mt-1 text-2xl font-bold text-amber-600'>{summary.pending}</div>
          </div>
          <div className='rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm'>
            <div className='text-xs font-medium text-slate-500'>{invoiceStatusVi.PAID}</div>
            <div className='mt-1 text-2xl font-bold text-emerald-600'>{summary.paid}</div>
          </div>
          <div className='rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm'>
            <div className='text-xs font-medium text-slate-500'>{invoiceStatusVi.OVERDUE}</div>
            <div className='mt-1 text-2xl font-bold text-red-600'>{summary.overdue}</div>
          </div>
          <div className='col-span-2 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:col-span-1'>
            <div className='text-xs font-medium text-slate-500'>{invoiceStatusVi.CANCELLED}</div>
            <div className='mt-1 text-2xl font-bold text-slate-600'>{summary.cancelled}</div>
          </div>
        </div>

        {errorMsg && <div className='mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>{errorMsg}</div>}
        {successMsg && <div className='mb-3 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800'>{successMsg}</div>}

        <section id='nhap-chi-so' className='mb-8 scroll-mt-24 rounded-xl border border-blue-100 bg-white p-5 shadow-sm'>
          <div className='flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between'>
            <div className='min-w-0 flex-1'>
              <h2 className='text-lg font-extrabold text-slate-900'>Nhập chỉ số</h2>
              <p className='mt-1 text-sm text-slate-600'>
                Sau khi lưu, hệ thống <strong>tự tạo hoặc cập nhật hóa đơn</strong> theo căn và kỳ tháng ghi chỉ số. Chọn tháng/năm
                kỳ, đồng hồ và chỉ số; ngày ghi nên nằm trong tháng kỳ. Chỉ số cũ được gợi ý theo lần ghi trước.
              </p>
            </div>
          </div>
          {pricingForm.length > 0 && (
            <ul className='mt-3 flex flex-wrap gap-3 text-xs text-slate-600'>
              {pricingForm.map((p) => (
                <li key={String(p.meterType)} className='rounded-md bg-slate-50 px-2 py-1 ring-1 ring-slate-100'>
                  <span className='font-semibold'>{p.meterType}</span>: {formatVnd(Number(p.pricePerUnit) || 0)} / {p.unit || '—'}
                </li>
              ))}
            </ul>
          )}
          <form
            className='mt-4 flex flex-wrap items-end gap-3'
            onSubmit={(e) => {
              e.preventDefault()
              setErrorMsg(null)
              setSuccessMsg(null)
              if (!Number.isFinite(aptNum) || aptNum <= 0) {
                setErrorMsg('Nhập ID căn hộ hợp lệ.')
                return
              }
              createReadingMutation.mutate({
                meterId: Number(cMeter),
                readingDate: cDate,
                previousReading: Number(cPrev),
                currentReading: Number(cCurr)
              })
            }}
          >
            <input
              type='number'
              min={1}
              placeholder='ID căn hộ *'
              className='h-10 min-w-[7.5rem] flex-1 rounded-lg border border-slate-200 px-3 text-sm sm:max-w-[10rem]'
              value={aptForReading}
              onChange={(e) => {
                setAptForReading(e.target.value)
                setCMeter('')
              }}
            />
            <input
              type='number'
              min={1}
              max={12}
              placeholder='Tháng kỳ *'
              className='h-10 w-[6.5rem] flex-shrink-0 rounded-lg border border-slate-200 px-3 text-sm'
              value={billMForReading}
              onChange={(e) => setBillMForReading(e.target.value)}
            />
            <input
              type='number'
              min={2000}
              max={2100}
              placeholder='Năm kỳ *'
              className='h-10 w-[6.5rem] flex-shrink-0 rounded-lg border border-slate-200 px-3 text-sm'
              value={billYForReading}
              onChange={(e) => setBillYForReading(e.target.value)}
            />
            <select
              className='h-10 min-w-[12rem] flex-[2] rounded-lg border border-slate-200 px-3 text-sm'
              value={cMeter}
              onChange={(e) => setCMeter(e.target.value)}
              required
            >
              <option value=''>Chọn đồng hồ (căn đang ACTIVE) *</option>
              {metersForm.map((meter) => (
                <option key={String(meter.id)} value={String(meter.id)}>
                  {meterLabel(meter.id!)}
                </option>
              ))}
            </select>
            <input
              type='date'
              className='h-10 min-w-[10.5rem] flex-shrink-0 rounded-lg border border-slate-200 px-3 text-sm'
              value={cDate}
              onChange={(e) => setCDate(e.target.value)}
              required
            />
            <input
              type='number'
              step='any'
              placeholder='Chỉ số cũ *'
              className='h-10 min-w-[7rem] flex-1 rounded-lg border border-slate-200 px-3 text-sm sm:max-w-[9rem]'
              value={cPrev}
              onChange={(e) => setCPrev(e.target.value)}
              required
            />
            <input
              type='number'
              step='any'
              placeholder='Chỉ số mới *'
              className='h-10 min-w-[7rem] flex-1 rounded-lg border border-slate-200 px-3 text-sm sm:max-w-[9rem]'
              value={cCurr}
              onChange={(e) => setCCurr(e.target.value)}
              required
            />
            <div className='flex w-full flex-shrink-0 flex-wrap gap-2 sm:ml-auto sm:w-auto'>
              <button
                type='submit'
                disabled={createReadingMutation.isPending || !Number.isFinite(aptNum)}
                className='h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50'
              >
                {createReadingMutation.isPending ? 'Đang lưu…' : 'Lưu chỉ số & đồng bộ hóa đơn'}
              </button>
              <Link
                to='/admin/meter-readings'
                className='inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                Trang chỉ số đầy đủ
              </Link>
            </div>
          </form>
          {!Number.isFinite(aptNum) || aptNum <= 0 ? (
            <p className='mt-2 text-xs text-slate-500'>Nhập ID căn để tải danh sách đồng hồ đang hoạt động.</p>
          ) : metersForm.length === 0 ? (
            <p className='mt-2 text-xs text-amber-700'>Căn này không có đồng hồ ACTIVE — kiểm tra Quản lý đồng hồ.</p>
          ) : null}
        </section>

        <div className='overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[960px] border-collapse text-left'>
              <thead>
                <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                  <th className='px-4 py-4'>Mã HĐ</th>
                  <th className='px-4 py-4'>Căn</th>
                  <th className='px-4 py-4'>Kỳ</th>
                  <th className='px-4 py-4'>Chỉ số (kỳ)</th>
                  <th className='px-4 py-4 text-right'>Tổng tiền</th>
                  <th className='px-4 py-4'>Trạng thái</th>
                  <th className='px-4 py-4 text-right'>Thao tác</th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-700'>
                {isLoading && (
                  <tr>
                    <td className='px-4 py-6 text-sm text-slate-500' colSpan={7}>
                      Đang tải danh sách…
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td className='px-4 py-6 text-sm text-red-500' colSpan={7}>
                      Không tải được danh sách hóa đơn.
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && list.length === 0 && (
                  <tr>
                    <td className='px-4 py-6 text-sm text-slate-500' colSpan={7}>
                      Chưa có hóa đơn. Nhập chỉ số phía trên để hệ thống tạo hóa đơn kỳ tương ứng.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !isError &&
                  list.map((item, idx) => {
                    const rq = readingQueries[idx]
                    const rows = rq?.data ?? []
                    const { count, sumTT } = summarizeReadings(rows)
                    const loadingR = rq?.isLoading
                    return (
                      <tr key={item.id} className='border-b border-slate-50'>
                        <td className='px-4 py-4 font-medium text-slate-800'>{item.invoiceCode || item.id}</td>
                        <td className='px-4 py-4 text-slate-700'>Apt {item.apartmentId}</td>
                        <td className='px-4 py-4 tabular-nums text-slate-700'>
                          {item.billingMonth != null && item.billingYear != null
                            ? `${item.billingMonth}/${item.billingYear}`
                            : '—'}
                        </td>
                        <td className='px-4 py-4 text-xs text-slate-700'>
                          {loadingR ? (
                            <span className='text-slate-400'>Đang tải…</span>
                          ) : item.billingMonth == null || item.billingYear == null ? (
                            '—'
                          ) : (
                            <>
                              <span className='font-semibold'>{count}</span> bản ghi
                              {count > 0 && (
                                <>
                                  {' '}
                                  · Σ tiêu thụ: <span className='tabular-nums font-medium'>{sumTT}</span>
                                </>
                              )}
                            </>
                          )}
                        </td>
                        <td className='px-4 py-4 text-right font-semibold tabular-nums text-slate-800'>
                          {formatVnd(item.totalAmount)}
                        </td>
                        <td className='px-4 py-4'>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${invoiceStatusBadgeClass(item.status)}`}
                          >
                            {invoiceStatusVi[item.status as keyof typeof invoiceStatusVi] || item.status}
                          </span>
                        </td>
                        <td className='px-4 py-4 text-right'>
                          <div className='inline-flex flex-wrap justify-end gap-2'>
                            <button type='button' className={ROW_ACTION_EDIT} onClick={() => navigate(`/admin/invoices/${item.id}`)}>
                              Chi tiết
                            </button>
                            {item.status === 'CANCELLED' ? (
                              <button
                                type='button'
                                className={ROW_ACTION_RESTORE}
                                onClick={() => {
                                  setErrorMsg(null)
                                  setSuccessMsg(null)
                                  restoreMutation.mutate(item.id)
                                }}
                              >
                                Khôi phục
                              </button>
                            ) : (
                              <button
                                type='button'
                                className={ROW_ACTION_DELETE}
                                onClick={() => {
                                  setErrorMsg(null)
                                  setSuccessMsg(null)
                                  if (!window.confirm('Xóa mềm hóa đơn này? Bạn có thể khôi phục sau.')) return
                                  deleteMutation.mutate(item.id)
                                }}
                              >
                                Xóa
                              </button>
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
        <div className='mt-4 flex items-center justify-end gap-2 text-sm'>
          <button
            type='button'
            className='rounded bg-slate-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
            disabled={currentPage <= 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            Trang trước
          </button>
          <span>
            Trang {totalPages === 0 ? 0 : currentPage + 1}/{totalPages}
          </span>
          <button
            type='button'
            className='rounded bg-slate-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
            disabled={totalPages === 0 || currentPage + 1 >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  )
}
