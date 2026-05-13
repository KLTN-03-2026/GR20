import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildingApi } from 'src/apis/building_api/buildings.api'
import { logResourceConsoleError } from 'src/utils/payment-console-log'
import ItemBuilding from './ItemBuilding'

export default function Buildings() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const buildingsListBase = location.pathname.startsWith('/admin/buildings') ? '/admin/buildings' : '/buildings'
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const getApiErrorMessage = (error: any, fallbackMessage: string) => {
    const apiErr = error?.response?.data
    const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
    const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
    if (typeof rawMessage !== 'string') return fallbackMessage

    const translatedMessages: Array<[string, string]> = [
      ['Validation failed', 'Dữ liệu không hợp lệ'],
      ['A building with this code already exists', 'Mã tòa nhà đã tồn tại'],
      ['Building not found', 'Không tìm thấy tòa nhà'],
      ['Code is required', 'Mã tòa nhà là bắt buộc'],
      ['Name is required', 'Tên tòa nhà là bắt buộc'],
      ['Address is required', 'Địa chỉ là bắt buộc'],
      ['At least one field is required for update', 'Cần ít nhất một trường để cập nhật']
    ]

    const matched = translatedMessages.find(([en]) => rawMessage.includes(en))
    return matched?.[1] || rawMessage
  }

  const logApiSuccess = (action: string, response: any) => {
    console.log(`[Building][${action}] success`, {
      status: response?.status,
      endpoint: response?.config?.url,
      method: response?.config?.method,
      data: response?.data
    })
  }

  const {
    data,
    isLoading,
    isError,
    error: buildingsError
  } = useQuery({
    queryKey: ['buildings', page, search, statusFilter],
    queryFn: async () => {
      const response = await buildingApi.getAllBuildings({
        page,
        size: 10,
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter
      })
      logApiSuccess('GetAll', response)
      return response
    }
  })

  const dataBuildings = data?.data.data
  const currentPage = data?.data.page ?? 0
  const totalElements = data?.data.totalElements ?? 0
  const totalPages = data?.data.totalPages ?? 1
  const editingBuilding = useMemo(
    () => dataBuildings?.find((b) => b.id === editingId) ?? null,
    [dataBuildings, editingId]
  )

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof buildingApi.createBuilding>[0]) =>
      editingBuilding && editingId
        ? buildingApi.updateBuilding(editingId, payload)
        : buildingApi.createBuilding(payload),
    onSuccess: (response) => {
      logApiSuccess(editingBuilding ? 'Update' : 'Create', response)
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
      setIsCreateOpen(false)
      setFormError(null)
      setEditingId(null)
    },
    onError: (error: any) => {
      logResourceConsoleError('Building', 'CreateOrUpdate', error)
      const msg = getApiErrorMessage(error, 'Không lưu được tòa nhà')
      setFormError(msg)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => buildingApi.deleteBuilding(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    },
    onError: (error: any) => {
      logResourceConsoleError('Building', 'Delete', error)
    }
  })

  const reopenMutation = useMutation({
    mutationFn: (id: string) => buildingApi.updateBuilding(id, { status: 'ACTIVE' }),
    onSuccess: (response) => {
      logApiSuccess('Reopen', response)
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    },
    onError: (error: any) => {
      logResourceConsoleError('Building', 'Reopen', error)
    }
  })


  const handleSubmitCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    createMutation.mutate({
      name: String(formData.get('name') || ''),
      code: String(formData.get('code') || ''),
      address: String(formData.get('address') || ''),
      totalFloors: Number(formData.get('totalFloors') || 0),
      totalApartments: Number(formData.get('totalApartments') || 0),
      yearBuilt: Number(formData.get('yearBuilt') || new Date().getFullYear()),
      status: 'ACTIVE'
    })
  }

  const handleDelete = (building: { id: string; name: string }) => {
    if (deleteMutation.isPending) return
    const ok = window.confirm(`Bạn chắc chắn muốn đóng tòa nhà "${building.name}"?`)
    if (!ok) return
    deleteMutation.mutate(building.id)
  }

  const handleReopen = (building: { id: string; name: string }) => {
    if (reopenMutation.isPending) return
    const ok = window.confirm(`Bạn muốn mở lại tòa nhà "${building.name}"?`)
    if (!ok) return
    reopenMutation.mutate(building.id)
  }

  if (isError) {
    logResourceConsoleError('Building', 'GetAll', buildingsError)
  }

  const summary = useMemo(
    () => ({
      total: dataBuildings?.length || 0,
      active: dataBuildings?.filter((b) => b.status === 'ACTIVE').length || 0,
      maintenance: dataBuildings?.filter((b) => b.status === 'MAINTENANCE').length || 0,
      closed: dataBuildings?.filter((b) => b.status === 'CLOSED').length || 0
    }),
    [dataBuildings]
  )

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div>
            <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
              Administration
            </span>
            <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý tòa nhà</h1>
            <p className='text-sm text-gray-500'>Quản lý danh sách tòa nhà với xóa theo trạng thái và lọc dữ liệu.</p>
          </div>
          <button
            onClick={() => {
              setFormError(null)
              setIsCreateOpen(true)
              setEditingId(null)
            }}
            className='flex items-center gap-2 rounded-lg bg-[#0052CC] px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-blue-700'
          >
            + Thêm tòa nhà
          </button>
        </div>

        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Tổng trên trang</div>
            <div className='mt-2 text-3xl font-bold text-gray-900'>{summary.total}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Đang hoạt động</div>
            <div className='mt-2 text-3xl font-bold text-emerald-600'>{summary.active}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Bảo trì</div>
            <div className='mt-2 text-3xl font-bold text-amber-600'>{summary.maintenance}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Đã xóa</div>
            <div className='mt-2 text-3xl font-bold text-red-500'>{summary.closed}</div>
          </div>
        </div>

        <div className='mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm'>
          <form
            className='grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto]'
            onSubmit={(event) => {
              event.preventDefault()
              setPage(0)
              setSearch(searchInput.trim())
            }}
          >
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder='Tìm theo tên, mã hoặc địa chỉ tòa nhà'
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
            />
            <select
              value={statusFilter}
              onChange={(event) => {
                setPage(0)
                setStatusFilter(event.target.value)
              }}
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
            >
              <option value='ALL'>Tất cả trạng thái</option>
              <option value='ACTIVE'>Đang hoạt động</option>
              <option value='MAINTENANCE'>Bảo trì</option>
              <option value='CLOSED'>Đã xóa</option>
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
                setStatusFilter('ALL')
              }}
              className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
            >
              Làm mới
            </button>
          </form>
        </div>

        <div className='mb-4 flex items-center justify-between text-sm text-gray-500'>
          <div>
            Hiển thị <span className='font-bold text-gray-700'>{dataBuildings?.length || 0}</span> kết quả, tổng cộng{' '}
            <span className='font-bold text-gray-700'>{totalElements}</span> bản ghi.
          </div>
        </div>

        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                  <th className='px-6 py-4'>Tòa nhà</th>
                  <th className='px-6 py-4'>Mã</th>
                  <th className='px-6 py-4'>Địa chỉ</th>
                  <th className='px-6 py-4 text-center'>Số tầng</th>
                  <th className='px-6 py-4 text-center'>Số căn</th>
                  <th className='px-6 py-4'>Trạng thái</th>
                  <th className='px-6 py-4 text-right'>Hành động</th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-700'>
                {isLoading && (
                  <tr>
                    <td className='px-6 py-8 text-center text-gray-500' colSpan={7}>
                      Đang tải dữ liệu tòa nhà...
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td className='px-6 py-8 text-center text-red-500' colSpan={7}>
                      {getApiErrorMessage(buildingsError, 'Không tải được danh sách tòa nhà.')}
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && (dataBuildings?.length || 0) === 0 && (
                  <tr>
                    <td className='px-6 py-8 text-center text-gray-500' colSpan={7}>
                      Chưa có dữ liệu tòa nhà.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !isError &&
                  dataBuildings?.map((building) => (
                    <ItemBuilding
                      key={building.id}
                      building={building}
                      onDelete={handleDelete}
                      onReopen={handleReopen}
                      onEdit={(b) => {
                        setEditingId(b.id)
                        setIsCreateOpen(true)
                        setFormError(null)
                      }}
                      onManageImages={(b) => {
                        navigate(`${buildingsListBase}/${b.id}`)
                      }}
                    />
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
                <h2 className='text-xl font-bold text-gray-800'>
                  {editingBuilding ? 'Cập nhật tòa nhà' : 'Thêm tòa nhà'}
                </h2>
                <button
                  onClick={() => !createMutation.isPending && setIsCreateOpen(false)}
                  className='text-gray-400 transition hover:text-gray-600'
                >
                  Đóng
                </button>
              </div>
              <div className='p-6'>
                {formError && <div className='mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600'>{formError}</div>}
                <form onSubmit={handleSubmitCreate} className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Tên tòa nhà</label>
                      <input
                        name='name'
                        required
                        defaultValue={editingBuilding?.name}
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      />
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Mã</label>
                      <input
                        name='code'
                        required
                        defaultValue={editingBuilding?.code}
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      />
                    </div>
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-bold text-gray-700'>Địa chỉ</label>
                    <input
                      name='address'
                      required
                      defaultValue={editingBuilding?.address}
                      className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                    />
                  </div>
                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Số tầng</label>
                      <input
                        name='totalFloors'
                        type='number'
                        min={1}
                        required
                        defaultValue={editingBuilding?.totalFloors}
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      />
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Số căn</label>
                      <input
                        name='totalApartments'
                        type='number'
                        min={0}
                        required
                        defaultValue={editingBuilding?.totalApartments}
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      />
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-bold text-gray-700'>Năm xây</label>
                      <input
                        name='yearBuilt'
                        type='number'
                        min={1800}
                        max={new Date().getFullYear() + 1}
                        required
                        defaultValue={editingBuilding?.yearBuilt}
                        className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                      />
                    </div>
                  </div>

                  <div className='flex justify-end gap-3 border-t border-gray-100 pt-4'>
                    <button
                      type='button'
                      disabled={createMutation.isPending}
                      onClick={() => setIsCreateOpen(false)}
                      className='rounded-lg bg-gray-100 px-5 py-2.5 font-bold text-gray-600 transition hover:bg-gray-200 disabled:opacity-60'
                    >
                      Hủy
                    </button>
                    <button
                      type='submit'
                      disabled={createMutation.isPending}
                      className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60'
                    >
                      {createMutation.isPending ? 'Đang lưu...' : editingBuilding ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
