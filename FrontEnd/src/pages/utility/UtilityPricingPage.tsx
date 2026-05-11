import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { utilityPricingApi } from 'src/apis/utility_api/utility-pricing.api'
import { logResourceConsoleError } from 'src/utils/payment-console-log'

const getApiErrorMessage = (err: any, fallbackMessage: string) => {
  const apiErr = err?.response?.data
  const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
  if (typeof rawMessage !== 'string') return fallbackMessage

  const translatedMessages: Array<[string, string]> = [
    ['Validation failed', 'Dữ liệu không hợp lệ'],
    ['Unknown field in request body', 'Có trường không hợp lệ trong dữ liệu gửi lên'],
    ['At least one field is required for update', 'Cần ít nhất 1 trường để cập nhật'],
    ['meterType cannot be changed. Create a new pricing for that meterType instead.', 'Không thể đổi loại công tơ. Vui lòng tạo bản giá mới cho loại đó.'],
    ['Utility pricing not found', 'Không tìm thấy cấu hình giá tiện ích'],
    ['pricePerUnit must be greater than 0', 'Đơn giá phải lớn hơn 0'],
    ['effectiveFrom must be in YYYY-MM-DD format', 'Ngày hiệu lực phải đúng định dạng YYYY-MM-DD'],
    ['unit is required', 'Đơn vị tính là bắt buộc'],
    ['unit must be at most 20 characters', 'Đơn vị tính tối đa 20 ký tự'],
    ['unit must be "kWh" for meterType "ELECTRIC"', 'Loại ELECTRIC phải dùng đơn vị kWh'],
    ['unit must be "m3" for meterType "WATER"', 'Loại WATER phải dùng đơn vị m3'],
    ['unit must be "kg" for meterType "GAS"', 'Loại GAS phải dùng đơn vị kg']
  ]

  const mapped = translatedMessages.find(([en]) => rawMessage.includes(en))
  return mapped?.[1] || rawMessage
}

