import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import { employeeApi } from '../../apis/employee_api/employee.api'
import { buildingApi } from '../../apis/employee_api/building.api'

// BẮT LỖI CHUẨN CHỈ Ở ĐÂY
const schema = yup.object({
  fullName: yup.string().required('Vui lòng nhập họ tên'),

  email: yup
    .string()
    .required('Vui lòng nhập email')
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email không hợp lệ (Ví dụ: ten@gmail.com)'),

  roleId: yup.number().required('Vui lòng chọn vai trò'),

  buildingIds: yup
    .array()
    .of(yup.number())
    .min(1, 'Vui lòng chọn ít nhất 1 tòa nhà để quản lý')
    .required('Vui lòng chọn tòa nhà quản lý'),

  username: yup.string().when('$isEdit', {
    is: true,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.required('Vui lòng nhập tên đăng nhập').min(6, 'Ít nhất 6 ký tự')
  }),

  password: yup.string().when('$isEdit', {
    is: true,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.required('Vui lòng nhập mật khẩu').min(6, 'Ít nhất 6 ký tự')
  })
})

const ROLE_MAP: Record<number, string> = {
  3: 'Nhân viên vận hành',
  4: 'Bảo vệ'
}

export default function EmployeeManagement() {
  const queryClient = useQueryClient()
  const [modalState, setModalState] = useState<{ isOpen: boolean; mode: 'add' | 'edit' | 'view'; data: any }>({
    isOpen: false,
    mode: 'add',
    data: null
  })
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; employeeId: string | null; isActive: boolean }>({
    isOpen: false,
    employeeId: null,
    isActive: false
  })
  const [activeFilter, setActiveFilter] = useState('Tất cả')

  // STATE PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const {
    data: employeesData,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError
  } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll
  })

  const { data: buildingsData } = useQuery({
    queryKey: ['buildings'],
    queryFn: buildingApi.getAll
  })

  const employees = employeesData?.data?.data || employeesData?.data || employeesData
  const buildingsList = buildingsData?.data?.data || buildingsData?.data || buildingsData

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit: modalState.mode === 'edit' }
  })

  const openModal = async (mode: 'add' | 'edit' | 'view', data: any = null) => {
    if (mode === 'edit' || mode === 'view') {
      try {
        const res = await employeeApi.getById(data.id)
        const details = res?.data?.data || res?.data || res

        const formattedBuildingIds = details.buildingIds?.map((id: any) => String(id)) || []

        reset({
          fullName: details.fullName,
          email: details.email,
          roleId: details.roleId,
          buildingIds: formattedBuildingIds
        })
        setModalState({ isOpen: true, mode, data: details })
      } catch (error) {
        toast.error('Không thể lấy dữ liệu chi tiết của nhân viên này!')
      }
    } else {
      reset({ fullName: '', email: '', username: '', password: '', roleId: 3, buildingIds: [] })
      setModalState({ isOpen: true, mode: 'add', data: null })
    }
  }

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'add', data: null })
    reset()
  }

  const addMutation = useMutation({
    mutationFn: employeeApi.add,
    onSuccess: () => {
      toast.success('Thêm nhân viên thành công!')
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      closeModal()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi thêm mới!')
  })

  const updateMutation = useMutation({
    mutationFn: employeeApi.update,
    onSuccess: () => {
      toast.success('Cập nhật thông tin thành công!')
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      closeModal()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi cập nhật!')
  })

  const toggleMutation = useMutation({
    mutationFn: employeeApi.toggleStatus,
    onSuccess: (res: any) => {
      const data = res?.data?.data || res?.data || res
      toast.success(data?.isActive ? 'Đã mở khóa nhân viên!' : 'Đã khóa nhân viên thành công!')
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setConfirmModal({ isOpen: false, employeeId: null, isActive: false })
    },
    onError: () => toast.error('Lỗi cập nhật trạng thái!')
  })

  const onSubmit = (data: any) => {
    const formattedBuildingIds = data.buildingIds.map(Number)

    if (modalState.mode === 'add') {
      addMutation.mutate({
        ...data,
        roleId: Number(data.roleId),
        buildingIds: formattedBuildingIds
      })
    } else if (modalState.mode === 'edit') {
      updateMutation.mutate({
        id: modalState.data?.id,
        data: {
          fullName: data.fullName,
          email: data.email,
          roleId: Number(data.roleId),
          buildingIds: formattedBuildingIds
        }
      })
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'NV'
    const words = name.split(' ')
    return words.length >= 2
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  // XỬ LÝ LỌC VÀ PHÂN TRANG
  const filteredEmployees = useMemo(() => {
    return (
      employees?.filter((emp: any) => {
        if (activeFilter === 'Tất cả') return true
        if (activeFilter === 'Bảo vệ') return emp.roleId === 4
        if (activeFilter === 'Nhân viên vận hành') return emp.roleId === 3
        return true
      }) || []
    )
  }, [employees, activeFilter])

  const totalPages = Math.ceil(filteredEmployees.length / pageSize)
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  if (isEmployeesLoading) return <div className='p-8 text-center text-gray-500'>Đang tải dữ liệu...</div>
  if (isEmployeesError) return <div className='p-8 text-center text-red-500'>Lỗi kết nối máy chủ!</div>

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='flex justify-between items-start mb-8'>
        <div>
          <span className='bg-[#DDE7FF] text-[#0052CC] px-3 py-1 rounded text-xs font-bold tracking-wider uppercase'>
            Administration
          </span>
          <h1 className='text-3xl font-bold text-gray-900 mt-4 mb-2'>Quản lý Nhân viên</h1>
          <p className='text-gray-500 text-sm'>Duy trì và giám sát đội ngũ vận hành tòa nhà Homelink AI.</p>
        </div>
        <button
          onClick={() => openModal('add')}
          className='bg-[#0052CC] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 shadow-sm'
        >
          + Đăng ký Nhân viên mới
        </button>
      </div>

      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center gap-2 text-sm font-medium text-gray-500'>
          <span className='mr-4 font-bold text-gray-700'>BỘ LỌC:</span>
          {['Tất cả', 'Bảo vệ', 'Nhân viên vận hành'].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter)
                setCurrentPage(1) // Reset về trang 1 khi đổi bộ lọc
              }}
              className={`px-4 py-2 rounded-full transition ${activeFilter === filter ? 'bg-white shadow-sm text-blue-600 font-bold' : 'hover:bg-gray-200 text-gray-500'}`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className='text-sm text-gray-500'>
          Hiển thị <span className='font-bold text-gray-700'>{filteredEmployees.length}</span> kết quả
        </div>
      </div>

      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100'>
              <th className='py-4 px-6'>ID</th>
              <th className='py-4 px-6'>Họ và Tên</th>
              <th className='py-4 px-6'>Vai trò</th>
              <th className='py-4 px-6'>Trạng thái</th>
              <th className='py-4 px-6 text-center'>Hành động</th>
            </tr>
          </thead>
          <tbody className='text-sm text-gray-700'>
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={5} className='py-8 text-center text-gray-500'>
                  Chưa có dữ liệu
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((emp: any) => (
                <tr key={emp.id} className='border-b border-gray-50 hover:bg-gray-50/50 transition'>
                  <td className='py-4 px-6 text-gray-400 font-medium'>#{emp.id.toString().padStart(3, '0')}</td>
                  <td className='py-4 px-6 flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-full bg-[#E5EDFF] text-[#0052CC] flex items-center justify-center font-bold text-xs'>
                      {getInitials(emp.fullName)}
                    </div>
                    <div>
                      <div className='font-bold text-gray-900'>{emp.fullName}</div>
                      <div className='text-xs text-gray-400'>{emp.email}</div>
                    </div>
                  </td>
                  <td className='py-4 px-6'>
                    <div className='flex items-center gap-2 text-gray-600 font-medium'>
                      <svg className='w-4 h-4 text-gray-400' fill='currentColor' viewBox='0 0 20 20'>
                        <path
                          fillRule='evenodd'
                          d='M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        ></path>
                      </svg>
                      {ROLE_MAP[emp.roleId] || 'Nhân viên'}
                    </div>
                  </td>
                  <td className='py-4 px-6'>
                    {emp.isActive ? (
                      <span className='inline-flex items-center gap-1.5 bg-[#E8F8EE] text-[#0F9D58] px-3 py-1 rounded-full text-xs font-bold'>
                        <span className='w-1.5 h-1.5 rounded-full bg-[#0F9D58]'></span>Đang hoạt động
                      </span>
                    ) : (
                      <span className='inline-flex items-center gap-1.5 bg-[#FCE8E8] text-[#DB4437] px-3 py-1 rounded-full text-xs font-bold'>
                        <span className='w-1.5 h-1.5 rounded-full bg-[#DB4437]'></span>Bị khóa
                      </span>
                    )}
                  </td>
                  <td className='py-4 px-6 flex justify-center gap-3'>
                    <button
                      onClick={() => openModal('view', emp)}
                      className='text-blue-500 hover:text-blue-700'
                      title='Xem chi tiết'
                    >
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => openModal('edit', emp)}
                      className='text-orange-500 hover:text-orange-700'
                      title='Sửa thông tin'
                    >
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, employeeId: emp.id, isActive: emp.isActive })}
                      className='text-gray-400 hover:text-red-500 transition'
                      title={emp.isActive ? 'Khóa' : 'Mở khóa'}
                    >
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* NÚT ĐIỀU HƯỚNG PHÂN TRANG */}
        {totalPages > 1 && (
          <div className='px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30'>
            <span className='text-sm text-gray-500'>
              Trang {currentPage} / {totalPages}
            </span>
            <div className='flex gap-2'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmModal.isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center'>
            <div
              className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${confirmModal.isActive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
            >
              <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-2'>
              Xác nhận {confirmModal.isActive ? 'Khóa' : 'Mở khóa'}
            </h3>
            <p className='text-sm text-gray-500 mb-6'>
              Bạn có chắc chắn muốn {confirmModal.isActive ? 'khóa' : 'mở khóa'} nhân viên này không?
            </p>
            <div className='flex justify-center gap-3'>
              <button
                onClick={() => setConfirmModal({ isOpen: false, employeeId: null, isActive: false })}
                className='px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold transition'
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => toggleMutation.mutate(confirmModal.employeeId!)}
                disabled={toggleMutation.isPending}
                className={`px-5 py-2.5 text-white rounded-lg font-bold transition shadow-md ${confirmModal.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {toggleMutation.isPending ? 'Đang xử lý...' : confirmModal.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState.isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm py-10'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]'>
            <div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0 rounded-t-2xl'>
              <h2 className='text-xl font-bold text-gray-800'>
                {modalState.mode === 'add'
                  ? 'Thêm Nhân Viên'
                  : modalState.mode === 'edit'
                    ? 'Sửa Thông Tin'
                    : 'Chi Tiết'}
              </h2>
              <button onClick={closeModal} className='text-gray-400 hover:text-gray-600'>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
                </svg>
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className='p-6 space-y-4 overflow-y-auto flex-grow custom-scrollbar'
            >
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-1'>Họ và tên</label>
                <input
                  disabled={modalState.mode === 'view'}
                  {...register('fullName')}
                  className='w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/50 disabled:bg-gray-100 disabled:text-gray-500'
                  placeholder='Nguyễn Văn A'
                />
                {errors.fullName && <p className='text-red-500 text-xs mt-1'>{errors.fullName.message}</p>}
              </div>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-1'>Email</label>
                <input
                  disabled={modalState.mode === 'view'}
                  type='email'
                  {...register('email')}
                  className='w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/50 disabled:bg-gray-100 disabled:text-gray-500'
                  placeholder='email@example.com'
                />
                {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email.message}</p>}
              </div>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-1'>Vai trò</label>
                <select
                  disabled={modalState.mode === 'view'}
                  {...register('roleId')}
                  className='w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/50 disabled:bg-gray-100 disabled:text-gray-500'
                >
                  <option value={3}>Nhân viên vận hành</option>
                  <option value={4}>Bảo vệ</option>
                </select>
                {errors.roleId && <p className='text-red-500 text-xs mt-1'>{errors.roleId.message}</p>}
              </div>

              <div className='pt-2'>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  Tòa nhà quản lý <span className='text-red-500'>*</span>
                </label>
                <div className='grid grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-40 overflow-y-auto'>
                  {buildingsList?.map((b: any) => (
                    <label key={b.id} className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='checkbox'
                        value={b.id}
                        disabled={modalState.mode === 'view'}
                        {...register('buildingIds')}
                        className='w-4 h-4 text-[#0052CC] rounded border-gray-300 focus:ring-[#0052CC]'
                      />
                      <span className='text-sm text-gray-700'>
                        {b.name} <span className='text-gray-400 font-mono'>(ID: {b.id})</span>
                      </span>
                    </label>
                  ))}
                  {(!buildingsList || buildingsList.length === 0) && (
                    <span className='text-sm text-gray-500 italic col-span-2'>
                      Đang tải hoặc chưa có dữ liệu tòa nhà...
                    </span>
                  )}
                </div>
                {errors.buildingIds && <p className='text-red-500 text-xs mt-1'>{errors.buildingIds.message}</p>}
              </div>

              {modalState.mode === 'add' && (
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-1'>Tên đăng nhập</label>
                    <input
                      {...register('username')}
                      className='w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/50'
                      placeholder='taikhoan'
                    />
                    {errors.username && <p className='text-red-500 text-xs mt-1'>{errors.username.message}</p>}
                  </div>
                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-1'>Mật khẩu</label>
                    <input
                      type='password'
                      {...register('password')}
                      className='w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/50'
                      placeholder='••••••••'
                    />
                    {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password.message}</p>}
                  </div>
                </div>
              )}

              {modalState.mode === 'view' && (
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-1'>Tên đăng nhập</label>
                  <input
                    disabled
                    value={modalState.data?.username || ''}
                    className='w-full bg-gray-100 text-gray-500 border border-gray-200 rounded-lg px-4 py-2.5'
                  />
                </div>
              )}

              <div className='flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition'
                >
                  Đóng
                </button>
                {modalState.mode !== 'view' && (
                  <button
                    type='submit'
                    disabled={addMutation.isPending || updateMutation.isPending}
                    className='px-5 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg font-bold transition flex items-center shadow-md'
                  >
                    {addMutation.isPending || updateMutation.isPending ? 'Đang xử lý...' : 'Lưu thông tin'}
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
