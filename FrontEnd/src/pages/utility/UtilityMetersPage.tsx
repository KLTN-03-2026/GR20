import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { apartmentApi } from 'src/apis/apartment_api/apartment_api'
import { utilityMetersApi } from 'src/apis/utility_api/utility-meters.api'
import type { ApartmentData } from 'src/types/apartment.type'
import type { UtilityMeter } from 'src/types/utility-meter.type'
import { apartmentDisplayName } from 'src/utils/apartment-display'
import { formatDateViVN } from 'src/utils/date-vi'
import { METER_STATUS_OPTIONS, METER_TYPE_OPTIONS, meterStatusVi, meterTypeVi } from 'src/utils/utility-labels'
import { logResourceConsoleError } from 'src/utils/payment-console-log'
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
    ['Unknown field in request body', 'Có trường không hợp lệ trong dữ liệu gửi lên'],
    ['At least one field is required for update', 'Cần ít nhất 1 trường để cập nhật'],
    ['meterCode already exists', 'Mã đồng hồ đã tồn tại'],
    ['Invalid apartmentId', 'Căn hộ không hợp lệ'],
    ['Utility meter not found or not inactive', 'Không tìm thấy đồng hồ đã xóa mềm để khôi phục'],
    ['Utility meter not found', 'Không tìm thấy đồng hồ tiện ích'],
    ['Căn hộ đang có cư dân', 'Căn hộ đang có cư dân, không được xóa đồng hồ tiện ích'],
    ['String must contain at least 1 character', 'Mã đồng hồ không được để trống'],
    ['Too small', 'Giá trị nhập không hợp lệ'],
    ['Invalid date', 'Ngày lắp không đúng định dạng (YYYY-MM-DD)'],
    ['Required', 'Vui lòng điền đầy đủ thông tin bắt buộc']
  ]
  const mapped = translatedMessages.find(([en]) => rawMessage.includes(en))
  return mapped?.[1] || rawMessage
}

