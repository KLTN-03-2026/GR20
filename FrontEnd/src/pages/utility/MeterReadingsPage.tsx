import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { meterReadingsApi } from 'src/apis/utility_api/meter-readings.api'
import { utilityMetersApi } from 'src/apis/utility_api/utility-meters.api'

const getApiErrorMessage = (err: any, fallbackMessage: string) => {
  const apiErr = err?.response?.data
  const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
  if (typeof rawMessage !== 'string') return fallbackMessage

  const translatedMessages: Array<[string, string]> = [
    ['Validation failed', 'Dữ liệu không hợp lệ'],
    ['At least one field is required for update', 'Cần ít nhất 1 trường để cập nhật'],
    ['Invalid meterId', 'Đồng hồ không hợp lệ'],
    ['Meter reading not found or not deleted', 'Không tìm thấy chỉ số đã xóa để khôi phục'],
    ['Meter reading not found', 'Không tìm thấy bản ghi chỉ số'],
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

const logApiError = (action: string, err: any) => {
  console.error(`[MeterReadings][${action}] error`, {
    status: err?.response?.status,
    endpoint: err?.config?.url || err?.response?.config?.url,
    method: err?.config?.method || err?.response?.config?.method,
    data: err?.response?.data,
    message: err?.message
  })
}

export default function MeterReadingsPage() {
  const queryClient = useQueryClient()
  const pageSize = 10
  const [page, setPage] = useState(0)
  const [screenError, setScreenError] = useState<string | null>(null)
  const [filterMeterType, setFilterMeterType] = useState<'ALL' | 'ELECTRIC' | 'WATER' | 'GAS'>('ALL')
  const [filterMeterId, setFilterMeterId] = useState<string>('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [editingDate, setEditingDate] = useState('')
  const [editingPrevious, setEditingPrevious] = useState('')
  const [editingCurrent, setEditingCurrent] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { data, error, isError } = useQuery({
    queryKey: ['meter-readings', page],
    queryFn: async () => {
      const response = await meterReadingsApi.getAll({ page, size: pageSize })
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

  const createMutation = useMutation({
    mutationFn: (payload: any) => meterReadingsApi.create(payload),
    onSuccess: (response) => {
      logApiSuccess('Create', response)
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Create', err)
      setScreenError(getApiErrorMessage(err, 'Lưu chỉ số thất bại'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => meterReadingsApi.delete(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Delete', err)
      setScreenError(getApiErrorMessage(err, 'Xóa chỉ số thất bại'))
    }
  })
  const restoreMutation = useMutation({
    mutationFn: (id: string | number) => meterReadingsApi.restore(id),
    onSuccess: (response) => {
      logApiSuccess('Restore', response)
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Restore', err)
      setScreenError(getApiErrorMessage(err, 'Khôi phục chỉ số thất bại'))
    }
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => meterReadingsApi.update(id, payload),
    onSuccess: (response) => {
      logApiSuccess('Update', response)
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      setEditingId(null)
      setEditingDate('')
      setEditingPrevious('')
      setEditingCurrent('')
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Update', err)
      setScreenError(getApiErrorMessage(err, 'Cập nhật chỉ số thất bại'))
    }
  })

  if (isError) logApiError('GetAll', error)
  if (isMetersError) logApiError('Meters', metersError)
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
  const summary = {
    total: filteredList.length,
    active: filteredList.filter((item) => !item.deletedAt).length,
    inactive: filteredList.filter((item) => Boolean(item.deletedAt)).length
  }

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8'>
          <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
            Administration
          </span>
          <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý chỉ số công tơ</h1>
          <p className='text-sm text-gray-500'>Theo dõi, cập nhật và xóa chỉ số hàng tháng của từng đồng hồ.</p>
        </div>
        <div className='mb-4 flex justify-end'>
          <button
            type='button'
            onClick={() => setIsCreateOpen(true)}
            className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700'
          >
            + Thêm chỉ số
          </button>
        </div>

        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Tổng trên trang</div>
            <div className='mt-2 text-3xl font-bold text-gray-900'>{summary.total}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Đang hoạt động</div>
            <div className='mt-2 text-3xl font-bold text-emerald-600'>{summary.active}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Đã xóa</div>
            <div className='mt-2 text-3xl font-bold text-red-500'>{summary.inactive}</div>
          </div>
        </div>

        {(screenError || isError) && (
          <div className='mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>
            {screenError || getApiErrorMessage(error, 'Tải danh sách chỉ số thất bại')}
          </div>
        )}
        {isCreateOpen && <form
          className='mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-5'
          onSubmit={(e) => {
            e.preventDefault()
            setScreenError(null)
            const fd = new FormData(e.currentTarget)
            createMutation.mutate({
              meterId: Number(fd.get('meterId')),
              readingDate: fd.get('readingDate'),
              previousReading: Number(fd.get('previousReading')),
              currentReading: Number(fd.get('currentReading'))
            })
            e.currentTarget.reset()
          }}
        >
          <select
            name='meterId'
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
            defaultValue=''
          >
            <option value='' disabled>
              Chọn đồng hồ
            </option>
            {meters.map((meter) => (
              <option key={meter.id} value={meter.id}>
                {meterLabel(meter.id)}
              </option>
            ))}
          </select>
          <input
            name='readingDate'
            type='date'
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
          />
          <input
            name='previousReading'
            type='number'
            placeholder='Chỉ số cũ'
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
          />
          <input
            name='currentReading'
            type='number'
            placeholder='Chỉ số mới'
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
          />
          <button className='rounded-lg bg-[#0052CC] px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700'>
            {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button
            type='button'
            className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
            onClick={() => setIsCreateOpen(false)}
          >
            Hủy
          </button>
        </form>}
        <div className='mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-4'>
          <select
            value={filterMeterType}
            onChange={(e) => setFilterMeterType(e.target.value as 'ALL' | 'ELECTRIC' | 'WATER' | 'GAS')}
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
          >
            <option value='ALL'>Tất cả loại</option>
            <option value='ELECTRIC'>ELECTRIC</option>
            <option value='WATER'>WATER</option>
            <option value='GAS'>GAS</option>
          </select>
          <select
            value={filterMeterId}
            onChange={(e) => setFilterMeterId(e.target.value)}
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
          >
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
            className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
          >
            Xóa lọc
          </button>
          <div />
        </div>

        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                <th className='px-6 py-4'>Đồng hồ</th>
                <th className='px-6 py-4'>Ngày ghi</th>
                <th className='px-6 py-4'>Chỉ số cũ</th>
                <th className='px-6 py-4'>Chỉ số mới</th>
                <th className='px-6 py-4'>Tiêu thụ</th>
                <th className='px-6 py-4'>Trạng thái</th>
                <th className='px-6 py-4 text-right'>Hành động</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-700'>
              {filteredList.map((item) => (
                <tr key={item.id}>
                  <td className='px-6 py-4'>{meterLabel(item.meterId)}</td>
                  <td className='px-6 py-4'>
                    {editingId === item.id ? (
                      <input
                        type='date'
                        value={editingDate}
                        onChange={(e) => setEditingDate(e.target.value)}
                        className='rounded-lg border border-gray-200 px-3 py-1.5'
                      />
                    ) : (
                      item.readingDate
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    {editingId === item.id ? (
                      <input
                        type='number'
                        value={editingPrevious}
                        onChange={(e) => setEditingPrevious(e.target.value)}
                        className='w-24 rounded-lg border border-gray-200 px-3 py-1.5'
                      />
                    ) : (
                      item.previousReading
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    {editingId === item.id ? (
                      <input
                        type='number'
                        value={editingCurrent}
                        onChange={(e) => setEditingCurrent(e.target.value)}
                        className='w-24 rounded-lg border border-gray-200 px-3 py-1.5'
                      />
                    ) : (
                      item.currentReading
                    )}
                  </td>
                  <td className='px-6 py-4'>{item.consumption}</td>
                  <td className='px-6 py-4'>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.deletedAt ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {item.deletedAt ? 'INACTIVE' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <div className='inline-flex gap-2'>
                      {editingId !== item.id && (
                        <button
                          className='rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700'
                          onClick={() => setSelectedItem(item)}
                        >
                          Chi tiết
                        </button>
                      )}
                      {editingId === item.id && !item.deletedAt ? (
                        <>
                          <button
                            className='rounded-lg bg-emerald-100 px-3 py-1.5 text-emerald-700'
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
                            className='rounded-lg bg-gray-100 px-3 py-1.5 text-gray-700'
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
                          className='rounded-lg bg-amber-100 px-3 py-1.5 text-amber-700'
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
                          className='rounded-lg bg-emerald-100 px-3 py-1.5 text-emerald-700'
                          onClick={() => {
                            setScreenError(null)
                            restoreMutation.mutate(item.id)
                          }}
                        >
                          Khôi phục
                        </button>
                      ) : (
                        <button
                          className='rounded-lg bg-red-100 px-3 py-1.5 text-red-700'
                          onClick={() => {
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
                  <td className='px-6 py-8 text-center text-gray-500' colSpan={7}>
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
        {selectedItem && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm'>
            <div className='w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl'>
              <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
                <h2 className='text-xl font-bold text-gray-800'>Chi tiết chỉ số</h2>
                <button className='text-gray-400 hover:text-gray-600' onClick={() => setSelectedItem(null)}>Đóng</button>
              </div>
              <div className='grid grid-cols-1 gap-3 p-6 text-sm text-gray-700'>
                <div><span className='font-semibold text-gray-900'>ID:</span> #{selectedItem.id}</div>
                <div><span className='font-semibold text-gray-900'>Đồng hồ:</span> {meterLabel(selectedItem.meterId)}</div>
                <div><span className='font-semibold text-gray-900'>Ngày ghi:</span> {selectedItem.readingDate}</div>
                <div><span className='font-semibold text-gray-900'>Chỉ số cũ:</span> {selectedItem.previousReading}</div>
                <div><span className='font-semibold text-gray-900'>Chỉ số mới:</span> {selectedItem.currentReading}</div>
                <div><span className='font-semibold text-gray-900'>Tiêu thụ:</span> {selectedItem.consumption}</div>
                <div><span className='font-semibold text-gray-900'>Trạng thái:</span> {selectedItem.deletedAt ? 'INACTIVE' : 'ACTIVE'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