const logApiSuccess = (action: string, response: any) => {
  console.log(`[UtilityPricing][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

export default function UtilityPricingPage() {
  const queryClient = useQueryClient()
  const pageSize = 10
  const [page, setPage] = useState(0)
  const [screenError, setScreenError] = useState<string | null>(null)
  const [filterMeterType, setFilterMeterType] = useState<'ALL' | 'ELECTRIC' | 'WATER' | 'GAS'>('ALL')
  const [filterUnit, setFilterUnit] = useState<'ALL' | 'kWh' | 'm3' | 'kg'>('ALL')
  const [filterActive, setFilterActive] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingPrice, setEditingPrice] = useState('')
  const [editingUnit, setEditingUnit] = useState('')
  const [editingEffectiveFrom, setEditingEffectiveFrom] = useState('')
  const { data, error, isError } = useQuery({
    queryKey: ['utility-pricing', page],
    queryFn: async () => {
      const response = await utilityPricingApi.getAll({ page, size: pageSize })
      logApiSuccess('GetAll', response)
      return response
    }
  })

  const createMutation = useMutation({
    mutationFn: (payload: any) => utilityPricingApi.create(payload),
    onSuccess: (response) => {
      logApiSuccess('Create', response)
      queryClient.invalidateQueries({ queryKey: ['utility-pricing'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logResourceConsoleError('UtilityPricing', 'Create', err)
      setScreenError(getApiErrorMessage(err, 'Lưu giá thất bại'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => utilityPricingApi.delete(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      queryClient.invalidateQueries({ queryKey: ['utility-pricing'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logResourceConsoleError('UtilityPricing', 'Delete', err)
      setScreenError(getApiErrorMessage(err, 'Xóa mềm thất bại'))
    }
  })
  const restoreMutation = useMutation({
    mutationFn: (id: string) => utilityPricingApi.restore(id),
    onSuccess: (response) => {
      logApiSuccess('Restore', response)
      queryClient.invalidateQueries({ queryKey: ['utility-pricing'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logResourceConsoleError('UtilityPricing', 'Restore', err)
      setScreenError(getApiErrorMessage(err, 'Khôi phục thất bại'))
    }
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => utilityPricingApi.update(id, payload),
    onSuccess: (response) => {
      logApiSuccess('Update', response)
      queryClient.invalidateQueries({ queryKey: ['utility-pricing'] })
      setEditingId(null)
      setEditingPrice('')
      setEditingUnit('')
      setEditingEffectiveFrom('')
      setScreenError(null)
    },
    onError: (err: any) => {
      logResourceConsoleError('UtilityPricing', 'Update', err)
      setScreenError(getApiErrorMessage(err, 'Cập nhật thất bại'))
    }
  })

  if (isError) {
    logResourceConsoleError('UtilityPricing', 'GetAll', error)
  }
  const list = data?.data?.data || []
  const totalPages = Number(data?.data?.totalPages || 0)
  const currentPage = Number(data?.data?.page || 0)
  const filteredList = list.filter((item) => {
    const passType = filterMeterType === 'ALL' || item.meterType === filterMeterType
    const passUnit = filterUnit === 'ALL' || item.unit === filterUnit
    const passActive =
      filterActive === 'ALL' ||
      (filterActive === 'ACTIVE' && item.isActive) ||
      (filterActive === 'INACTIVE' && !item.isActive)
    return passType && passUnit && passActive
  })

  return (
    <div className='min-h-screen bg-slate-50 px-8 py-8'>
      <div className='mx-auto max-w-7xl'>
        <h2 className='mb-4 text-3xl font-extrabold tracking-tight text-slate-900'>Quản lý giá tiện ích</h2>
        {(screenError || isError) && (
          <div className='mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>
            {screenError || getApiErrorMessage(error, 'Tải danh sách giá tiện ích thất bại')}
          </div>
        )}
        <form
          className='mb-6 grid grid-cols-1 gap-2 rounded-xl bg-white p-4 shadow-sm md:grid-cols-5'
          onSubmit={(e) => {
            e.preventDefault()
            setScreenError(null)
            const fd = new FormData(e.currentTarget)
            createMutation.mutate({
              meterType: fd.get('meterType'),
              pricePerUnit: Number(fd.get('pricePerUnit')),
              unit: fd.get('unit'),
              effectiveFrom: fd.get('effectiveFrom'),
              isActive: true
            })
            e.currentTarget.reset()
          }}
        >
          <select name='meterType' className='rounded border px-2 py-2'>
            <option value='ELECTRIC'>ELECTRIC</option>
            <option value='WATER'>WATER</option>
            <option value='GAS'>GAS</option>
          </select>
          <input name='pricePerUnit' type='number' placeholder='Price per unit' className='rounded border px-2 py-2' />
          <select name='unit' className='rounded border px-2 py-2'>
            <option value='kWh'>kWh</option>
            <option value='m3'>m3</option>
            <option value='kg'>kg</option>
          </select>
          <input name='effectiveFrom' type='date' className='rounded border px-2 py-2' />
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
          <select
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value as 'ALL' | 'kWh' | 'm3' | 'kg')}
            className='rounded border px-2 py-2'
          >
            <option value='ALL'>Tất cả unit</option>
            <option value='kWh'>kWh</option>
            <option value='m3'>m3</option>
            <option value='kg'>kg</option>
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            className='rounded border px-2 py-2'
          >
            <option value='ALL'>Trạng thái: tất cả</option>
            <option value='ACTIVE'>ACTIVE</option>
            <option value='INACTIVE'>INACTIVE</option>
          </select>
          <button
            type='button'
            onClick={() => {
              setFilterMeterType('ALL')
              setFilterUnit('ALL')
              setFilterActive('ALL')
              setPage(0)
            }}
            className='rounded bg-slate-200 px-3 py-2'
          >
            Xóa lọc
          </button>
        </div>

        <div className='overflow-hidden rounded-xl bg-white shadow-sm'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='bg-slate-50'>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Loại</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Đơn giá</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Unit</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Hiệu lực</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Trạng thái</th>
                <th className='px-4 py-3 text-right text-xs font-bold uppercase text-slate-500'>Hành động</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {filteredList.map((item) => (
                <tr key={item.id}>
                  <td className='px-4 py-3'>{item.meterType}</td>
                  <td className='px-4 py-3'>
                    {editingId === item.id ? (
                      <input
                        type='number'
                        value={editingPrice}
                        onChange={(e) => setEditingPrice(e.target.value)}
                        className='w-28 rounded border px-2 py-1'
                      />
                    ) : (
                      item.pricePerUnit
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    {editingId === item.id ? (
                      <input value={editingUnit} onChange={(e) => setEditingUnit(e.target.value)} className='w-24 rounded border px-2 py-1' />
                    ) : (
                      item.unit
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    {editingId === item.id ? (
                      <input
                        type='date'
                        value={editingEffectiveFrom}
                        onChange={(e) => setEditingEffectiveFrom(e.target.value)}
                        className='rounded border px-2 py-1'
                      />
                    ) : (
                      item.effectiveFrom
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-right'>
                    <div className='inline-flex gap-2'>
                      {editingId === item.id ? (
                        <>
                          <button
                            className='rounded bg-green-100 px-2 py-1'
                            onClick={() => {
                              setScreenError(null)
                              updateMutation.mutate({
                                id: item.id,
                                payload: {
                                  pricePerUnit: Number(editingPrice),
                                  unit: editingUnit,
                                  effectiveFrom: editingEffectiveFrom
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
                              setEditingPrice('')
                              setEditingUnit('')
                              setEditingEffectiveFrom('')
                            }}
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <button
                          className='rounded bg-yellow-100 px-2 py-1'
                          onClick={() => {
                            setEditingId(item.id)
                            setEditingPrice(String(item.pricePerUnit))
                            setEditingUnit(item.unit)
                            setEditingEffectiveFrom(String(item.effectiveFrom).slice(0, 10))
                          }}
                        >
                          Sửa
                        </button>
                      )}
                      {item.isActive ? (
                        <button
                          className='rounded bg-red-100 px-2 py-1'
                          onClick={() => {
                            setScreenError(null)
                            deleteMutation.mutate(item.id)
                          }}
                        >
                          Xóa mềm
                        </button>
                      ) : (
                        <button
                          className='rounded bg-green-100 px-2 py-1'
                          onClick={() => {
                            setScreenError(null)
                            restoreMutation.mutate(item.id)
                          }}
                        >
                          Khôi phục
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td className='px-4 py-4 text-sm text-slate-500' colSpan={6}>
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
