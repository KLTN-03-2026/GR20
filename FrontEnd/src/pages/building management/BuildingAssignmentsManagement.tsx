import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { buildingAssignmentsApi } from 'src/apis/building_api/building-assignments.api'
import { buildingApi } from 'src/apis/building_api/buildings.api'
import { UserApi } from 'src/apis/User/user.api'
import type { BuildingAssignment } from 'src/types/building-assignment.type'

const getApiErrorMessage = (error: any, fallbackMessage: string) => {
  const apiErr = error?.response?.data
  const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
  if (typeof rawMessage !== 'string') return fallbackMessage

  const translatedMessages: Array<[string, string]> = [
    ['Validation failed', 'Dữ liệu không hợp lệ'],
    ['Building assignment not found', 'Không tìm thấy phân công tòa nhà'],
    ['Invalid userId or buildingId', 'Người dùng hoặc tòa nhà không hợp lệ'],
    ['No fields to update', 'Không có dữ liệu để cập nhật']
  ]

  const matched = translatedMessages.find(([en]) => rawMessage.includes(en))
  return matched?.[1] || rawMessage
}

const logApiSuccess = (action: string, response: any) => {
  console.log(`[BuildingAssignment][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

const logApiError = (action: string, error: any) => {
  console.error(`[BuildingAssignment][${action}] error`, {
    status: error?.response?.status,
    endpoint: error?.config?.url || error?.response?.config?.url,
    method: error?.config?.method || error?.response?.config?.method,
    data: error?.response?.data,
    message: error?.message
  })
}

export default function BuildingAssignmentsManagement() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('all')
  const [selectedAssignment, setSelectedAssignment] = useState<BuildingAssignment | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: assignmentsData, isLoading, isError, error } = useQuery({
    queryKey: ['building-assignments', page, search, isActiveFilter],
    queryFn: async () => {
      const response = await buildingAssignmentsApi.getAll({
        page,
        size: 10,
        search: search || undefined,
        isActive: isActiveFilter === 'all' ? undefined : isActiveFilter === 'active'
      })
      logApiSuccess('GetAll', response)
      return response
    }
  })

  const { data: buildingData } = useQuery({
    queryKey: ['buildings-for-assignment'],
    queryFn: () => buildingApi.getAllBuildings({ page: 0, size: 500 })
  })

  const { data: userData } = useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: () => UserApi.getAllUsers({ page: 0, size: 500, isActive: true })
  })

  const assignments = assignmentsData?.data?.data || []
  const totalPages = Number(assignmentsData?.data?.totalPages || 0)
  const currentPage = Number(assignmentsData?.data?.page || 0)
  const buildings = buildingData?.data?.data || []
  const users = userData?.data?.data || []

  const summary = useMemo(
    () => ({
      total: assignments.length,
      active: assignments.filter((item) => item.isActive).length,
      inactive: assignments.filter((item) => !item.isActive).length
    }),
    [assignments]
  )

  const saveMutation = useMutation({
    mutationFn: (payload: { id?: string; userId: number; buildingId: number; role: string }) => {
      if (payload.id) {
        return buildingAssignmentsApi.update(payload.id, {
          userId: payload.userId,
          buildingId: payload.buildingId,
          role: payload.role
        })
      }
      return buildingAssignmentsApi.create({
        userId: payload.userId,
        buildingId: payload.buildingId,
        role: payload.role
      })
    },
    onSuccess: (response) => {
      logApiSuccess(selectedAssignment ? 'Update' : 'Create', response)
      queryClient.invalidateQueries({ queryKey: ['building-assignments'] })
      setSelectedAssignment(null)
      setErrorMessage(null)
    },
    onError: (err: any) => {
      logApiError('Save', err)
      setErrorMessage(getApiErrorMessage(err, 'Không lưu được phân công'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => buildingAssignmentsApi.delete(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      queryClient.invalidateQueries({ queryKey: ['building-assignments'] })
      setErrorMessage(null)
    },
    onError: (err: any) => {
      logApiError('Delete', err)
      setErrorMessage(getApiErrorMessage(err, 'Xóa phân công thất bại'))
    }
  })

  if (isError) {
    logApiError('GetAll', error)
  }

  return (
    <div className='min-h-screen bg-slate-50 px-8 py-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex items-center justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900'>Quản lý phân công tòa nhà</h1>
            <p className='mt-2 text-sm text-slate-500'>Trang test riêng cho building assignments, có lọc và xóa.</p>
          </div>
        </div>

        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='rounded-2xl bg-white p-5 shadow-sm'>
            <div className='text-sm text-slate-500'>Tổng phân công trên trang</div>
            <div className='mt-2 text-3xl font-bold text-slate-900'>{summary.total}</div>
          </div>
          <div className='rounded-2xl bg-white p-5 shadow-sm'>
            <div className='text-sm text-slate-500'>Đang hoạt động</div>
            <div className='mt-2 text-3xl font-bold text-emerald-600'>{summary.active}</div>
          </div>
          <div className='rounded-2xl bg-white p-5 shadow-sm'>
            <div className='text-sm text-slate-500'>Đã xóa</div>
            <div className='mt-2 text-3xl font-bold text-red-500'>{summary.inactive}</div>
          </div>
        </div>

        <div className='mb-6 rounded-2xl bg-white p-4 shadow-sm'>
          <form
            className='grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]'
            onSubmit={(e) => {
              e.preventDefault()
              setPage(0)
              setSearch(searchInput.trim())
            }}
          >
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='Tìm theo người dùng, tòa nhà hoặc vai trò'
              className='rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            />
            <select
              value={isActiveFilter}
              onChange={(e) => {
                setPage(0)
                setIsActiveFilter(e.target.value)
              }}
              className='rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none'
            >
              <option value='all'>Tất cả trạng thái</option>
              <option value='active'>Đang hoạt động</option>
              <option value='inactive'>Đã xóa</option>
            </select>
          </form>
        </div>

        <div className='mb-6 rounded-2xl bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-slate-900'>{selectedAssignment ? 'Cập nhật phân công' : 'Tạo phân công mới'}</h2>
          {errorMessage && <div className='mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600'>{errorMessage}</div>}
          <form
            className='grid grid-cols-1 gap-4 md:grid-cols-4'
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              saveMutation.mutate({
                id: selectedAssignment?.id,
                userId: Number(fd.get('userId')),
                buildingId: Number(fd.get('buildingId')),
                role: String(fd.get('role') || '')
              })
            }}
          >
            <select
              name='userId'
              defaultValue={selectedAssignment?.userId || ''}
              className='rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none'
              required
            >
              <option value=''>Chọn người dùng</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName || user.username}
                </option>
              ))}
            </select>
            <select
              name='buildingId'
              defaultValue={selectedAssignment?.buildingId || ''}
              className='rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none'
              required
            >
              <option value=''>Chọn tòa nhà</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
            <input
              name='role'
              defaultValue={selectedAssignment?.role || ''}
              placeholder='Vai trò tại tòa nhà'
              className='rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              required
            />
            <div className='flex gap-2'>
              <button
                type='submit'
                disabled={saveMutation.isPending}
                className='rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
              >
                {saveMutation.isPending ? 'Đang lưu...' : selectedAssignment ? 'Cập nhật' : 'Tạo mới'}
              </button>
              {selectedAssignment && (
                <button
                  type='button'
                  onClick={() => setSelectedAssignment(null)}
                  className='rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200'
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        <div className='overflow-hidden rounded-2xl bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='bg-slate-50'>
                  {['Người dùng', 'Tòa nhà', 'Vai trò', 'Trạng thái', 'Thời gian', 'Hành động'].map((header) => (
                    <th key={header} className='px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500'>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {isLoading && (
                  <tr>
                    <td colSpan={6} className='px-6 py-6 text-sm text-slate-500'>
                      Đang tải phân công...
                    </td>
                  </tr>
                )}
                {!isLoading && assignments.length === 0 && (
                  <tr>
                    <td colSpan={6} className='px-6 py-6 text-sm text-slate-500'>
                      Chưa có dữ liệu phân công.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className='px-6 py-4 text-sm text-slate-800'>{assignment.fullName || assignment.username}</td>
                      <td className='px-6 py-4 text-sm text-slate-700'>{assignment.buildingName || assignment.buildingId}</td>
                      <td className='px-6 py-4 text-sm text-slate-700'>{assignment.role}</td>
                      <td className='px-6 py-4 text-sm'>
                        <span className={assignment.isActive ? 'text-emerald-600' : 'text-red-500'}>
                          {assignment.isActive ? 'Đang hoạt động' : 'Đã xóa'}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-sm text-slate-500'>{new Date(assignment.assignedAt).toLocaleDateString('vi-VN')}</td>
                      <td className='px-6 py-4'>
                        <div className='flex gap-3'>
                          <button
                            type='button'
                            onClick={() => setSelectedAssignment(assignment)}
                            className='text-blue-600 hover:text-blue-700'
                          >
                            Sửa
                          </button>
                          <button
                            type='button'
                            disabled={!assignment.isActive || deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(assignment.id)}
                            className='text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-slate-300'
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
            disabled={currentPage <= 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            className='rounded bg-slate-200 px-3 py-1 disabled:opacity-50'
          >
            Trang trước
          </button>
          <span>
            Trang {totalPages === 0 ? 0 : currentPage + 1}/{totalPages}
          </span>
          <button
            type='button'
            disabled={totalPages === 0 || currentPage + 1 >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className='rounded bg-slate-200 px-3 py-1 disabled:opacity-50'
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  )
}
