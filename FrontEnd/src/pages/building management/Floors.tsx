import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { buildingApi } from 'src/apis/building_api/buildings.api'
import { floorsApi } from 'src/apis/floor_api/floors.api'
import type { Buildings } from 'src/types/buildings.type'
import type { Floor } from 'src/types/floor.type'

export default function Floors() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('all')
  const [buildingFilter, setBuildingFilter] = useState<string>('ALL')

  const getApiErrorMessage = (error: any, fallbackMessage: string) => {
    const apiErr = error?.response?.data
    const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
    const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
    if (typeof rawMessage !== 'string') return fallbackMessage
    const translatedMessages: Array<[string, string]> = [
      ['Validation failed', 'Dữ liệu không hợp lệ'],
      ['Floor not found', 'Không tìm thấy tầng'],
      ['Invalid building_id (building does not exist)', 'Tòa nhà không tồn tại'],
      ['At least one field is required for update', 'Cần ít nhất một trường để cập nhật']
    ]
    const matched = translatedMessages.find(([en]) => rawMessage.includes(en))
    return matched?.[1] || rawMessage
  }

  const logApiSuccess = (action: string, response: any) => {
    console.log(`[Floor][${action}] success`, {
      status: response?.status,
      endpoint: response?.config?.url,
      method: response?.config?.method,
      data: response?.data
    })
  }

  const logApiError = (action: string, error: any) => {
    console.error(`[Floor][${action}] error`, {
      status: error?.response?.status,
      endpoint: error?.config?.url || error?.response?.config?.url,
      method: error?.config?.method || error?.response?.config?.method,
      data: error?.response?.data,
      message: error?.message
    })
  }

  const floorsQuery = useQuery({
    queryKey: ['floors-page', page, search, statusFilter, buildingFilter],
    queryFn: async () => {
      const response = await floorsApi.getAll({
        page,
        size: 10,
        search: search || undefined,
        status: statusFilter,
        buildingId: buildingFilter === 'ALL' ? undefined : Number(buildingFilter)
      })
      logApiSuccess('GetAll', response)
      return response
    }
  })

  const buildingsQuery = useQuery({
    queryKey: ['floors-buildings-for-filter'],
    queryFn: async () => {
      const response = await buildingApi.getAllBuildings({ page: 0, size: 100, status: 'ACTIVE' })
      logApiSuccess('GetBuildings', response)
      return response
    }
  })

  const dataFloors = floorsQuery.data?.data?.data || []
  const dataBuildings: Buildings[] = buildingsQuery.data?.data?.data || []
  const currentPage = floorsQuery.data?.data.page ?? 0
  const totalElements = floorsQuery.data?.data.totalElements ?? 0
  const totalPages = floorsQuery.data?.data.totalPages ?? 1

  const buildingNameMap = useMemo(() => {
    const map = new Map<string, string>()
    dataBuildings.forEach((b) => map.set(String(b.id), b.name))
    return map
  }, [dataBuildings])

  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string; building_id: number; floor_number: number; name?: string | null }) => {
      const response = payload.id
        ? await floorsApi.update(payload.id, {
            building_id: payload.building_id,
            floor_number: payload.floor_number,
            name: payload.name ?? null
          })
        : await floorsApi.create(payload)
      return response as any
    },
    onSuccess: (response) => {
      logApiSuccess(editingFloor ? 'Update' : 'Create', response)
      queryClient.invalidateQueries({ queryKey: ['floors-page'] })
      setIsCreateOpen(false)
      setEditingFloor(null)
      setFormError(null)
    },
    onError: (error: any) => {
      logApiError('Save', error)
      setFormError(getApiErrorMessage(error, 'Không lưu được tầng'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => floorsApi.delete(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      queryClient.invalidateQueries({ queryKey: ['floors-page'] })
    },
    onError: (error: any) => {
      logApiError('Delete', error)
      setFormError(getApiErrorMessage(error, 'Xóa tầng thất bại'))
    }
  })

  if (floorsQuery.isError) {
    logApiError('GetAll', floorsQuery.error)
  }

  const summary = useMemo(
    () => ({
      total: dataFloors.length,
      active: dataFloors.filter((f) => !f.deletedAt).length,
      deleted: dataFloors.filter((f) => Boolean(f.deletedAt)).length
    }),
    [dataFloors]
  )

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div>
            <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
              Administration
            </span>
            <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý tầng</h1>
            <p className='text-sm text-gray-500'>Quản lý tầng, lọc theo tòa nhà và trạng thái.</p>
          </div>
          <button
            onClick={() => {
              setFormError(null)
              setEditingFloor(null)
              setIsCreateOpen(true)
            }}
            className='flex items-center gap-2 rounded-lg bg-[#0052CC] px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-blue-700'
          >
            + Thêm tầng
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
            <div className='mt-2 text-3xl font-bold text-red-500'>{summary.deleted}</div>
          </div>
        </div>

        <div className='mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm'>
          <form
            className='grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto]'
            onSubmit={(event) => {
              event.preventDefault()
              setPage(0)
              setSearch(searchInput.trim())
            }}
          >
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder='Tìm theo tên tầng hoặc số tầng'
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
            />
            <select
              value={buildingFilter}
              onChange={(event) => {
                setPage(0)
                setBuildingFilter(event.target.value)
              }}
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
            >
              <option value='ALL'>Tất cả tòa nhà</option>
              {dataBuildings.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => {
                setPage(0)
                setStatusFilter(event.target.value as 'all' | 'active' | 'deleted')
              }}
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
            >
              <option value='all'>Tất cả trạng thái</option>
              <option value='active'>Đang hoạt động</option>
              <option value='deleted'>Đã xóa</option>
            </select>
            <button className='rounded-lg bg-[#0052CC] px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700'>
              Tìm kiếm
            </button>
            <button
              type='button'
              onClick={() => {
                setPage(0)
                setSearch('')
                setSearchInput('')
                setStatusFilter('all')
                setBuildingFilter('ALL')
              }}
              className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
            >
              Làm mới
            </button>
          </form>
        </div>

        {formError && <div className='mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600'>{formError}</div>}

        <div className='mb-4 text-sm text-gray-500'>
          Hiển thị <span className='font-bold text-gray-700'>{dataFloors.length}</span> kết quả, tổng cộng{' '}
          <span className='font-bold text-gray-700'>{totalElements}</span> bản ghi.
        </div>

        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                  <th className='px-6 py-4'>Số tầng</th>
                  <th className='px-6 py-4'>Tên tầng</th>
                  <th className='px-6 py-4'>Tòa nhà</th>
                  <th className='px-6 py-4'>Trạng thái</th>
                  <th className='px-6 py-4 text-right'>Hành động</th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-700'>
                {floorsQuery.isLoading && (
                  <tr>
                    <td className='px-6 py-8 text-center text-gray-500' colSpan={5}>
                      Đang tải dữ liệu tầng...
                    </td>
                  </tr>
                )}
                {floorsQuery.isError && (
                  <tr>
                    <td className='px-6 py-8 text-center text-red-500' colSpan={5}>
                      {getApiErrorMessage(floorsQuery.error, 'Không tải được danh sách tầng.')}
                    </td>
                  </tr>
                )}
                {!floorsQuery.isLoading && !floorsQuery.isError && dataFloors.length === 0 && (
                  <tr>
                    <td className='px-6 py-8 text-center text-gray-500' colSpan={5}>
                      Chưa có dữ liệu tầng.
                    </td>
                  </tr>
                )}
                {!floorsQuery.isLoading &&
                  !floorsQuery.isError &&
                  dataFloors.map((floor) => (
                    <tr key={floor.id} className='hover:bg-gray-50/50 transition-colors'>
                      <td className='px-6 py-5 font-semibold text-gray-900'>Tầng {floor.floorNumber}</td>
                      <td className='px-6 py-5'>{floor.name || <span className='text-gray-300'>—</span>}</td>
                      <td className='px-6 py-5'>{buildingNameMap.get(String(floor.buildingId)) || `#${floor.buildingId}`}</td>
                      <td className='px-6 py-5'>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            floor.deletedAt ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {floor.deletedAt ? 'Đã xóa' : 'Đang hoạt động'}
                        </span>
                      </td>
                      <td className='px-6 py-5 text-right'>
                        <div className='inline-flex gap-3 text-sm font-medium'>
                          <button
                            type='button'
                            onClick={() => setSelectedFloor(floor)}
                            className='text-slate-700 hover:underline'
                          >
                            Chi tiết
                          </button>
                          <button
                            type='button'
                            onClick={() => {
                              setFormError(null)
                              setEditingFloor(floor)
                              setIsCreateOpen(true)
                            }}
                            className='text-[#0052CC] hover:underline'
                          >
                            Sửa
                          </button>
                          <button
                            type='button'
                            disabled={Boolean(floor.deletedAt) || deleteMutation.isPending}
                            onClick={() => {
                              const ok = window.confirm(`Bạn chắc chắn muốn xóa tầng ${floor.floorNumber}?`)
                              if (!ok) return
                              deleteMutation.mutate(String(floor.id))
                            }}
                            className='text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300'
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

        {isCreateOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm'>
            <div className='w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl'>
              <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
                <h2 className='text-xl font-bold text-gray-800'>{editingFloor ? 'Cập nhật tầng' : 'Thêm tầng'}</h2>
                <button
                  onClick={() => !saveMutation.isPending && setIsCreateOpen(false)}
                  className='text-gray-400 transition hover:text-gray-600'
                >
                  Đóng
                </button>
              </div>
              <div className='p-6'>
                <form
                  className='space-y-4'
                  onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    saveMutation.mutate({
                      id: editingFloor?.id,
                      building_id: Number(fd.get('building_id')),
                      floor_number: Number(fd.get('floor_number')),
                      name: String(fd.get('name') || '').trim() || null
                    })
                  }}
                >
                  <div>
                    <label className='mb-1 block text-sm font-bold text-gray-700'>Tòa nhà</label>
                    <select
                      name='building_id'
                      defaultValue={editingFloor?.buildingId ?? ''}
                      required
                      className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                    >
                      <option value=''>Chọn tòa nhà</option>
                      {dataBuildings.map((b) => (
                        <option key={b.id} value={String(b.id)}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Số tầng</label>
                      <input
                        name='floor_number'
                        type='number'
                        required
                        defaultValue={editingFloor?.floorNumber ?? ''}
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      />
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Tên tầng</label>
                      <input
                        name='name'
                        defaultValue={editingFloor?.name || ''}
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      />
                    </div>
                  </div>

                  <div className='flex justify-end gap-3 border-t border-gray-100 pt-4'>
                    <button
                      type='button'
                      disabled={saveMutation.isPending}
                      onClick={() => {
                        setIsCreateOpen(false)
                        setEditingFloor(null)
                      }}
                      className='rounded-lg bg-gray-100 px-5 py-2.5 font-bold text-gray-600 transition hover:bg-gray-200 disabled:opacity-60'
                    >
                      Hủy
                    </button>
                    <button
                      type='submit'
                      disabled={saveMutation.isPending}
                      className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60'
                    >
                      {saveMutation.isPending ? 'Đang lưu...' : editingFloor ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {selectedFloor && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm'>
            <div className='w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl'>
              <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
                <h2 className='text-xl font-bold text-gray-800'>Chi tiết tầng</h2>
                <button onClick={() => setSelectedFloor(null)} className='text-gray-400 transition hover:text-gray-600'>
                  Đóng
                </button>
              </div>
              <div className='grid grid-cols-1 gap-3 p-6 text-sm text-gray-700'>
                <div><span className='font-semibold text-gray-900'>ID:</span> #{selectedFloor.id}</div>
                <div><span className='font-semibold text-gray-900'>Số tầng:</span> {selectedFloor.floorNumber}</div>
                <div><span className='font-semibold text-gray-900'>Tên tầng:</span> {selectedFloor.name || '-'}</div>
                <div><span className='font-semibold text-gray-900'>Tòa nhà:</span> {buildingNameMap.get(String(selectedFloor.buildingId)) || `#${selectedFloor.buildingId}`}</div>
                <div><span className='font-semibold text-gray-900'>Trạng thái:</span> {selectedFloor.deletedAt ? 'Đã xóa' : 'Đang hoạt động'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

