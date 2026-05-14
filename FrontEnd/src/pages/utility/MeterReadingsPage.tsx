import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { invoicesApi } from 'src/apis/billing_api/invoices.api'
import type { Invoice } from 'src/types/invoice.type'
import { meterReadingsApi } from 'src/apis/utility_api/meter-readings.api'
import { utilityMetersApi } from 'src/apis/utility_api/utility-meters.api'
import { utilityPricingApi } from 'src/apis/utility_api/utility-pricing.api'
import { formatDateViVN } from 'src/utils/date-vi'
import { logResourceConsoleError } from 'src/utils/payment-console-log'
import {
  ROW_ACTION_CANCEL,
  ROW_ACTION_DELETE,
  ROW_ACTION_EDIT,
  ROW_ACTION_RESTORE,
  ROW_ACTION_SAVE
} from 'src/utils/row-action-buttons'

const getApiErrorMessage = (err: any, fallbackMessage: string) => {
  const apiErr = err?.response?.data
  const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
  if (typeof rawMessage !== 'string') return fallbackMessage

  const translatedMessages: Array<[string, string]> = [
    ['Validation failed', 'Dữ liệu không hợp lệ'],
    ['At least one field is required for update', 'Cần ít nhất 1 trường để cập nhật'],
    ['Invalid meterId', 'Đồng hồ không hợp lệ'],
    ['Meter reading not found or not deleted', 'Không tìm thấy chỉ số đã xóa mềm để khôi phục'],
    ['Meter reading not found', 'Không tìm thấy bản ghi chỉ số'],
    ['Căn hộ đang có cư dân', 'Căn hộ đang có cư dân, không được xóa chỉ số công tơ.'],
    ['currentReading must be greater than or equal to previousReading', 'Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ']
  ]
  const mapped = translatedMessages.find(([en]) => rawMessage.includes(en))
  return mapped?.[1] || rawMessage
}

