import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { maintenanceRequestsApi } from 'src/apis/maintenance_api/maintenance-requests.api'
import type { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from 'src/types/maintenance.type'

const logApiSuccess = (action: string, response: any) => {
  console.log(`[MaintenanceRequests][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

const logApiError = (action: string, err: any) => {
  console.error(`[MaintenanceRequests][${action}] error`, {
    status: err?.response?.status,
    endpoint: err?.config?.url || err?.response?.config?.url,
    method: err?.config?.method || err?.response?.config?.method,
    data: err?.response?.data,
    message: err?.message
  })
}

const getApiErrorMessage = (err: any, fallback: string) => {
  const apiErr = err?.response?.data
  const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
  const raw = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallback
  return typeof raw === 'string' ? raw : fallback
}

export default function MaintenanceRequestsAdminPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | MaintenanceStatus>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | MaintenancePriority>('ALL')
  const [screenError, setScreenError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MaintenanceRequest | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MaintenanceRequest | null>(null)

  const query = useQuery({
    queryKey: ['maintenance-requests', page, search, statusFilter, priorityFilter],
    queryFn: async () => {
      const response = await maintenanceRequestsApi.getAll({
        page,
        size: 10,
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        priority: priorityFilter === 'ALL' ? undefined : priorityFilter
      })
      logApiSuccess('GetAll', response)
      return response
    }
  })

  const list: MaintenanceRequest[] = query.data?.data?.data || []
  const totalPages = Number(query.data?.data?.totalPages || 0)
  const currentPage = Number(query.data?.data?.page || 0)
  const totalElements = Number(query.data?.data?.totalElements || 0)

  const summary = useMemo(
    () => ({
      total: list.length,
      pending: list.filter((i) => i.status === 'PENDING').length,
      inProgress: list.filter((i) => i.status === 'IN_PROGRESS').length,
      completed: list.filter((i) => i.status === 'COMPLETED').length
    }),
    [list]
  )

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; description?: string; priority?: MaintenancePriority }) =>
      maintenanceRequestsApi.create({
        title: payload.title,
        description: payload.description || null,
        priority: payload.priority || 'MEDIUM'
      } as any),
    onSuccess: (res) => {
      logApiSuccess('Create', res)
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] })
      setIsCreateOpen(false)
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Create', err)
      setScreenError(getApiErrorMessage(err, 'Tạo yêu cầu thất bại'))
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<MaintenanceRequest> }) =>
      maintenanceRequestsApi.update(id, payload),
    onSuccess: (res) => {
      logApiSuccess('Update', res)
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] })
      setEditingItem(null)
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Update', err)
      setScreenError(getApiErrorMessage(err, 'Cập nhật yêu cầu thất bại'))
    }
  })

  if (query.isError) logApiError('GetAll', query.error)

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div>
            <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
              Administration
            </span>
            <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý yêu cầu bảo trì</h1>
            <p className='text-sm text-gray-500'>Danh sách yêu cầu bảo trì theo trạng thái và mức ưu tiên.</p>
          </div>
          <button
            className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-semibold text-white hover:bg-blue-700'
            onClick={() => setIsCreateOpen(true)}
          >
            + Tạo yêu cầu
          </button>
        </div>

        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Tổng trên trang</div>
            <div className='mt-2 text-3xl font-bold text-gray-900'>{summary.total}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>PENDING</div>
            <div className='mt-2 text-3xl font-bold text-amber-600'>{summary.pending}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>IN_PROGRESS</div>
            <div className='mt-2 text-3xl font-bold text-blue-600'>{summary.inProgress}</div>
          </div>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>COMPLETED</div>
            <div className='mt-2 text-3xl font-bold text-emerald-600'>{summary.completed}</div>
          </div>
        </div>

        {(screenError || query.isError) && (
          <div className='mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>
            {screenError || getApiErrorMessage(query.error, 'Tải danh sách yêu cầu thất bại')}
          </div>
        )}

        <div className='mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm'>
          <form
            className='grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto]'
            onSubmit={(e) => {
              e.preventDefault()
              setPage(0)
              setSearch(searchInput.trim())
            }}
          >
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='Tìm theo mã yêu cầu, tiêu đề hoặc mô tả'
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(0)
                setStatusFilter(e.target.value as any)
              }}
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
            >
              <option value='ALL'>Tất cả trạng thái</option>
              <option value='PENDING'>PENDING</option>
              <option value='IN_PROGRESS'>IN_PROGRESS</option>
              <option value='COMPLETED'>COMPLETED</option>
              <option value='CANCELLED'>CANCELLED</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPage(0)
                setPriorityFilter(e.target.value as any)
              }}
              className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
            >
              <option value='ALL'>Tất cả ưu tiên</option>
              <option value='HIGH'>HIGH</option>
              <option value='MEDIUM'>MEDIUM</option>
              <option value='LOW'>LOW</option>
            </select>
            <button className='rounded-lg bg-[#0052CC] px-4 py-2.5 font-semibold text-white hover:bg-blue-700'>Tìm kiếm</button>
          </form>
        </div>

        <div className='mb-4 text-sm text-gray-500'>
          Hiển thị <span className='font-bold text-gray-700'>{list.length}</span> kết quả, tổng cộng{' '}
          <span className='font-bold text-gray-700'>{totalElements}</span> bản ghi.
        </div>

        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                <th className='px-6 py-4'>Mã</th>
                <th className='px-6 py-4'>Tiêu đề</th>
                <th className='px-6 py-4'>Ưu tiên</th>
                <th className='px-6 py-4'>Trạng thái</th>
                <th className='px-6 py-4 text-right'>Hành động</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-700'>
              {query.isLoading && (
                <tr>
                  <td colSpan={5} className='px-6 py-8 text-center text-gray-500'>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}
              {!query.isLoading &&
                list.map((item) => (
                  <tr key={item.id} className='border-b border-gray-50 hover:bg-gray-50/50'>
                    <td className='px-6 py-4 font-mono text-xs text-gray-500'>{item.requestCode || `#${item.id}`}</td>
                    <td className='px-6 py-4'>
                      <div className='font-semibold text-gray-900'>{item.title}</div>
                      <div className='text-xs text-gray-500 line-clamp-1'>{item.description || ''}</div>
                    </td>
                    <td className='px-6 py-4'>{item.priority}</td>
                    <td className='px-6 py-4'>{item.status}</td>
                    <td className='px-6 py-4 text-right'>
                      <div className='inline-flex flex-wrap justify-end gap-2'>
                        <button
                          className='rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700'
                          onClick={() => {
                            setSelectedItem(item)
                            setIsDetailOpen(true)
                          }}
                        >
                          Chi tiết
                        </button>
                        <button
                          className='rounded-lg bg-indigo-100 px-3 py-1.5 text-xs text-indigo-700'
                          onClick={() => setEditingItem(item)}
                        >
                          Sửa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!query.isLoading && list.length === 0 && (
                <tr>
                  <td colSpan={5} className='px-6 py-8 text-center text-gray-500'>
                    Chưa có yêu cầu bảo trì.
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

        {isCreateOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm'>
            <div className='w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl'>
              <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
                <h2 className='text-xl font-bold text-gray-800'>Tạo yêu cầu bảo trì</h2>
                <button className='text-gray-400 hover:text-gray-600' onClick={() => setIsCreateOpen(false)}>
                  Đóng
                </button>
              </div>
              <form
                className='space-y-4 p-6'
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  createMutation.mutate({
                    title: String(fd.get('title') || ''),
                    description: String(fd.get('description') || ''),
                    priority: String(fd.get('priority') || 'MEDIUM') as MaintenancePriority
                  })
                }}
              >
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Tiêu đề</label>
                  <input
                    name='title'
                    required
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Mô tả</label>
                  <textarea
                    name='description'
                    rows={4}
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Ưu tiên</label>
                  <select
                    name='priority'
                    defaultValue='MEDIUM'
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none'
                  >
                    <option value='HIGH'>HIGH</option>
                    <option value='MEDIUM'>MEDIUM</option>
                    <option value='LOW'>LOW</option>
                  </select>
                </div>
                <div className='flex justify-end gap-3 border-t border-gray-100 pt-4'>
                  <button
                    type='button'
                    className='rounded-lg bg-gray-100 px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-200'
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type='submit'
                    disabled={createMutation.isPending}
                    className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-bold text-white hover:bg-blue-700 disabled:opacity-60'
                  >
                    {createMutation.isPending ? 'Đang lưu...' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDetailOpen && selectedItem && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm'>
            <div className='w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl'>
              <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
                <h2 className='text-xl font-bold text-gray-800'>Chi tiết yêu cầu</h2>
                <button
                  className='text-gray-400 hover:text-gray-600'
                  onClick={() => {
                    setIsDetailOpen(false)
                    setSelectedItem(null)
                  }}
                >
                  Đóng
                </button>
              </div>
              <div className='grid grid-cols-1 gap-3 p-6 text-sm text-gray-700'>
                <div>
                  <span className='font-semibold text-gray-900'>Mã yêu cầu:</span> {selectedItem.requestCode || `#${selectedItem.id}`}
                </div>
                <div>
                  <span className='font-semibold text-gray-900'>Tiêu đề:</span> {selectedItem.title}
                </div>
                <div>
                  <span className='font-semibold text-gray-900'>Mô tả:</span> {selectedItem.description || '-'}
                </div>
                <div>
                  <span className='font-semibold text-gray-900'>Ưu tiên:</span> {selectedItem.priority}
                </div>
                <div>
                  <span className='font-semibold text-gray-900'>Trạng thái:</span> {selectedItem.status}
                </div>
                <div>
                  <span className='font-semibold text-gray-900'>Kỹ thuật viên:</span> {selectedItem.technicianName || '-'}
                </div>
              </div>
            </div>
          </div>
        )}

        {editingItem && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm'>
            <div className='w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl'>
              <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
                <h2 className='text-xl font-bold text-gray-800'>Cập nhật yêu cầu bảo trì</h2>
                <button className='text-gray-400 hover:text-gray-600' onClick={() => setEditingItem(null)}>
                  Đóng
                </button>
              </div>
              <form
                className='space-y-4 p-6'
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  updateMutation.mutate({
                    id: editingItem.id,
                    payload: {
                      title: String(fd.get('title') || ''),
                      description: String(fd.get('description') || ''),
                      priority: String(fd.get('priority') || 'MEDIUM') as MaintenancePriority,
                      status: String(fd.get('status') || 'PENDING') as MaintenanceStatus,
                      notes: String(fd.get('notes') || '')
                    }
                  })
                }}
              >
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Tiêu đề</label>
                  <input
                    name='title'
                    defaultValue={editingItem.title}
                    required
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Mô tả</label>
                  <textarea
                    name='description'
                    defaultValue={editingItem.description || ''}
                    rows={4}
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Ưu tiên</label>
                  <select
                    name='priority'
                    defaultValue={editingItem.priority}
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none'
                  >
                    <option value='URGENT'>URGENT</option>
                    <option value='HIGH'>HIGH</option>
                    <option value='MEDIUM'>MEDIUM</option>
                    <option value='LOW'>LOW</option>
                  </select>
                </div>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Trạng thái</label>
                  <select
                    name='status'
                    defaultValue={editingItem.status}
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none'
                  >
                    <option value='PENDING'>PENDING</option>
                    <option value='IN_PROGRESS'>IN_PROGRESS</option>
                    <option value='COMPLETED'>COMPLETED</option>
                    <option value='CANCELLED'>CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Ghi chú</label>
                  <textarea
                    name='notes'
                    defaultValue={editingItem.notes || ''}
                    rows={3}
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                  />
                </div>
                <div className='flex justify-end gap-3 border-t border-gray-100 pt-4'>
                  <button
                    type='button'
                    className='rounded-lg bg-gray-100 px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-200'
                    onClick={() => setEditingItem(null)}
                  >
                    Hủy
                  </button>
                  <button
                    type='submit'
                    disabled={updateMutation.isPending}
                    className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-bold text-white hover:bg-blue-700 disabled:opacity-60'
                  >
                    {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

