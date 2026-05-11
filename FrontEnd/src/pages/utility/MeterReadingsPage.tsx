import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { meterReadingsApi } from 'src/apis/utility_api/meter-readings.api'
import { utilityMetersApi } from 'src/apis/utility_api/utility-meters.api'
import { logResourceConsoleError } from 'src/utils/payment-console-log'

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
  const pageSize = 10
  const [page, setPage] = useState(0)
  const [screenError, setScreenError] = useState<string | null>(null)
  const [filterMeterType, setFilterMeterType] = useState<'ALL' | 'ELECTRIC' | 'WATER' | 'GAS'>('ALL')
  const [filterMeterId, setFilterMeterId] = useState<string>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState('')
  const [editingPrevious, setEditingPrevious] = useState('')
  const [editingCurrent, setEditingCurrent] = useState('')
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
      setScreenError(getApiErrorMessage(err, 'Xóa mềm chỉ số thất bại'))
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

  return (
    <div className='min-h-screen bg-slate-50 px-8 py-8'>
      <div className='mx-auto max-w-7xl'>
        <h2 className='mb-4 text-3xl font-extrabold tracking-tight text-slate-900'>Quản lý chỉ số hàng tháng</h2>
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
          <select name='meterId' className='rounded border px-2 py-2' defaultValue=''>
            <option value='' disabled>
              Chọn đồng hồ
            </option>
            {meters.map((meter) => (
              <option key={meter.id} value={meter.id}>
                {meterLabel(meter.id)}
              </option>
            ))}
          </select>
          <input name='readingDate' type='date' className='rounded border px-2 py-2' />
          <input name='previousReading' type='number' placeholder='Previous' className='rounded border px-2 py-2' />
          <input name='currentReading' type='number' placeholder='Current' className='rounded border px-2 py-2' />
          <button className='rounded bg-blue-600 px-3 py-2 text-white'>{createMutation.isPending ? 'Saving...' : 'Lưu'}</button>
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
                      item.readingDate
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
                      {item.deletedAt ? 'INACTIVE' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-right'>
                    <div className='inline-flex gap-2'>
                      {editingId === item.id && !item.deletedAt ? (
                        <>
                          <button
                            className='rounded bg-green-100 px-2 py-1'
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
                            className='rounded bg-gray-100 px-2 py-1'
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
                          className='rounded bg-yellow-100 px-2 py-1'
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
                          className='rounded bg-green-100 px-2 py-1'
                          onClick={() => {
                            setScreenError(null)
                            restoreMutation.mutate(item.id)
                          }}
                        >
                          Khôi phục
                        </button>
                      ) : (
                        <button
                          className='rounded bg-red-100 px-2 py-1'
                          onClick={() => {
                            setScreenError(null)
                            deleteMutation.mutate(item.id)
                          }}
                        >
                          Xóa mềm
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