const logApiSuccess = (action: string, response: any) => {
  console.log(`[MeterReadings][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

export default function MeterReadingsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageSize = 10
  const [page, setPage] = useState(0)
  const [screenError, setScreenError] = useState<string | null>(null)
  const [filterMeterType, setFilterMeterType] = useState<'ALL' | 'ELECTRIC' | 'WATER' | 'GAS'>('ALL')
  const [filterMeterId, setFilterMeterId] = useState<string>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState('')
  const [editingPrevious, setEditingPrevious] = useState('')
  const [editingCurrent, setEditingCurrent] = useState('')

  const [cMeter, setCMeter] = useState('')
  const [cDate, setCDate] = useState('')
  const [cPrev, setCPrev] = useState('')
  const [cCurr, setCCurr] = useState('')

  const invoiceContextParams = useMemo(() => {
    const apt = searchParams.get('apartmentId')
    const m = searchParams.get('billingMonth')
    const y = searchParams.get('billingYear')
    const out: { apartmentId?: number; billingMonth?: number; billingYear?: number } = {}
    if (apt != null && apt !== '' && !Number.isNaN(Number(apt))) out.apartmentId = Number(apt)
    if (m != null && y != null && m !== '' && y !== '' && !Number.isNaN(Number(m)) && !Number.isNaN(Number(y))) {
      out.billingMonth = Number(m)
      out.billingYear = Number(y)
    }
    return out
  }, [searchParams])

  const fullInvoiceContext =
    invoiceContextParams.apartmentId != null &&
    invoiceContextParams.billingMonth != null &&
    invoiceContextParams.billingYear != null

  const resolveInvoiceForRedirect = useQuery({
    queryKey: [
      'admin-meter-readings-resolve-invoice',
      invoiceContextParams.apartmentId,
      invoiceContextParams.billingMonth,
      invoiceContextParams.billingYear
    ],
    queryFn: async () => {
      const r = await invoicesApi.getAll({
        page: 0,
        size: 10,
        apartmentId: invoiceContextParams.apartmentId,
        billingMonth: invoiceContextParams.billingMonth,
        billingYear: invoiceContextParams.billingYear
      })
      const list = (r.data?.data as Invoice[] | undefined) ?? []
      const first = list[0]
      return first?.id != null ? String(first.id) : null
    },
    enabled: fullInvoiceContext
  })

  useEffect(() => {
    if (!fullInvoiceContext || !resolveInvoiceForRedirect.isSuccess) return
    const invId = resolveInvoiceForRedirect.data
    if (invId) {
      navigate(`/admin/invoices/${invId}`, { replace: true })
    }
  }, [fullInvoiceContext, resolveInvoiceForRedirect.isSuccess, resolveInvoiceForRedirect.data, navigate])

  useEffect(() => {
    setPage(0)
  }, [invoiceContextParams.apartmentId, invoiceContextParams.billingMonth, invoiceContextParams.billingYear])

  const { data, error, isError } = useQuery({
    queryKey: ['meter-readings', page, invoiceContextParams],
    queryFn: async () => {
      const response = await meterReadingsApi.getAll({ page, size: pageSize, ...invoiceContextParams })
      logApiSuccess('GetAll', response)
      return response
    }
  })
  const { data: metersData, error: metersError, isError: isMetersError } = useQuery({
    queryKey: ['utility-meters-for-readings'],
    queryFn: async () => {
      const response = await utilityMetersApi.getAll({ status: 'ACTIVE' })
      logApiSuccess('Meters', response)
      return response
    }
  })

  const { data: pricingData } = useQuery({
    queryKey: ['active-utility-pricing-admin-readings'],
    queryFn: () => utilityPricingApi.getActive()
  })

  const suggestQuery = useQuery({
    queryKey: ['meter-suggest-prev', cMeter, cDate],
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

  const createMutation = useMutation({
    mutationFn: (payload: any) => meterReadingsApi.create(payload),
    onSuccess: (response) => {
      logApiSuccess('Create', response)
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setScreenError(null)
      setCMeter('')
      setCDate('')
      setCPrev('')
      setCCurr('')
    },
    onError: (err: any) => {
      logResourceConsoleError('MeterReadings', 'Create', err)
      setScreenError(getApiErrorMessage(err, 'Lưu chỉ số thất bại'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => meterReadingsApi.delete(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logResourceConsoleError('MeterReadings', 'Delete', err)
      setScreenError(getApiErrorMessage(err, 'Xóa chỉ số thất bại'))
    }
  })
  const restoreMutation = useMutation({
    mutationFn: (id: string) => meterReadingsApi.restore(id),
    onSuccess: (response) => {
      logApiSuccess('Restore', response)
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logResourceConsoleError('MeterReadings', 'Restore', err)
      setScreenError(getApiErrorMessage(err, 'Khôi phục chỉ số thất bại'))
    }
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => meterReadingsApi.update(id, payload),
    onSuccess: (response) => {
      logApiSuccess('Update', response)
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setEditingId(null)
      setEditingDate('')
      setEditingPrevious('')
      setEditingCurrent('')
      setScreenError(null)
    },
    onError: (err: any) => {
      logResourceConsoleError('MeterReadings', 'Update', err)
      setScreenError(getApiErrorMessage(err, 'Cập nhật chỉ số thất bại'))
    }
  })

  if (isError) logResourceConsoleError('MeterReadings', 'GetAll', error)
  if (isMetersError) logResourceConsoleError('MeterReadings', 'Meters', metersError)
  const list = data?.data?.data || []
  const totalPages = Number(data?.data?.totalPages || 0)
  const currentPage = Number(data?.data?.page || 0)
  const meters = metersData?.data?.data || []
  const meterMap = new Map(meters.map((m) => [String(m.id), m]))
  const meterLabel = (meterId: string | number) => {
    const meter = meterMap.get(String(meterId))
    if (!meter) return `Meter ${meterId}`
    return `${meter.meterCode} - ${meter.meterType} - Apt ${meter.apartmentId}`
  }
  const filteredList = list.filter((item) => {
    const meter = meterMap.get(String(item.meterId))
    const meterType = meter?.meterType
    const passMeterType = filterMeterType === 'ALL' || meterType === filterMeterType
    const passMeterId = !filterMeterId || String(item.meterId) === filterMeterId
    return passMeterType && passMeterId
  })

  const pricingList = (pricingData?.data?.data || []) as { meterType?: string; pricePerUnit?: number; unit?: string }[]

  const periodPrev = useMemo(() => {
    if (invoiceContextParams.billingMonth == null || invoiceContextParams.billingYear == null) return null
    let m = invoiceContextParams.billingMonth - 1
    let y = invoiceContextParams.billingYear
    if (m < 1) {
      m = 12
      y -= 1
    }
    return { month: m, year: y }
  }, [invoiceContextParams.billingMonth, invoiceContextParams.billingYear])

  const inBillingMonth = (rd: string | undefined, m: number, y: number) => {
    if (!rd) return false
    const d = new Date(rd)
    return d.getMonth() + 1 === m && d.getFullYear() === y
  }

  const readingsThisMonth =
    invoiceContextParams.billingMonth != null && invoiceContextParams.billingYear != null
      ? filteredList.filter((item) =>
          inBillingMonth(item.readingDate, invoiceContextParams.billingMonth!, invoiceContextParams.billingYear!)
        )
      : []
  const readingsPrevMonth =
    periodPrev != null
      ? filteredList.filter((item) => inBillingMonth(item.readingDate, periodPrev.month, periodPrev.year))
      : []

  const fmtVnd = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n) || 0)

  if (fullInvoiceContext && resolveInvoiceForRedirect.isLoading) {
    return (
      <div className='flex min-h-[50vh] flex-col items-center justify-center bg-slate-50 px-8 text-center text-slate-600'>
        <p className='text-sm font-semibold'>Đang mở trang hóa đơn cùng căn và kỳ…</p>
        <p className='mt-2 max-w-md text-xs text-slate-500'>
          URL chỉ số có đủ căn + tháng + năm sẽ chuyển về chi tiết hóa đơn (một trang: giá — chỉ số — cách tính).
        </p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50 px-8 py-8'>
      <div className='mx-auto max-w-7xl'>
        <h2 className='mb-4 text-3xl font-extrabold tracking-tight text-slate-900'>Quản lý chỉ số hàng tháng</h2>
        {fullInvoiceContext && resolveInvoiceForRedirect.isSuccess && resolveInvoiceForRedirect.data == null && (
          <div className='mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950'>
            Không tìm thấy hóa đơn cho căn #{invoiceContextParams.apartmentId} kỳ{' '}
            {invoiceContextParams.billingMonth}/{invoiceContextParams.billingYear}. Bạn vẫn có thể nhập chỉ số tại đây;
            khi đã có hóa đơn, mở chi tiết hóa đơn để xem giá, chỉ số và dòng tiền đầy đủ.
          </div>
        )}
        {(invoiceContextParams.apartmentId != null || invoiceContextParams.billingMonth != null) && (
          <div className='mb-4 rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-950'>
            <p className='font-semibold'>Tiền điện/nước trên hóa đơn</p>
            <p className='mt-1 text-emerald-900/90'>
              Công thức: <strong>(chỉ số mới − chỉ số cũ)</strong> × <strong>đơn giá</strong> theo loại đồng hồ (kỳ theo tháng
              ghi chỉ số). Chỉ số cũ của tháng mới = chỉ số mới đã ghi ở tháng trước (hệ thống gợi ý khi nhập).
            </p>
            {pricingList.length > 0 && (
              <ul className='mt-2 list-inside list-disc text-xs'>
                {pricingList.map((p) => (
                  <li key={String(p.meterType)}>
                    {p.meterType}: {fmtVnd(Number(p.pricePerUnit) || 0)} / {p.unit || '—'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {periodPrev != null && invoiceContextParams.billingMonth != null && (
          <div className='mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm md:grid-cols-2'>
            <div>
              <p className='text-xs font-bold uppercase text-slate-500'>
                Tháng trước ({periodPrev.month}/{periodPrev.year})
              </p>
              {readingsPrevMonth.length === 0 ? (
                <p className='mt-2 text-slate-500'>Không có bản ghi trên trang hiện tại (có thể nằm trang khác).</p>
              ) : (
                <ul className='mt-2 space-y-1'>
                  {readingsPrevMonth.map((r) => (
                    <li key={String(r.id)} className='tabular-nums'>
                      {meterLabel(r.meterId)}: cũ {r.previousReading} → mới {r.currentReading} (TT {r.consumption})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className='text-xs font-bold uppercase text-slate-500'>
                Tháng hóa đơn ({invoiceContextParams.billingMonth}/{invoiceContextParams.billingYear})
              </p>
              {readingsThisMonth.length === 0 ? (
                <p className='mt-2 text-slate-500'>Chưa có chỉ số ghi trong tháng này trên trang hiện tại.</p>
              ) : (
                <ul className='mt-2 space-y-1'>
                  {readingsThisMonth.map((r) => (
                    <li key={String(r.id)} className='tabular-nums'>
                      {meterLabel(r.meterId)}: cũ {r.previousReading} → mới {r.currentReading} (TT {r.consumption})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {(invoiceContextParams.apartmentId != null || invoiceContextParams.billingMonth != null) && (
          <div className='mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950'>
            <p>
              <span className='font-semibold'>Lọc theo hóa đơn:</span>{' '}
              {invoiceContextParams.apartmentId != null && <>căn #{invoiceContextParams.apartmentId}</>}
              {invoiceContextParams.billingMonth != null && (
                <>
                  {invoiceContextParams.apartmentId != null ? ' · ' : null}kỳ ghi chỉ số trong tháng{' '}
                  {invoiceContextParams.billingMonth}/{invoiceContextParams.billingYear}
                </>
              )}
            </p>
            <button
              type='button'
              className='shrink-0 font-semibold text-blue-700 underline hover:text-blue-900'
              onClick={() => {
                setSearchParams({})
                setPage(0)
              }}
            >
              Xóa lọc
            </button>
          </div>
        )}
        {(screenError || isError) && (
          <div className='mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>
            {screenError || getApiErrorMessage(error, 'Tải danh sách chỉ số thất bại')}
          </div>
        )}
        <form
          className='mb-6 grid grid-cols-1 gap-2 rounded-xl bg-white p-4 shadow-sm md:grid-cols-5'
          onSubmit={(e) => {
            e.preventDefault()
            setScreenError(null)
            createMutation.mutate({
              meterId: Number(cMeter),
              readingDate: cDate,
              previousReading: Number(cPrev),
              currentReading: Number(cCurr)
            })
          }}
        >
          <select
            name='meterId'
            className='rounded border px-2 py-2'
            value={cMeter}
            onChange={(e) => setCMeter(e.target.value)}
          >
            <option value='' disabled>
              Chọn đồng hồ
            </option>
            {meters.map((meter) => (
              <option key={meter.id} value={String(meter.id)}>
                {meterLabel(meter.id)}
              </option>
            ))}
          </select>
          <input
            name='readingDate'
            type='date'
            className='rounded border px-2 py-2'
            value={cDate}
            onChange={(e) => setCDate(e.target.value)}
          />
          <input
            name='previousReading'
            type='number'
            placeholder='Chỉ số cũ (gợi ý tự động)'
            className='rounded border px-2 py-2'
            value={cPrev}
            onChange={(e) => setCPrev(e.target.value)}
          />
          <input
            name='currentReading'
            type='number'
            placeholder='Chỉ số mới'
            className='rounded border px-2 py-2'
            value={cCurr}
            onChange={(e) => setCCurr(e.target.value)}
          />
          <button type='submit' className='rounded bg-blue-600 px-3 py-2 text-white'>
            {createMutation.isPending ? 'Saving...' : 'Lưu'}
          </button>
        </form>
        <div className='mb-4 grid grid-cols-1 gap-2 md:grid-cols-4'>
          <select
            value={filterMeterType}
            onChange={(e) => setFilterMeterType(e.target.value as 'ALL' | 'ELECTRIC' | 'WATER' | 'GAS')}
            className='rounded border px-2 py-2'
          >
            <option value='ALL'>Tất cả loại</option>
            <option value='ELECTRIC'>ELECTRIC</option>
            <option value='WATER'>WATER</option>
            <option value='GAS'>GAS</option>
          </select>
          <select value={filterMeterId} onChange={(e) => setFilterMeterId(e.target.value)} className='rounded border px-2 py-2'>
            <option value=''>Tất cả đồng hồ</option>
            {meters.map((meter) => (
              <option key={meter.id} value={String(meter.id)}>
                {meterLabel(meter.id)}
              </option>
            ))}
          </select>
          <button
            type='button'
            onClick={() => {
              setFilterMeterType('ALL')
              setFilterMeterId('')
            }}
            className='rounded bg-slate-200 px-3 py-2'
          >
            Xóa lọc
          </button>
          <div />
        </div>

        <div className='overflow-hidden rounded-xl bg-white shadow-sm'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='bg-slate-50'>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Đồng hồ</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Ngày ghi</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Chỉ số cũ</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Chỉ số mới</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Tiêu thụ</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Trạng thái</th>
                <th className='px-4 py-3 text-right text-xs font-bold uppercase text-slate-500'>Hành động</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {filteredList.map((item) => (
                <tr key={item.id}>
                  <td className='px-4 py-3'>{meterLabel(item.meterId)}</td>
                  <td className='px-4 py-3'>
                    {editingId === item.id ? (
                      <input
                        type='date'
                        value={editingDate}
                        onChange={(e) => setEditingDate(e.target.value)}
                        className='rounded border px-2 py-1'
                      />
                    ) : (
                      formatDateViVN(item.readingDate)
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    {editingId === item.id ? (
                      <input
                        type='number'
                        value={editingPrevious}
                        onChange={(e) => setEditingPrevious(e.target.value)}
                        className='w-24 rounded border px-2 py-1'
                      />
                    ) : (
                      item.previousReading
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    {editingId === item.id ? (
                      <input
                        type='number'
                        value={editingCurrent}
                        onChange={(e) => setEditingCurrent(e.target.value)}
                        className='w-24 rounded border px-2 py-1'
                      />
                    ) : (
                      item.currentReading
                    )}
                  </td>
                  <td className='px-4 py-3'>{item.consumption}</td>
                  <td className='px-4 py-3'>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        item.deletedAt ? 'bg-slate-200 text-slate-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.deletedAt ? 'INACTIVE (cũ)' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-right'>
                    <div className='flex flex-wrap justify-end gap-2'>
                      {editingId === item.id && !item.deletedAt ? (
                        <>
                          <button
                            type='button'
                            className={ROW_ACTION_SAVE}
                            onClick={() => {
                              setScreenError(null)
                              updateMutation.mutate({
                                id: item.id,
                                payload: {
                                  readingDate: editingDate,
                                  previousReading: Number(editingPrevious),
                                  currentReading: Number(editingCurrent)
                                }
                              })
                            }}
                          >
                            Lưu
                          </button>
                          <button
                            type='button'
                            className={ROW_ACTION_CANCEL}
                            onClick={() => {
                              setEditingId(null)
                              setEditingDate('')
                              setEditingPrevious('')
                              setEditingCurrent('')
                            }}
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <button
                          type='button'
                          className={ROW_ACTION_EDIT}
                          disabled={Boolean(item.deletedAt)}
                          onClick={() => {
                            if (item.deletedAt) return
                            setEditingId(item.id)
                            setEditingDate(String(item.readingDate).slice(0, 10))
                            setEditingPrevious(String(item.previousReading))
                            setEditingCurrent(String(item.currentReading))
                          }}
                        >
                          Sửa
                        </button>
                      )}
                      {item.deletedAt ? (
                        <button
                          type='button'
                          className={ROW_ACTION_RESTORE}
                          onClick={() => {
                            setScreenError(null)
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
                            if (
                              !window.confirm(
                                'Xóa vĩnh viễn bản ghi chỉ số này? (Không thực hiện được nếu căn hộ còn cư dân.)'
                              )
                            ) {
                              return
                            }
                            setScreenError(null)
                            deleteMutation.mutate(item.id)
                          }}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td className='px-4 py-4 text-sm text-slate-500' colSpan={7}>
                    Không có dữ liệu phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
