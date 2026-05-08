import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { maintenanceAssignmentsApi } from 'src/apis/maintenance_api/maintenance-assignments.api'
import { maintenanceRequestsApi } from 'src/apis/maintenance_api/maintenance-requests.api'
import { UserApi } from 'src/apis/User/user.api'

const logApiSuccess = (action: string, response: any) => {
  console.log(`[MaintenanceAssignments][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

const logApiError = (action: string, err: any) => {
  console.error(`[MaintenanceAssignments][${action}] error`, {
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

export default function MaintenanceAssignmentsAdminPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [screenError, setScreenError] = useState<string | null>(null)
  const [filterRequestId, setFilterRequestId] = useState('')
  const [filterTechnicalId, setFilterTechnicalId] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)

  const query = useQuery({
    queryKey: ['maintenance-assignments', page, filterRequestId, filterTechnicalId],
    queryFn: async () => {
      const response = await maintenanceAssignmentsApi.getAll({
        page,
        size: 10,
        requestId: filterRequestId ? Number(filterRequestId) : undefined,
        technicalId: filterTechnicalId ? Number(filterTechnicalId) : undefined
      })
      logApiSuccess('GetAll', response)
      return response
    }
  })
  const requestsQuery = useQuery({
    queryKey: ['maintenance-requests-options'],
    queryFn: () => maintenanceRequestsApi.getAll({ page: 0, size: 100, status: 'PENDING' })
  })
  const usersQuery = useQuery({
    queryKey: ['maintenance-technical-options'],
    queryFn: () => UserApi.getAllUsers({ page: 0, size: 100, isActive: true })
  })

  const list = query.data?.data?.data || []
  const requestOptions = requestsQuery.data?.data?.data || []
  const technicalOptions = usersQuery.data?.data?.data || []
  const totalPages = Number(query.data?.data?.totalPages || 0)
  const currentPage = Number(query.data?.data?.page || 0)
  const totalElements = Number(query.data?.data?.totalElements || 0)

  const summary = useMemo(() => ({ total: list.length }), [list])

  const createMutation = useMutation({
    mutationFn: (payload: { requestId: number; technicalId: number }) => maintenanceAssignmentsApi.create(payload),
    onSuccess: (res) => {
      logApiSuccess('Create', res)
      queryClient.invalidateQueries({ queryKey: ['maintenance-assignments'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Create', err)
      setScreenError(getApiErrorMessage(err, 'Tạo phân công thất bại'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => maintenanceAssignmentsApi.delete(id),
    onSuccess: (res) => {
      logApiSuccess('Delete', res)
      queryClient.invalidateQueries({ queryKey: ['maintenance-assignments'] })
      setScreenError(null)
    },
    onError: (err: any) => {
      logApiError('Delete', err)
      setScreenError(getApiErrorMessage(err, 'Xóa phân công thất bại'))
    }
  })

  if (query.isError) logApiError('GetAll', query.error)

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8'>
          <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
            Administration
          </span>
          <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý phân công bảo trì</h1>
          <p className='text-sm text-gray-500'>Gán kỹ thuật viên cho yêu cầu bảo trì (maintenance_assignments).</p>
        </div>

        <div className='mb-4 flex justify-end'>
          <button
            type='button'
            className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-semibold text-white hover:bg-blue-700'
            onClick={() => setIsCreateOpen(true)}
          >
            + Tạo phân công
          </button>
        </div>

        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='text-sm text-gray-500'>Tổng trên trang</div>
            <div className='mt-2 text-3xl font-bold text-gray-900'>{summary.total}</div>
          </div>
        </div>

        {(screenError || query.isError) && (
          <div className='mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>
            {screenError || getApiErrorMessage(query.error, 'Tải danh sách phân công thất bại')}
          </div>
        )}

        <div className='mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-3'>
          <input
            list='maintenance-request-options'
            value={filterRequestId}
            onChange={(e) => {
              setPage(0)
              setFilterRequestId(e.target.value)
            }}
            placeholder='Lọc theo requestId (all nếu để trống)'
            className='rounded-lg border border-gray-200 px-4 py-2.5'
          />
          <input
            list='maintenance-technical-options'
            value={filterTechnicalId}
            onChange={(e) => {
              setPage(0)
              setFilterTechnicalId(e.target.value)
            }}
            placeholder='Lọc theo technicalId (all nếu để trống)'
            className='rounded-lg border border-gray-200 px-4 py-2.5'
          />
          <button
            type='button'
            onClick={() => {
              setPage(0)
              setFilterRequestId('')
              setFilterTechnicalId('')
            }}
            className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-200'
          >
            Làm mới
          </button>
        </div>
        <datalist id='maintenance-request-options'>
          {requestOptions.map((item: any) => (
            <option key={item.id} value={String(item.id)}>
              {item.requestCode || item.title}
            </option>
          ))}
        </datalist>
        <datalist id='maintenance-technical-options'>
          {technicalOptions.map((item: any) => (
            <option key={item.id} value={String(item.id)}>
              {item.fullName || item.username || item.email}
            </option>
          ))}
        </datalist>

        <div className='mb-4 text-sm text-gray-500'>
          Hiển thị <span className='font-bold text-gray-700'>{list.length}</span> kết quả, tổng cộng{' '}
          <span className='font-bold text-gray-700'>{totalElements}</span> bản ghi.
        </div>

        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                <th className='px-6 py-4'>ID</th>
                <th className='px-6 py-4'>Request ID</th>
                <th className='px-6 py-4'>Technical ID</th>
                <th className='px-6 py-4'>Assigned at</th>
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
                list.map((item: any) => (
                  <tr key={item.id} className='border-b border-gray-50 hover:bg-gray-50/50'>
                    <td className='px-6 py-4 text-gray-500'>#{item.id}</td>
                    <td className='px-6 py-4 font-semibold text-gray-900'>{item.requestId}</td>
                    <td className='px-6 py-4'>{item.technicalId}</td>
                    <td className='px-6 py-4'>{item.assignedAt ? new Date(item.assignedAt).toLocaleString('vi-VN') : '--'}</td>
                    <td className='px-6 py-4 text-right'>
                      <div className='inline-flex gap-2'>
                        <button className='rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700' onClick={() => setSelectedItem(item)}>
                          Chi tiết
                        </button>
                        <button
                          className='rounded-lg bg-red-100 px-3 py-1.5 text-xs text-red-700'
                          onClick={() => deleteMutation.mutate(Number(item.id))}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!query.isLoading && list.length === 0 && (
                <tr>
                  <td colSpan={5} className='px-6 py-8 text-center text-gray-500'>
                    Chưa có phân công.
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
                <h2 className='text-xl font-bold text-gray-800'>Tạo phân công bảo trì</h2>
                <button
                  className='text-gray-400 hover:text-gray-600'
                  onClick={() => !createMutation.isPending && setIsCreateOpen(false)}
                >
                  Đóng
                </button>
              </div>
              <form
                className='space-y-4 p-6'
                onSubmit={(e) => {
                  e.preventDefault()
                  setScreenError(null)
                  const fd = new FormData(e.currentTarget)
                  createMutation.mutate({
                    requestId: Number(fd.get('requestId')),
                    technicalId: Number(fd.get('technicalId'))
                  })
                }}
              >
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Request ID</label>
                  <input
                    name='requestId'
                    required
                    list='maintenance-request-options'
                    placeholder='Chọn hoặc nhập requestId'
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Technical ID</label>
                  <input
                    name='technicalId'
                    required
                    list='maintenance-technical-options'
                    placeholder='Chọn hoặc nhập technicalId'
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                  />
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
        {selectedItem && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm'>
            <div className='w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl'>
              <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
                <h2 className='text-xl font-bold text-gray-800'>Chi tiết phân công</h2>
                <button className='text-gray-400 hover:text-gray-600' onClick={() => setSelectedItem(null)}>
                  Đóng
                </button>
              </div>
              <div className='grid grid-cols-1 gap-3 p-6 text-sm text-gray-700'>
                <div><span className='font-semibold text-gray-900'>ID:</span> #{selectedItem.id}</div>
                <div><span className='font-semibold text-gray-900'>Request ID:</span> {selectedItem.requestId}</div>
                <div><span className='font-semibold text-gray-900'>Technical ID:</span> {selectedItem.technicalId}</div>
                <div><span className='font-semibold text-gray-900'>Assigned at:</span> {selectedItem.assignedAt ? new Date(selectedItem.assignedAt).toLocaleString('vi-VN') : '--'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

