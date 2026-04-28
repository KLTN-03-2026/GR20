import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { apartmentsApi } from 'src/apis/apartment_api/apartments.api'
import { buildingApi } from 'src/apis/building_api/buildings.api'
import { floorsApi } from 'src/apis/floor_api/floors.api'
import type { Apartment, ApartmentStatus } from 'src/types/apartment.type'
import type { Buildings } from 'src/types/buildings.type'
import type { Floor } from 'src/types/floor.type'

const statusOptions: ApartmentStatus[] = ['AVAILABLE', 'OCCUPIED', 'INACTIVE']
const directionOptions = ['', 'NORTH', 'SOUTH', 'EAST', 'WEST', 'NORTHEAST', 'NORTHWEST', 'SOUTHEAST', 'SOUTHWEST'] as const

export default function Apartments() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Apartment | null>(null)
  const [selectedItem, setSelectedItem] = useState<Apartment | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApartmentStatus>('ALL')
  const [buildingFilter, setBuildingFilter] = useState<string>('ALL')
  const [floorFilter, setFloorFilter] = useState<string>('ALL')
  const [modalBuildingId, setModalBuildingId] = useState<string>('')
  const [modalFloorId, setModalFloorId] = useState<string>('')

  const getApiErrorMessage = (error: any, fallbackMessage: string) => {
    const apiErr = error?.response?.data
    const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
    const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
    if (typeof rawMessage !== 'string') return fallbackMessage
    const translatedMessages: Array<[string, string]> = [
      ['Validation failed', 'Dữ liệu không hợp lệ'],
      ['Apartment not found', 'Không tìm thấy căn hộ'],
      ['An apartment with this code already exists', 'Mã căn hộ đã tồn tại'],
      ['Invalid buildingId/floorId/ownerUserId (foreign key does not exist)', 'Dữ liệu tòa nhà/tầng/chủ sở hữu không tồn tại'],
      ['Selected floor does not belong to building', 'Tầng không thuộc tòa nhà đã chọn'],
      ['At least one field is required for update', 'Cần ít nhất một trường để cập nhật'],
      ['No fields to update', 'Cần ít nhất một trường để cập nhật']
    ]
    const matched = translatedMessages.find(([en]) => rawMessage.includes(en))
    return matched?.[1] || rawMessage
  }

  const logApiSuccess = (action: string, response: any) => {
    console.log(`[Apartment][${action}] success`, {
      status: response?.status,
      endpoint: response?.config?.url,
      method: response?.config?.method,
      data: response?.data
    })
  }

  const logApiError = (action: string, error: any) => {
    console.error(`[Apartment][${action}] error`, {
      status: error?.response?.status,
      endpoint: error?.config?.url || error?.response?.config?.url,
      method: error?.config?.method || error?.response?.config?.method,
      data: error?.response?.data,
      message: error?.message
    })
  }

  const apartmentsQuery = useQuery({
    queryKey: ['apartments', page, search, statusFilter, buildingFilter, floorFilter],
    queryFn: async () => {
      const response = await apartmentsApi.getAll({
        page,
        size: 10,
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        buildingId: buildingFilter === 'ALL' ? undefined : Number(buildingFilter),
        floorId: floorFilter === 'ALL' ? undefined : Number(floorFilter)
      })
      logApiSuccess('GetAll', response)
      return response
    }
  })

  const buildingsQuery = useQuery({
    queryKey: ['apartment-buildings'],
    queryFn: () => buildingApi.getAllBuildings({ page: 0, size: 500, status: 'ACTIVE' })
  })

  const floorsQuery = useQuery({
    queryKey: ['apartment-floors', buildingFilter],
    queryFn: async () => {
      const response = await floorsApi.getAll({
        page: 0,
        size: 100,
        buildingId: buildingFilter === 'ALL' ? undefined : Number(buildingFilter),
        status: 'active'
      })
      logApiSuccess('GetFloors', response)
      return response
    }
  })

  const modalFloorsQuery = useQuery({
    queryKey: ['apartment-modal-floors', modalBuildingId],
    queryFn: async () => {
      if (!modalBuildingId) return { data: { data: [] as Floor[] } } as any
      const response = await floorsApi.getAll({
        page: 0,
        size: 100,
        buildingId: Number(modalBuildingId),
        status: 'active'
      })
      logApiSuccess('GetModalFloors', response)
      return response
    }
  })

  const apartments = apartmentsQuery.data?.data?.data || []
  const buildings: Buildings[] = buildingsQuery.data?.data?.data || []
  const floors: Floor[] = floorsQuery.data?.data?.data || []
  const modalFloors: Floor[] = modalFloorsQuery.data?.data?.data || []
  const currentPage = apartmentsQuery.data?.data.page ?? 0
  const totalElements = apartmentsQuery.data?.data.totalElements ?? 0
  const totalPages = apartmentsQuery.data?.data.totalPages ?? 1

  const buildingMap = useMemo(() => {
    const m = new Map<string, string>()
    buildings.forEach((b) => m.set(String(b.id), b.name))
    return m
  }, [buildings])

  const floorMap = useMemo(() => {
    const m = new Map<string, string>()
    floors.forEach((f) => m.set(String(f.id), `Tầng ${f.floorNumber}${f.name ? ` - ${f.name}` : ''}`))
    return m
  }, [floors])

  useEffect(() => {
    if (floorFilter === 'ALL') return
    const stillExists = floors.some((f) => String(f.id) === floorFilter)
    if (!stillExists) setFloorFilter('ALL')
  }, [floors, floorFilter])

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      id?: number
      buildingId: number
      floorId: number
      apartmentCode: string
      area: number
      bedrooms: number
      bathrooms: number
      balconyDirection?: string
      status: ApartmentStatus
    }) => {
      const response = payload.id
        ? await apartmentsApi.update(payload.id, payload)
        : await apartmentsApi.create(payload)
      return response as any
    },
    onSuccess: (response) => {
      logApiSuccess(editing ? 'Update' : 'Create', response)
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
      setIsCreateOpen(false)
      setEditing(null)
      setFormError(null)
    },
    onError: (error: any) => {
      logApiError('Save', error)
      setFormError(getApiErrorMessage(error, 'Không lưu được căn hộ'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apartmentsApi.delete(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
    },
    onError: (error: any) => {
      logApiError('Delete', error)
      setFormError(getApiErrorMessage(error, 'Xóa căn hộ thất bại'))
    }
  })

  const summary = useMemo(
    () => ({
      total: apartments.length,
      available: apartments.filter((a) => a.status === 'AVAILABLE').length,
      occupied: apartments.filter((a) => a.status === 'OCCUPIED').length,
      inactive: apartments.filter((a) => a.status === 'INACTIVE').length
    }),
    [apartments]
  )

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div>
            <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
              Administration
            </span>
            <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý căn hộ</h1>
            <p className='text-sm text-gray-500'>Quản lý danh sách căn hộ với lọc theo tòa nhà, tầng, trạng thái.</p>
          </div>
          <button
            onClick={() => {
              setEditing(null)
              setFormError(null)
              setModalBuildingId('')
              setModalFloorId('')
              setIsCreateOpen(true)
            }}
            className='flex items-center gap-2 rounded-lg bg-[#0052CC] px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-blue-700'
          >
            + Thêm căn hộ
          </button>
        </div>

        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Tổng trên trang</div>
            <div className='mt-2 text-3xl font-bold text-gray-900'>{summary.total}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Sẵn sàng</div>
            <div className='mt-2 text-3xl font-bold text-emerald-600'>{summary.available}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Đang ở</div>
            <div className='mt-2 text-3xl font-bold text-amber-600'>{summary.occupied}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Đã xóa</div>
            <div className='mt-2 text-3xl font-bold text-red-500'>{summary.inactive}</div>
          </div>
        </div>

        <div className='mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm'>
          <form
            className='grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto_auto]'
            onSubmit={(e) => {
              e.preventDefault()
              setPage(0)
              setSearch(searchInput.trim())
            }}
          >
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='Tìm theo mã căn hộ'
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
            />
            <select
              value={buildingFilter}
              onChange={(e) => {
                setPage(0)
                setBuildingFilter(e.target.value)
                setFloorFilter('ALL')
              }}
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
            >
              <option value='ALL'>Tất cả tòa nhà</option>
              {buildings.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={floorFilter}
              onChange={(e) => {
                setPage(0)
                setFloorFilter(e.target.value)
              }}
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
            >
              <option value='ALL'>Tất cả tầng</option>
              {floors.map((f) => (
                <option key={f.id} value={String(f.id)}>
                  Tầng {f.floorNumber}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(0)
                setStatusFilter(e.target.value as 'ALL' | ApartmentStatus)
              }}
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
            >
              <option value='ALL'>Tất cả trạng thái</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button className='rounded-lg bg-[#0052CC] px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700'>
              Tìm kiếm
            </button>
            <button
              type='button'
              onClick={() => {
                setPage(0)
                setSearchInput('')
                setSearch('')
                setBuildingFilter('ALL')
                setFloorFilter('ALL')
                setStatusFilter('ALL')
              }}
              className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
            >
              Làm mới
            </button>
          </form>
        </div>

        {formError && <div className='mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600'>{formError}</div>}

        <div className='mb-4 text-sm text-gray-500'>
          Hiển thị <span className='font-bold text-gray-700'>{apartments.length}</span> kết quả, tổng cộng{' '}
          <span className='font-bold text-gray-700'>{totalElements}</span> bản ghi.
        </div>

        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                  <th className='px-6 py-4'>Mã căn</th>
                  <th className='px-6 py-4'>Tòa nhà / Tầng</th>
                  <th className='px-6 py-4 text-center'>Diện tích</th>
                  <th className='px-6 py-4 text-center'>Ngủ / Tắm</th>
                  <th className='px-6 py-4'>Trạng thái</th>
                  <th className='px-6 py-4 text-right'>Hành động</th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-700'>
                {apartmentsQuery.isLoading && (
                  <tr>
                    <td className='px-6 py-8 text-center text-gray-500' colSpan={6}>
                      Đang tải dữ liệu căn hộ...
                    </td>
                  </tr>
                )}
                {apartmentsQuery.isError && (
                  <tr>
                    <td className='px-6 py-8 text-center text-red-500' colSpan={6}>
                      {getApiErrorMessage(apartmentsQuery.error, 'Không tải được danh sách căn hộ.')}
                    </td>
                  </tr>
                )}
                {!apartmentsQuery.isLoading && !apartmentsQuery.isError && apartments.length === 0 && (
                  <tr>
                    <td className='px-6 py-8 text-center text-gray-500' colSpan={6}>
                      Chưa có dữ liệu căn hộ.
                    </td>
                  </tr>
                )}
                {!apartmentsQuery.isLoading &&
                  !apartmentsQuery.isError &&
                  apartments.map((item) => (
                    <tr key={item.id} className='hover:bg-gray-50/50 transition-colors'>
                      <td className='px-6 py-5 font-semibold text-gray-900'>{item.apartmentCode}</td>
                      <td className='px-6 py-5'>
                        <div>{buildingMap.get(String(item.buildingId)) || `#${item.buildingId}`}</div>
                        <div className='text-xs text-gray-500'>{floorMap.get(String(item.floorId)) || `#${item.floorId}`}</div>
                      </td>
                      <td className='px-6 py-5 text-center'>{item.area} m2</td>
                      <td className='px-6 py-5 text-center'>
                        {item.bedrooms} / {item.bathrooms}
                      </td>
                      <td className='px-6 py-5'>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            item.status === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.status === 'OCCUPIED'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className='px-6 py-5 text-right'>
                        <div className='inline-flex gap-3 text-sm font-medium'>
                          <button
                            type='button'
                            onClick={() => setSelectedItem(item)}
                            className='text-slate-700 hover:underline'
                          >
                            Chi tiết
                          </button>
                          <button
                            type='button'
                            onClick={() => {
                              setEditing(item)
                              setFormError(null)
                              setModalBuildingId(String(item.buildingId))
                              setModalFloorId(String(item.floorId))
                              setIsCreateOpen(true)
                            }}
                            className='text-[#0052CC] hover:underline'
                          >
                            Sửa
                          </button>
                          <button
                            type='button'
                            disabled={item.status === 'INACTIVE' || deleteMutation.isPending}
                            onClick={() => {
                              const ok = window.confirm(`Bạn chắc chắn muốn xóa căn ${item.apartmentCode}?`)
                              if (!ok) return
                              deleteMutation.mutate(item.id)
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
            <div className='w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl'>
              <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
                <h2 className='text-xl font-bold text-gray-800'>{editing ? 'Cập nhật căn hộ' : 'Thêm căn hộ'}</h2>
                <button onClick={() => !saveMutation.isPending && setIsCreateOpen(false)} className='text-gray-400 hover:text-gray-600'>
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
                      id: editing?.id,
                      buildingId: Number(modalBuildingId),
                      floorId: Number(modalFloorId),
                      apartmentCode: String(fd.get('apartmentCode') || '').trim(),
                      area: Number(fd.get('area')),
                      bedrooms: Number(fd.get('bedrooms')),
                      bathrooms: Number(fd.get('bathrooms')),
                      balconyDirection: (String(fd.get('balconyDirection') || '').trim().toUpperCase() || undefined) as
                        | 'NORTH'
                        | 'SOUTH'
                        | 'EAST'
                        | 'WEST'
                        | 'NORTHEAST'
                        | 'NORTHWEST'
                        | 'SOUTHEAST'
                        | 'SOUTHWEST'
                        | undefined,
                      status: String(fd.get('status') || 'AVAILABLE') as ApartmentStatus
                    })
                  }}
                >
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Tòa nhà</label>
                      <select
                        name='buildingId'
                        value={modalBuildingId}
                        onChange={(e) => {
                          setModalBuildingId(e.target.value)
                          setModalFloorId('')
                        }}
                        required
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      >
                        <option value=''>Chọn tòa nhà</option>
                        {buildings.map((b) => (
                          <option key={b.id} value={String(b.id)}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Tầng</label>
                      <select
                        name='floorId'
                        value={modalFloorId}
                        onChange={(e) => setModalFloorId(e.target.value)}
                        required
                        disabled={!modalBuildingId}
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      >
                        <option value=''>Chọn tầng</option>
                        {modalFloors.map((f) => (
                          <option key={f.id} value={String(f.id)}>
                            Tầng {f.floorNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Mã căn hộ</label>
                      <input
                        name='apartmentCode'
                        required
                        defaultValue={editing?.apartmentCode || ''}
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      />
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Diện tích (m2)</label>
                      <input
                        name='area'
                        type='number'
                        min={1}
                        step='0.1'
                        required
                        defaultValue={editing?.area ?? ''}
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Phòng ngủ</label>
                      <input
                        name='bedrooms'
                        type='number'
                        min={0}
                        required
                        defaultValue={editing?.bedrooms ?? 1}
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      />
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Phòng tắm</label>
                      <input
                        name='bathrooms'
                        type='number'
                        min={0}
                        required
                        defaultValue={editing?.bathrooms ?? 1}
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      />
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Trạng thái</label>
                      <select
                        name='status'
                        defaultValue={editing?.status || 'AVAILABLE'}
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-bold text-gray-700'>Hướng ban công (tuỳ chọn)</label>
                    <select
                      name='balconyDirection'
                      defaultValue={editing?.balconyDirection || ''}
                      className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                    >
                      {directionOptions.map((direction) => (
                        <option key={direction || 'EMPTY'} value={direction}>
                          {direction || 'Không chọn'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='flex justify-end gap-3 border-t border-gray-100 pt-4'>
                    <button
                      type='button'
                      disabled={saveMutation.isPending}
                      onClick={() => setIsCreateOpen(false)}
                      className='rounded-lg bg-gray-100 px-5 py-2.5 font-bold text-gray-600 transition hover:bg-gray-200 disabled:opacity-60'
                    >
                      Hủy
                    </button>
                    <button
                      type='submit'
                      disabled={saveMutation.isPending}
                      className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60'
                    >
                      {saveMutation.isPending ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {selectedItem && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm'>
            <div className='w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl'>
              <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
                <h2 className='text-xl font-bold text-gray-800'>Chi tiết căn hộ</h2>
                <button onClick={() => setSelectedItem(null)} className='text-gray-400 hover:text-gray-600'>Đóng</button>
              </div>
              <div className='grid grid-cols-1 gap-3 p-6 text-sm text-gray-700'>
                <div><span className='font-semibold text-gray-900'>ID:</span> #{selectedItem.id}</div>
                <div><span className='font-semibold text-gray-900'>Mã căn hộ:</span> {selectedItem.apartmentCode}</div>
                <div><span className='font-semibold text-gray-900'>Tòa nhà:</span> {buildingMap.get(String(selectedItem.buildingId)) || `#${selectedItem.buildingId}`}</div>
                <div><span className='font-semibold text-gray-900'>Tầng:</span> {floorMap.get(String(selectedItem.floorId)) || `#${selectedItem.floorId}`}</div>
                <div><span className='font-semibold text-gray-900'>Diện tích:</span> {selectedItem.area} m2</div>
                <div><span className='font-semibold text-gray-900'>Phòng ngủ / tắm:</span> {selectedItem.bedrooms} / {selectedItem.bathrooms}</div>
                <div><span className='font-semibold text-gray-900'>Trạng thái:</span> {selectedItem.status}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