const logApiSuccess = (action: string, response: any) => {
  console.log(`[UtilityMeter][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

function validateMeterForm(payload: {
  apartmentId: number | null
  meterCode: string
  installedDate: string
}) {
  if (payload.apartmentId == null || payload.apartmentId <= 0) {
    return 'Chọn căn hộ từ danh sách gợi ý.'
  }
  if (!payload.meterCode.trim()) {
    return 'Vui lòng nhập mã đồng hồ.'
  }
  if (!payload.installedDate.trim()) {
    return 'Vui lòng chọn ngày lắp.'
  }
  return null
}

export default function UtilityMetersPage() {
  const queryClient = useQueryClient()
  const pageSize = 10
  const [page, setPage] = useState(0)
  const [screenError, setScreenError] = useState<string | null>(null)
  const [selected, setSelected] = useState<UtilityMeter | null>(null)
  const [filterMeterType, setFilterMeterType] = useState<'ALL' | 'ELECTRIC' | 'WATER' | 'GAS'>('ALL')
  const [filterApartmentId, setFilterApartmentId] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'BROKEN'>('ALL')

  const [selectedAptId, setSelectedAptId] = useState<number | null>(null)
  const [aptSearchText, setAptSearchText] = useState('')
  const [aptDropdownOpen, setAptDropdownOpen] = useState(false)
  const aptSearchRef = useRef<HTMLDivElement>(null)

  const [formState, setFormState] = useState({
    meterType: 'ELECTRIC',
    meterCode: '',
    installedDate: '',
    status: 'ACTIVE'
  })

  const { data: apartmentsCache = [] } = useQuery({
    queryKey: ['apartments-cache-utility-meters'],
    queryFn: async () => {
      const r = await apartmentApi.getAllApartment({ page: 0, size: 500 })
      return (r.data?.data as ApartmentData[] | undefined) ?? []
    }
  })

  const apartmentLabelById = useMemo(() => {
    const m = new Map<number, string>()
    for (const a of apartmentsCache) {
      m.set(Number(a.id), apartmentDisplayName(a))
    }
    return m
  }, [apartmentsCache])

  const aptSearchDebounced = aptSearchText.trim()
  const { data: aptSearchResults = [], isFetching: aptSearchFetching } = useQuery({
    queryKey: ['apartments-search-utility-meters', aptSearchDebounced],
    queryFn: async () => {
      const params: { page: number; size: number; search?: string } = { page: 0, size: 30 }
      if (aptSearchDebounced) params.search = aptSearchDebounced
      const r = await apartmentApi.getAllApartment(params)
      return (r.data?.data as ApartmentData[] | undefined) ?? []
    },
    enabled: aptDropdownOpen
  })

  const aptDropdownOptions = useMemo(() => {
    if (aptSearchResults.length > 0) return aptSearchResults
    const all = apartmentsCache
    if (!aptSearchDebounced) return all.slice(0, 30)
    const q = aptSearchDebounced.toLowerCase()
    return all
      .filter((a) => {
        const label = apartmentDisplayName(a).toLowerCase()
        const code = String(a.apartmentCode || '').toLowerCase()
        return label.includes(q) || code.includes(q) || String(a.id).includes(q)
      })
      .slice(0, 30)
  }, [aptSearchResults, apartmentsCache, aptSearchDebounced])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (aptSearchRef.current && !aptSearchRef.current.contains(e.target as Node)) {
        setAptDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const { data, error, isError } = useQuery({
    queryKey: ['utility-meters', filterMeterType, filterApartmentId, filterStatus, page],
    queryFn: async () => {
      const response = await utilityMetersApi.getAll({
        meterType: filterMeterType === 'ALL' ? undefined : filterMeterType,
        apartmentId: filterApartmentId ? Number(filterApartmentId) : undefined,
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        page,
        size: pageSize
      })
      logApiSuccess('GetAll', response)
      return response
    }
  })

  const saveMutation = useMutation({
    mutationFn: (payload: any) =>
      selected ? utilityMetersApi.update(selected.id, payload) : utilityMetersApi.create(payload),
    onSuccess: (response) => {
      logApiSuccess(selected ? 'Update' : 'Create', response)
      queryClient.invalidateQueries({ queryKey: ['utility-meters'] })
      setSelected(null)
      setSelectedAptId(null)
      setAptSearchText('')
      setFormState({
        meterType: 'ELECTRIC',
        meterCode: '',
        installedDate: '',
        status: 'ACTIVE'
      })
      setScreenError(null)
    },
    onError: (err: any) => {
      logResourceConsoleError('UtilityMeter', 'Save', err)
      setScreenError(getApiErrorMessage(err, 'Lưu đồng hồ thất bại'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => utilityMetersApi.delete(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      queryClient.invalidateQueries({ queryKey: ['utility-meters'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logResourceConsoleError('UtilityMeter', 'Delete', err)
      setScreenError(getApiErrorMessage(err, 'Xóa đồng hồ thất bại'))
    }
  })
  const restoreMutation = useMutation({
    mutationFn: (id: string) => utilityMetersApi.restore(id),
    onSuccess: (response) => {
      logApiSuccess('Restore', response)
      queryClient.invalidateQueries({ queryKey: ['utility-meters'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logResourceConsoleError('UtilityMeter', 'Restore', err)
      setScreenError(getApiErrorMessage(err, 'Khôi phục đồng hồ thất bại'))
    }
  })

  if (isError) logResourceConsoleError('UtilityMeter', 'GetAll', error)

  const list = data?.data?.data || []
  const totalPages = Number(data?.data?.totalPages || 0)
  const currentPage = Number(data?.data?.page || 0)

  useEffect(() => {
    if (!selected) {
      setSelectedAptId(null)
      setAptSearchText('')
      setFormState({
        meterType: 'ELECTRIC',
        meterCode: '',
        installedDate: '',
        status: 'ACTIVE'
      })
      return
    }
    const aptId = Number(selected.apartmentId)
    setSelectedAptId(aptId)
    setAptSearchText(apartmentLabelById.get(aptId) ?? `Căn #${aptId}`)
    setFormState({
      meterType: selected.meterType,
      meterCode: selected.meterCode || '',
      installedDate: selected.installedDate ? String(selected.installedDate).slice(0, 10) : '',
      status: selected.status
    })
  }, [selected, apartmentLabelById])

  return (
    <div className='min-h-screen bg-slate-50 px-8 py-8'>
      <div className='mx-auto max-w-7xl'>
        <h2 className='mb-4 text-3xl font-extrabold tracking-tight text-slate-900'>Quản lý đồng hồ</h2>
        {(screenError || isError) && (
          <div className='mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>
            {screenError || getApiErrorMessage(error, 'Tải danh sách đồng hồ thất bại')}
          </div>
        )}
        <div className='mb-4 grid grid-cols-1 gap-2 md:grid-cols-4'>
          <select
            value={filterMeterType}
            onChange={(e) => setFilterMeterType(e.target.value as 'ALL' | 'ELECTRIC' | 'WATER' | 'GAS')}
            className='rounded border px-2 py-2'
          >
            <option value='ALL'>Tất cả loại</option>
            {METER_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filterApartmentId}
            onChange={(e) => setFilterApartmentId(e.target.value)}
            className='rounded border px-2 py-2'
          >
            <option value=''>Lọc theo căn hộ</option>
            {apartmentsCache.map((apartment) => (
              <option key={apartment.id} value={String(apartment.id)}>
                {apartmentDisplayName(apartment)}
              </option>
            ))}
          </select>
          <button
            type='button'
            onClick={() => {
              setFilterMeterType('ALL')
              setFilterApartmentId('')
              setFilterStatus('ALL')
              setPage(0)
            }}
            className='rounded bg-slate-200 px-3 py-2'
          >
            Xóa lọc
          </button>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'BROKEN')}
            className='rounded border px-2 py-2'
          >
            <option value='ALL'>Trạng thái: tất cả</option>
            {METER_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <form
          className='mb-6 rounded-xl bg-white p-4 shadow-sm'
          onSubmit={(e) => {
            e.preventDefault()
            setScreenError(null)
            const validationError = validateMeterForm({
              apartmentId: selectedAptId,
              meterCode: formState.meterCode,
              installedDate: formState.installedDate
            })
            if (validationError) {
              setScreenError(validationError)
              return
            }
            saveMutation.mutate({
              apartmentId: selectedAptId!,
              meterType: formState.meterType,
              meterCode: formState.meterCode.trim(),
              installedDate: formState.installedDate,
              status: formState.status || 'ACTIVE'
            })
          }}
        >
          <div className='flex flex-wrap items-end gap-3'>
            <div ref={aptSearchRef} className='relative min-w-[14rem] flex-1 sm:max-w-[20rem]'>
              <label className='mb-1 block text-xs font-semibold text-slate-600'>Căn hộ *</label>
              <div className='relative'>
                <input
                  type='text'
                  autoComplete='off'
                  placeholder='Chọn hoặc gõ để tìm căn…'
                  className='h-10 w-full rounded-lg border border-slate-200 py-2 pl-3 pr-9 text-sm'
                  value={aptSearchText}
                  onChange={(e) => {
                    setAptSearchText(e.target.value)
                    setSelectedAptId(null)
                    setAptDropdownOpen(true)
                  }}
                  onFocus={() => setAptDropdownOpen(true)}
                />
                <button
                  type='button'
                  tabIndex={-1}
                  aria-label='Mở danh sách căn hộ'
                  className='absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100'
                  onClick={() => setAptDropdownOpen((v) => !v)}
                >
                  <span className='material-symbols-outlined text-lg'>
                    {aptDropdownOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>
              {aptDropdownOpen && (
                <ul className='absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg'>
                  <li className='border-b border-slate-100 px-3 py-1.5 text-xs text-slate-500'>
                    {aptSearchDebounced
                      ? `Kết quả lọc${aptSearchFetching ? '…' : ''}`
                      : 'Danh sách căn — gõ chữ để lọc nhanh'}
                  </li>
                  {aptSearchFetching && aptDropdownOptions.length === 0 ? (
                    <li className='px-3 py-2 text-slate-500'>Đang tải…</li>
                  ) : aptDropdownOptions.length === 0 ? (
                    <li className='px-3 py-2 text-slate-500'>Không tìm thấy căn phù hợp</li>
                  ) : (
                    aptDropdownOptions.map((a) => (
                      <li key={String(a.id)}>
                        <button
                          type='button'
                          className={`w-full px-3 py-2 text-left hover:bg-blue-50 ${
                            selectedAptId === Number(a.id) ? 'bg-blue-50 font-semibold text-blue-800' : ''
                          }`}
                          onClick={() => {
                            setSelectedAptId(Number(a.id))
                            setAptSearchText(apartmentDisplayName(a))
                            setAptDropdownOpen(false)
                          }}
                        >
                          {apartmentDisplayName(a)}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
            <div className='flex-shrink-0'>
              <label className='mb-1 block text-xs font-semibold text-slate-600'>Loại đồng hồ *</label>
              <select
                name='meterType'
                value={formState.meterType}
                onChange={(e) => setFormState((prev) => ({ ...prev, meterType: e.target.value }))}
                className='h-10 rounded-lg border border-slate-200 px-3 text-sm'
              >
                {METER_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className='min-w-[10rem] flex-1'>
              <label className='mb-1 block text-xs font-semibold text-slate-600'>Mã đồng hồ *</label>
              <input
                name='meterCode'
                placeholder='VD: DIEN-A101'
                className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm'
                value={formState.meterCode}
                onChange={(e) => setFormState((prev) => ({ ...prev, meterCode: e.target.value }))}
              />
            </div>
            <div className='flex-shrink-0'>
              <label className='mb-1 block text-xs font-semibold text-slate-600'>Ngày lắp *</label>
              <input
                name='installedDate'
                type='date'
                className='h-10 rounded-lg border border-slate-200 px-3 text-sm'
                value={formState.installedDate}
                onChange={(e) => setFormState((prev) => ({ ...prev, installedDate: e.target.value }))}
              />
            </div>
            <div className='flex w-full flex-shrink-0 gap-2 sm:ml-auto sm:w-auto'>
              <button
                type='submit'
                disabled={saveMutation.isPending}
                className='h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50'
              >
                {saveMutation.isPending ? 'Đang lưu…' : selected ? 'Cập nhật' : 'Lưu'}
              </button>
              {selected && (
                <button
                  type='button'
                  className='h-10 rounded-lg bg-slate-200 px-4 text-sm font-semibold text-slate-700'
                  onClick={() => setSelected(null)}
                >
                  Hủy sửa
                </button>
              )}
            </div>
          </div>
        </form>
        <div className='overflow-hidden rounded-xl bg-white shadow-sm'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='bg-slate-50'>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Mã đồng hồ</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Loại</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Căn hộ</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Ngày lắp</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Trạng thái</th>
                <th className='px-4 py-3 text-right text-xs font-bold uppercase text-slate-500'>Hành động</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {list.map((item) => (
                <tr key={item.id}>
                  <td className='px-4 py-3'>{item.meterCode}</td>
                  <td className='px-4 py-3'>{meterTypeVi(item.meterType)}</td>
                  <td className='px-4 py-3'>
                    {apartmentLabelById.get(Number(item.apartmentId)) ?? `Căn #${item.apartmentId}`}
                  </td>
                  <td className='px-4 py-3'>{item.installedDate ? formatDateViVN(item.installedDate) : 'Chưa có'}</td>
                  <td className='px-4 py-3'>{meterStatusVi(item.status)}</td>
                  <td className='px-4 py-3 text-right'>
                    <div className='flex flex-wrap justify-end gap-2'>
                      <button type='button' className={ROW_ACTION_EDIT} onClick={() => setSelected(item)}>
                        Sửa
                      </button>
                      {item.status === 'INACTIVE' ? (
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
                                'Xóa vĩnh viễn đồng hồ này và các chỉ số liên quan? (Không thực hiện được nếu căn hộ còn cư dân.)'
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
              {list.length === 0 && (
                <tr>
                  <td className='px-4 py-4 text-sm text-slate-500' colSpan={6}>
                    Không có đồng hồ phù hợp bộ lọc.
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
