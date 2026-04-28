import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { roleApi } from 'src/apis/role_api/role.api'
import type { Role } from 'src/types/role.type'

type FilterStatus = 'all' | 'active' | 'deleted'

type RoleFormData = {
  name: string
  description: string
}

const getRoleBadgeClasses = (deletedAt: string | null) =>
  deletedAt
    ? 'bg-red-50 text-red-600 border border-red-100'
    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'

const logApiSuccess = (action: string, response: any) => {
  console.log(`[Roles][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

const logApiError = (action: string, error: any) => {
  console.error(`[Roles][${action}] error`, {
    status: error?.response?.status,
    endpoint: error?.config?.url || error?.response?.config?.url,
    method: error?.config?.method || error?.response?.config?.method,
    data: error?.response?.data,
    message: error?.message
  })
}

const translateRoleError = (error: any, fallbackMessage: string) => {
  const apiError = error?.response?.data
  const firstFieldError = apiError?.errors ? Object.values(apiError.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiError?.formErrors?.[0] || apiError?.details || apiError?.message || fallbackMessage

  if (typeof rawMessage !== 'string') {
    return fallbackMessage
  }

  const translatedMessages: Array<[string, string]> = [
    ['Validation failed', 'Dữ liệu không hợp lệ'],
    ['Name is required', 'Tên vai trò là bắt buộc'],
    ['Name cannot be empty', 'Tên vai trò không được để trống'],
    ['Name is too long', 'Tên vai trò không được vượt quá 100 ký tự'],
    ['Description is too long', 'Mô tả không được vượt quá 500 ký tự'],
    ['At least one field is required for update', 'Cần ít nhất một trường để cập nhật'],
    ['A role with this name already exists', 'Tên vai trò đã tồn tại'],
    ['Role not found', 'Không tìm thấy vai trò'],
    ['No fields to update', 'Không có dữ liệu để cập nhật']
  ]

  const matched = translatedMessages.find(([english]) => rawMessage.includes(english))
  return matched?.[1] || rawMessage
}

export default function RoleManagement() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [modalState, setModalState] = useState<{ open: boolean; mode: 'create' | 'edit' | 'view'; role: Role | null }>({
    open: false,
    mode: 'create',
    role: null
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      description: ''
    }
  })

  const rolesQuery = useQuery({
    queryKey: ['roles', page, search, statusFilter],
    queryFn: async () => {
      const response = await roleApi.getAll({
        page,
        size: 10,
        search: search || undefined,
        includeDeleted: true,
        status: statusFilter
      })
      logApiSuccess('GetAll', response)
      return response
    }
  })

  const roles = rolesQuery.data?.data?.data || []
  const totalPages = Number(rolesQuery.data?.data?.totalPages || 0)
  const currentPage = Number(rolesQuery.data?.data?.page || 0)
  const totalElements = Number(rolesQuery.data?.data?.totalElements || 0)

  if (rolesQuery.isError) {
    logApiError('GetAll', rolesQuery.error)
  }

  const summary = useMemo(
    () => ({
      total: roles.length,
      active: roles.filter((role) => !role.deletedAt).length,
      deleted: roles.filter((role) => Boolean(role.deletedAt)).length
    }),
    [roles]
  )

  const openModal = (mode: 'create' | 'edit' | 'view', role: Role | null = null) => {
    setModalState({ open: true, mode, role })
    reset({
      name: role?.name || '',
      description: role?.description || ''
    })
  }

  const closeModal = () => {
    setModalState({ open: false, mode: 'create', role: null })
    reset({
      name: '',
      description: ''
    })
  }

  const applyFieldErrors = (error: any) => {
    const fieldErrors = error?.response?.data?.errors
    if (fieldErrors?.name?.[0]) {
      setError('name', {
        type: 'server',
        message: translateRoleError({ response: { data: { message: fieldErrors.name[0] } } }, 'Tên vai trò không hợp lệ')
      })
    }
    if (fieldErrors?.description?.[0]) {
      setError('description', {
        type: 'server',
        message: translateRoleError(
          { response: { data: { message: fieldErrors.description[0] } } },
          'Mô tả vai trò không hợp lệ'
        )
      })
    }
  }

  const createMutation = useMutation({
    mutationFn: (payload: RoleFormData) => roleApi.create(payload),
    onSuccess: (response) => {
      logApiSuccess('Create', response)
      toast.success('Tạo vai trò thành công')
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      closeModal()
    },
    onError: (error: any) => {
      logApiError('Create', error)
      applyFieldErrors(error)
      toast.error(translateRoleError(error, 'Tạo vai trò thất bại'))
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RoleFormData }) => roleApi.update(id, payload),
    onSuccess: (response) => {
      logApiSuccess('Update', response)
      toast.success('Cập nhật vai trò thành công')
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      closeModal()
    },
    onError: (error: any) => {
      logApiError('Update', error)
      applyFieldErrors(error)
      toast.error(translateRoleError(error, 'Cập nhật vai trò thất bại'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => roleApi.delete(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      toast.success('Xóa vai trò thành công')
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error: any) => {
      logApiError('Delete', error)
      toast.error(translateRoleError(error, 'Xóa vai trò thất bại'))
    }
  })

  const onSubmit = handleSubmit((values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim()
    }

    if (modalState.mode === 'edit' && modalState.role) {
      updateMutation.mutate({ id: modalState.role.id, payload })
      return
    }

    createMutation.mutate(payload)
  })

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div>
          <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
            Administration
          </span>
          <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý vai trò</h1>
          <p className='text-sm text-gray-500'>Quản lý danh sách quyền truy cập với xóa và đồng bộ trạng thái hiển thị.</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className='flex items-center gap-2 rounded-lg bg-[#0052CC] px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-blue-700'
        >
          + Thêm vai trò
        </button>
      </div>

      <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
          <div className='text-sm text-gray-500'>Tổng vai trò trên trang</div>
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
            placeholder='Tìm theo tên hoặc mô tả vai trò'
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(0)
              setStatusFilter(event.target.value as FilterStatus)
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
            }}
            className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
          >
            Làm mới
          </button>
        </form>
      </div>

      <div className='mb-4 flex items-center justify-between text-sm text-gray-500'>
        <div>
          Hiển thị <span className='font-bold text-gray-700'>{roles.length}</span> vai trò, tổng cộng{' '}
          <span className='font-bold text-gray-700'>{totalElements}</span> bản ghi.
        </div>
      </div>

      <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                <th className='px-6 py-4'>ID</th>
                <th className='px-6 py-4'>Tên vai trò</th>
                <th className='px-6 py-4'>Mô tả</th>
                <th className='px-6 py-4'>Trạng thái</th>
                <th className='px-6 py-4'>Ngày tạo</th>
                <th className='px-6 py-4 text-center'>Hành động</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-700'>
              {rolesQuery.isLoading && (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                    Đang tải danh sách vai trò...
                  </td>
                </tr>
              )}
              {rolesQuery.isError && (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-red-500'>
                    {translateRoleError(rolesQuery.error, 'Không tải được danh sách vai trò')}
                  </td>
                </tr>
              )}
              {!rolesQuery.isLoading && !rolesQuery.isError && roles.length === 0 && (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                    Không có vai trò phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
              {!rolesQuery.isLoading &&
                !rolesQuery.isError &&
                roles.map((role) => (
                  <tr key={role.id} className='border-b border-gray-50 transition hover:bg-gray-50/50'>
                    <td className='px-6 py-4 font-medium text-gray-400'>#{role.id.toString().padStart(3, '0')}</td>
                    <td className='px-6 py-4'>
                      <div className='font-bold text-gray-900'>{role.name}</div>
                    </td>
                    <td className='px-6 py-4 text-gray-600'>{role.description || 'Chưa có mô tả'}</td>
                    <td className='px-6 py-4'>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getRoleBadgeClasses(role.deletedAt)}`}>
                        {role.deletedAt ? 'Đã xóa' : 'Đang hoạt động'}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-gray-500'>
                      {role.createdAt ? new Date(role.createdAt).toLocaleDateString('vi-VN') : '--'}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex justify-center gap-3'>
                        <button onClick={() => openModal('view', role)} className='text-blue-500 transition hover:text-blue-700'>
                          Xem
                        </button>
                        <button
                          onClick={() => openModal('edit', role)}
                          disabled={Boolean(role.deletedAt)}
                          className='text-orange-500 transition hover:text-orange-700 disabled:cursor-not-allowed disabled:text-gray-300'
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(role.id)}
                          disabled={Boolean(role.deletedAt) || deleteMutation.isPending}
                          className='text-red-500 transition hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-300'
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

      {modalState.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm'>
          <div className='w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl'>
            <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
              <h2 className='text-xl font-bold text-gray-800'>
                {modalState.mode === 'create'
                  ? 'Thêm vai trò'
                  : modalState.mode === 'edit'
                    ? 'Cập nhật vai trò'
                    : 'Chi tiết vai trò'}
              </h2>
              <button onClick={closeModal} className='text-gray-400 transition hover:text-gray-600'>
                Đóng
              </button>
            </div>

            <form onSubmit={onSubmit} className='space-y-4 p-6'>
              <div>
                <label className='mb-1 block text-sm font-bold text-gray-700'>Tên vai trò</label>
                <input
                  disabled={modalState.mode === 'view'}
                  {...register('name', {
                    required: 'Tên vai trò là bắt buộc',
                    maxLength: {
                      value: 100,
                      message: 'Tên vai trò không được vượt quá 100 ký tự'
                    }
                  })}
                  className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 disabled:bg-gray-100 disabled:text-gray-500'
                  placeholder='Ví dụ: manager'
                />
                {errors.name && <p className='mt-1 text-xs text-red-500'>{errors.name.message}</p>}
              </div>

              <div>
                <label className='mb-1 block text-sm font-bold text-gray-700'>Mô tả</label>
                <textarea
                  disabled={modalState.mode === 'view'}
                  rows={4}
                  {...register('description', {
                    maxLength: {
                      value: 500,
                      message: 'Mô tả không được vượt quá 500 ký tự'
                    }
                  })}
                  className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 disabled:bg-gray-100 disabled:text-gray-500'
                  placeholder='Mô tả ngắn cho quyền này'
                />
                {errors.description && <p className='mt-1 text-xs text-red-500'>{errors.description.message}</p>}
              </div>

              {modalState.mode === 'view' && modalState.role && (
                <div className='grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 text-sm text-gray-600 md:grid-cols-2'>
                  <div>
                    <div className='text-xs font-bold uppercase tracking-wider text-gray-400'>Trạng thái</div>
                    <div className='mt-1'>{modalState.role.deletedAt ? 'Đã xóa' : 'Đang hoạt động'}</div>
                  </div>
                  <div>
                    <div className='text-xs font-bold uppercase tracking-wider text-gray-400'>Ngày tạo</div>
                    <div className='mt-1'>
                      {modalState.role.createdAt ? new Date(modalState.role.createdAt).toLocaleString('vi-VN') : '--'}
                    </div>
                  </div>
                </div>
              )}

              <div className='mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='rounded-lg bg-gray-100 px-5 py-2.5 font-bold text-gray-600 transition hover:bg-gray-200'
                >
                  Đóng
                </button>
                {modalState.mode !== 'view' && (
                  <button
                    type='submit'
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Đang xử lý...' : 'Lưu thông tin'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
