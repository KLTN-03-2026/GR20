import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { UserApi } from 'src/apis/User/user.api'
import { roleApi } from 'src/apis/role_api/role.api'
import type { UserManagementItem } from 'src/types/user-management.type'

type FilterStatus = 'all' | 'active' | 'inactive'

type UserFormData = {
  username: string
  password: string
  email: string
  fullName: string
  phone: string
  gender: string
  dateOfBirth: string
  idCard: string
  roleName: string
}

const translateUserError = (error: any, fallbackMessage: string) => {
  const apiError = error?.response?.data
  const firstFieldError = apiError?.errors ? Object.values(apiError.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiError?.formErrors?.[0] || apiError?.details || apiError?.message || fallbackMessage

  if (typeof rawMessage !== 'string') {
    return fallbackMessage
  }

  const translatedMessages: Array<[string, string]> = [
    ['Validation failed', 'Dữ liệu không hợp lệ'],
    ['Username or email already exists', 'Tên đăng nhập hoặc email đã tồn tại'],
    ['Username is required', 'Tên đăng nhập là bắt buộc'],
    ['Username must be at least 3 characters', 'Tên đăng nhập phải có ít nhất 3 ký tự'],
    ['Password is required', 'Mật khẩu là bắt buộc'],
    ['Password must be at least 6 characters', 'Mật khẩu phải có ít nhất 6 ký tự'],
    ['Email is required', 'Email là bắt buộc'],
    ['Email is invalid', 'Email không hợp lệ'],
    ["Default role 'Người Dùng' not found", 'Không tìm thấy vai trò mặc định cho người dùng'],
    ['User not found', 'Không tìm thấy người dùng'],
    ['No fields to update', 'Không có dữ liệu để cập nhật']
  ]

  const matched = translatedMessages.find(([english]) => rawMessage.includes(english))
  return matched?.[1] || rawMessage
}

const logApiSuccess = (action: string, response: any) => {
  console.log(`[Users][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

const logApiError = (action: string, error: any) => {
  console.error(`[Users][${action}] error`, {
    status: error?.response?.status,
    endpoint: error?.config?.url || error?.response?.config?.url,
    method: error?.config?.method || error?.response?.config?.method,
    data: error?.response?.data,
    message: error?.message
  })
}

export default function UserManagement() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [modalState, setModalState] = useState<{
    open: boolean
    mode: 'create' | 'edit' | 'view'
    user: UserManagementItem | null
  }>({
    open: false,
    mode: 'create',
    user: null
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<UserFormData>({
    defaultValues: {
      username: '',
      password: '',
      email: '',
      fullName: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      idCard: '',
      roleName: ''
    }
  })

  const rolesQuery = useQuery({
    queryKey: ['roles-for-users'],
    queryFn: async () => {
      const response = await roleApi.getAll({ page: 0, size: 100, status: 'active' })
      logApiSuccess('GetRoles', response)
      return response
    }
  })

  const usersQuery = useQuery({
    queryKey: ['users-management', page, search, statusFilter, roleFilter],
    queryFn: async () => {
      const response = await UserApi.getAllUsers({
        page,
        size: 10,
        search: search || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active'
      })
      logApiSuccess('GetAll', response)
      return response
    }
  })

  const roleOptions = rolesQuery.data?.data?.data || []
  const users = usersQuery.data?.data?.data || []
  const totalPages = Number(usersQuery.data?.data?.totalPages || 0)
  const currentPage = Number(usersQuery.data?.data?.page || 0)
  const totalElements = Number(usersQuery.data?.data?.totalElements || 0)

  if (usersQuery.isError) {
    logApiError('GetAll', usersQuery.error)
  }

  const summary = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => user.isActive).length,
      inactive: users.filter((user) => !user.isActive).length
    }),
    [users]
  )

  const openModal = (mode: 'create' | 'edit' | 'view', user: UserManagementItem | null = null) => {
    setModalState({ open: true, mode, user })
    reset({
      username: user?.username || '',
      password: '',
      email: user?.email || '',
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      dateOfBirth: user?.dateOfBirth || '',
      idCard: user?.idCard || '',
      roleName: user?.roleName || ''
    })
  }

  const closeModal = () => {
    setModalState({ open: false, mode: 'create', user: null })
    reset()
  }

  const applyFieldErrors = (error: any) => {
    const fieldErrors = error?.response?.data?.errors
    const setServerError = (field: keyof UserFormData, fallback: string) => {
      const fieldError = fieldErrors?.[field]?.[0]
      if (fieldError) {
        setError(field, {
          type: 'server',
          message: translateUserError({ response: { data: { message: fieldError } } }, fallback)
        })
      }
    }

    setServerError('username', 'Tên đăng nhập không hợp lệ')
    setServerError('password', 'Mật khẩu không hợp lệ')
    setServerError('email', 'Email không hợp lệ')
    setServerError('roleName', 'Vai trò không hợp lệ')
  }

  const createMutation = useMutation({
    mutationFn: (payload: UserFormData) => UserApi.create(payload),
    onSuccess: (response) => {
      logApiSuccess('Create', response)
      toast.success('Tạo người dùng thành công')
      queryClient.invalidateQueries({ queryKey: ['users-management'] })
      closeModal()
    },
    onError: (error: any) => {
      logApiError('Create', error)
      applyFieldErrors(error)
      toast.error(translateUserError(error, 'Tạo người dùng thất bại'))
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, any> }) => UserApi.update(id, payload),
    onSuccess: (response) => {
      logApiSuccess('Update', response)
      toast.success('Cập nhật người dùng thành công')
      queryClient.invalidateQueries({ queryKey: ['users-management'] })
      closeModal()
    },
    onError: (error: any) => {
      logApiError('Update', error)
      applyFieldErrors(error)
      toast.error(translateUserError(error, 'Cập nhật người dùng thất bại'))
    }
  })

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, roleName }: { id: number; roleName: string }) => UserApi.changeRole(id, roleName),
    onSuccess: (response) => {
      logApiSuccess('ChangeRole', response)
      toast.success('Đổi vai trò thành công')
      queryClient.invalidateQueries({ queryKey: ['users-management'] })
      closeModal()
    },
    onError: (error: any) => {
      logApiError('ChangeRole', error)
      applyFieldErrors(error)
      toast.error(translateUserError(error, 'Đổi vai trò thất bại'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => UserApi.delete(id),
    onSuccess: (response) => {
      logApiSuccess('Delete', response)
      toast.success('Xóa người dùng thành công')
      queryClient.invalidateQueries({ queryKey: ['users-management'] })
    },
    onError: (error: any) => {
      logApiError('Delete', error)
      toast.error(translateUserError(error, 'Xóa người dùng thất bại'))
    }
  })

  const onSubmit = handleSubmit((values) => {
    if (modalState.mode === 'create') {
      createMutation.mutate({
        ...values,
        phone: values.phone || undefined,
        fullName: values.fullName || undefined,
        gender: values.gender || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        idCard: values.idCard || undefined,
        roleName: values.roleName || undefined
      })
      return
    }

    if (!modalState.user) return

    const currentRoleName = modalState.user.roleName || ''
    const nextRoleName = values.roleName || ''
    const updatePayload = {
      username: values.username,
      email: values.email,
      fullName: values.fullName || undefined,
      phone: values.phone || undefined,
      gender: values.gender || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      idCard: values.idCard || undefined
    }

    updateMutation.mutate({ id: modalState.user.id, payload: updatePayload })
    if (nextRoleName && nextRoleName !== currentRoleName) {
      changeRoleMutation.mutate({ id: modalState.user.id, roleName: nextRoleName })
    }
  })

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div>
          <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
            Administration
          </span>
          <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý người dùng</h1>
          <p className='text-sm text-gray-500'>Trang test riêng cho quản lý user, lọc theo vai trò, đổi role và xóa.</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className='flex items-center gap-2 rounded-lg bg-[#0052CC] px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-blue-700'
        >
          + Thêm người dùng
        </button>
      </div>

      <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
          <div className='text-sm text-gray-500'>Tổng người dùng trên trang</div>
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
            placeholder='Tìm theo username, họ tên, email, số điện thoại'
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
          />
          <select
            value={roleFilter}
            onChange={(event) => {
              setPage(0)
              setRoleFilter(event.target.value)
            }}
            className='rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
          >
            <option value='all'>Tất cả vai trò</option>
            {roleOptions.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
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
            <option value='inactive'>Đã xóa</option>
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
              setRoleFilter('all')
              setStatusFilter('all')
            }}
            className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
          >
            Làm mới
          </button>
        </form>
      </div>

      <div className='mb-4 text-sm text-gray-500'>
        Hiển thị <span className='font-bold text-gray-700'>{users.length}</span> người dùng, tổng cộng{' '}
        <span className='font-bold text-gray-700'>{totalElements}</span> bản ghi.
      </div>

      <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
                <th className='px-6 py-4'>ID</th>
                <th className='px-6 py-4'>Tài khoản</th>
                <th className='px-6 py-4'>Liên hệ</th>
                <th className='px-6 py-4'>Vai trò</th>
                <th className='px-6 py-4'>Trạng thái</th>
                <th className='px-6 py-4 text-center'>Hành động</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-700'>
              {usersQuery.isLoading && (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              )}
              {usersQuery.isError && (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-red-500'>
                    {translateUserError(usersQuery.error, 'Không tải được danh sách người dùng')}
                  </td>
                </tr>
              )}
              {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                    Không có người dùng phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
              {!usersQuery.isLoading &&
                !usersQuery.isError &&
                users.map((user) => (
                  <tr key={user.id} className='border-b border-gray-50 transition hover:bg-gray-50/50'>
                    <td className='px-6 py-4 font-medium text-gray-400'>#{user.id.toString().padStart(3, '0')}</td>
                    <td className='px-6 py-4'>
                      <div className='font-bold text-gray-900'>{user.fullName || user.username}</div>
                      <div className='text-xs text-gray-400'>@{user.username}</div>
                    </td>
                    <td className='px-6 py-4 text-gray-600'>
                      <div>{user.email}</div>
                      <div className='text-xs text-gray-400'>{user.phone || 'Chưa có số điện thoại'}</div>
                    </td>
                    <td className='px-6 py-4 text-gray-700'>{user.roleName || 'Chưa gán vai trò'}</td>
                    <td className='px-6 py-4'>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          user.isActive
                            ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                            : 'border border-red-100 bg-red-50 text-red-600'
                        }`}
                      >
                        {user.isActive ? 'Đang hoạt động' : 'Đã xóa'}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex justify-center gap-3'>
                        <button onClick={() => openModal('view', user)} className='text-blue-500 transition hover:text-blue-700'>
                          Xem
                        </button>
                        <button onClick={() => openModal('edit', user)} className='text-orange-500 transition hover:text-orange-700'>
                          Sửa
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(user.id)}
                          disabled={!user.isActive || deleteMutation.isPending}
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
          <div className='w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl'>
            <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
              <h2 className='text-xl font-bold text-gray-800'>
                {modalState.mode === 'create' ? 'Thêm người dùng' : modalState.mode === 'edit' ? 'Cập nhật người dùng' : 'Chi tiết người dùng'}
              </h2>
              <button onClick={closeModal} className='text-gray-400 transition hover:text-gray-600'>
                Đóng
              </button>
            </div>

            <form onSubmit={onSubmit} className='space-y-4 p-6'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Tên đăng nhập</label>
                  <input
                    disabled={modalState.mode === 'view' || modalState.mode === 'edit'}
                    {...register('username', { required: 'Tên đăng nhập là bắt buộc' })}
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 disabled:bg-gray-100 disabled:text-gray-500'
                  />
                  {errors.username && <p className='mt-1 text-xs text-red-500'>{errors.username.message}</p>}
                </div>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Email</label>
                  <input
                    disabled={modalState.mode === 'view'}
                    {...register('email', { required: 'Email là bắt buộc' })}
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 disabled:bg-gray-100 disabled:text-gray-500'
                  />
                  {errors.email && <p className='mt-1 text-xs text-red-500'>{errors.email.message}</p>}
                </div>
              </div>

              {modalState.mode === 'create' && (
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Mật khẩu</label>
                  <input
                    type='password'
                    {...register('password', { required: 'Mật khẩu là bắt buộc' })}
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20'
                  />
                  {errors.password && <p className='mt-1 text-xs text-red-500'>{errors.password.message}</p>}
                </div>
              )}

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Họ và tên</label>
                  <input
                    disabled={modalState.mode === 'view'}
                    {...register('fullName')}
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 disabled:bg-gray-100 disabled:text-gray-500'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Số điện thoại</label>
                  <input
                    disabled={modalState.mode === 'view'}
                    {...register('phone')}
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 disabled:bg-gray-100 disabled:text-gray-500'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Giới tính</label>
                  <select
                    disabled={modalState.mode === 'view'}
                    {...register('gender')}
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 disabled:bg-gray-100 disabled:text-gray-500'
                  >
                    <option value=''>Chưa chọn</option>
                    <option value='MALE'>Nam</option>
                    <option value='FEMALE'>Nữ</option>
                    <option value='OTHER'>Khác</option>
                  </select>
                </div>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>Ngày sinh</label>
                  <input
                    type='date'
                    disabled={modalState.mode === 'view'}
                    {...register('dateOfBirth')}
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 disabled:bg-gray-100 disabled:text-gray-500'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-bold text-gray-700'>CCCD</label>
                  <input
                    disabled={modalState.mode === 'view'}
                    {...register('idCard')}
                    className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 disabled:bg-gray-100 disabled:text-gray-500'
                  />
                </div>
              </div>

              <div>
                <label className='mb-1 block text-sm font-bold text-gray-700'>Vai trò</label>
                <select
                  disabled={modalState.mode === 'view'}
                  {...register('roleName')}
                  className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 disabled:bg-gray-100 disabled:text-gray-500'
                >
                  <option value=''>Mặc định là Người Dùng</option>
                  {roleOptions.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {errors.roleName && <p className='mt-1 text-xs text-red-500'>{errors.roleName.message}</p>}
              </div>

              {modalState.mode === 'view' && modalState.user && (
                <div className='grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 text-sm text-gray-600 md:grid-cols-2'>
                  <div>
                    <div className='text-xs font-bold uppercase tracking-wider text-gray-400'>Trạng thái</div>
                    <div className='mt-1'>{modalState.user.isActive ? 'Đang hoạt động' : 'Đã xóa'}</div>
                  </div>
                  <div>
                    <div className='text-xs font-bold uppercase tracking-wider text-gray-400'>Ngày tạo</div>
                    <div className='mt-1'>{new Date(modalState.user.createdAt).toLocaleString('vi-VN')}</div>
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
                    disabled={createMutation.isPending || updateMutation.isPending || changeRoleMutation.isPending}
                    className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {createMutation.isPending || updateMutation.isPending || changeRoleMutation.isPending
                      ? 'Đang xử lý...'
                      : 'Lưu thông tin'}
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
