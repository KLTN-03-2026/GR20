import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { utilityPricingApi } from 'src/apis/utility_api/utility-pricing.api'

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

const logApiError = (action: string, err: any) => {
  console.error(`[UtilityPricing][${action}] error`, {
    status: err?.response?.status,
    endpoint: err?.config?.url || err?.response?.config?.url,
    method: err?.config?.method || err?.response?.config?.method,
    data: err?.response?.data,
    message: err?.message
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
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [editingPrice, setEditingPrice] = useState('')
  const [editingUnit, setEditingUnit] = useState('')
  const [editingEffectiveFrom, setEditingEffectiveFrom] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
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
      logApiError('Create', err)
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
      logApiError('Delete', err)
      setScreenError(getApiErrorMessage(err, 'Xóa thất bại'))
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
      logApiError('Restore', err)
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
      logApiError('Update', err)
      setScreenError(getApiErrorMessage(err, 'Cập nhật thất bại'))
    }
  })

  if (isError) {
    logApiError('GetAll', error)
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

  const summary = {
    total: filteredList.length,
    active: filteredList.filter((item) => item.isActive).length,
    inactive: filteredList.filter((item) => !item.isActive).length
  }

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div>
            <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
              Administration
            </span>
            <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý bảng giá tiện ích</h1>
            <p className='text-sm text-gray-500'>Quản lý đơn giá điện, nước, gas với xóa và khôi phục.</p>
          </div>
          <button
            type='button'
            onClick={() => setIsCreateOpen(true)}
            className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700'
          >
            + Thêm bảng giá
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
            {screenError || getApiErrorMessage(error, 'Tải danh sách giá tiện ích thất bại')}
          </div>
        )}
        {isCreateOpen && (
          <form
            className='mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-6'
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
              setIsCreateOpen(false)
            }}
          >
          <select
            name='meterType'
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
          >
            <option value='ELECTRIC'>ELECTRIC</option>
            <option value='WATER'>WATER</option>
            <option value='GAS'>GAS</option>
          </select>
          <input
            name='pricePerUnit'
            type='number'
            placeholder='Đơn giá'
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
          />
          <select
            name='unit'
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
          >
            <option value='kWh'>kWh</option>
            <option value='m3'>m3</option>
            <option value='kg'>kg</option>
          </select>
          <input
            name='effectiveFrom'
            type='date'
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
          />
          <button className='rounded-lg bg-[#0052CC] px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700'>
            {createMutation.isPending ? 'Đang lưu...' : 'Thêm bảng giá'}
          </button>
          <button
            type='button'
            className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
            onClick={() => setIsCreateOpen(false)}
          >
            Hủy
          </button>
        </form>
        )}
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
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value as 'ALL' | 'kWh' | 'm3' | 'kg')}
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
          >
            <option value='ALL'>Tất cả unit</option>
            <option value='kWh'>kWh</option>
            <option value='m3'>m3</option>
            <option value='kg'>kg</option>
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
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
            className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
          >
            Xóa lọc
          </button>
        </div>

        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                <th className='px-6 py-4'>Loại</th>
                <th className='px-6 py-4'>Đơn giá</th>
                <th className='px-6 py-4'>Unit</th>
                <th className='px-6 py-4'>Hiệu lực</th>
                <th className='px-6 py-4'>Trạng thái</th>
                <th className='px-6 py-4 text-right'>Hành động</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-700'>
              {filteredList.map((item) => (
                <tr key={item.id}>
                  <td className='px-6 py-4 font-semibold text-gray-900'>{item.meterType}</td>
                  <td className='px-6 py-4'>
                    {editingId === item.id ? (
                      <input
                        type='number'
                        value={editingPrice}
                        onChange={(e) => setEditingPrice(e.target.value)}
                        className='w-28 rounded-lg border border-gray-200 px-3 py-1.5 outline-none focus:border-[#0052CC]'
                      />
                    ) : (
                      item.pricePerUnit
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    {editingId === item.id ? (
                      <input
                        value={editingUnit}
                        onChange={(e) => setEditingUnit(e.target.value)}
                        className='w-24 rounded-lg border border-gray-200 px-3 py-1.5 outline-none focus:border-[#0052CC]'
                      />
                    ) : (
                      item.unit
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    {editingId === item.id ? (
                      <input
                        type='date'
                        value={editingEffectiveFrom}
                        onChange={(e) => setEditingEffectiveFrom(e.target.value)}
                        className='rounded-lg border border-gray-200 px-3 py-1.5 outline-none focus:border-[#0052CC]'
                      />
                    ) : (
                      item.effectiveFrom
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <div className='inline-flex gap-2'>
                      {editingId === item.id ? (
                        <>
                          <button
                            className='rounded-lg bg-emerald-100 px-3 py-1.5 text-emerald-700'
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
                            className='rounded-lg bg-gray-100 px-3 py-1.5 text-gray-700'
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
                          className='rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700'
                          onClick={() => setSelectedItem(item)}
                        >
                          Chi tiết
                        </button>
                      )}
                      {editingId !== item.id && (
                        <button
                          className='rounded-lg bg-amber-100 px-3 py-1.5 text-amber-700'
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
                          className='rounded-lg bg-red-100 px-3 py-1.5 text-red-700'
                          onClick={() => {
                            setScreenError(null)
                            deleteMutation.mutate(item.id)
                          }}
                        >
                          Xóa
                        </button>
                      ) : (
                        <button
                          className='rounded-lg bg-emerald-100 px-3 py-1.5 text-emerald-700'
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
                  <td className='px-6 py-8 text-center text-gray-500' colSpan={6}>
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
                <h2 className='text-xl font-bold text-gray-800'>Chi tiết bảng giá</h2>
                <button className='text-gray-400 hover:text-gray-600' onClick={() => setSelectedItem(null)}>Đóng</button>
              </div>
              <div className='grid grid-cols-1 gap-3 p-6 text-sm text-gray-700'>
                <div><span className='font-semibold text-gray-900'>ID:</span> #{selectedItem.id}</div>
                <div><span className='font-semibold text-gray-900'>Loại:</span> {selectedItem.meterType}</div>
                <div><span className='font-semibold text-gray-900'>Đơn giá:</span> {selectedItem.pricePerUnit}</div>
                <div><span className='font-semibold text-gray-900'>Unit:</span> {selectedItem.unit}</div>
                <div><span className='font-semibold text-gray-900'>Hiệu lực:</span> {selectedItem.effectiveFrom}</div>
                <div><span className='font-semibold text-gray-900'>Trạng thái:</span> {selectedItem.isActive ? 'ACTIVE' : 'INACTIVE'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
