import { useContext, useEffect, useState, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { UserApi } from 'src/apis/User/user.api'
import { AppContext } from 'src/contexts/app.context'
import { useForm, type SubmitHandler } from 'react-hook-form'
import {
  updateProfileSchema,
  type UpdateProfileFormData,
  changePasswordSchema,
  type ChangePasswordFormData
} from 'src/utils/rules'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-toastify'
import Input from 'src/components/Input'

// Helper function to get error message from axios-like error objects
const getErrorMessage = (error: unknown): string | undefined => {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    return axiosError.response?.data?.message
  }
  return undefined
}

export default function Profile() {
  const { setUser } = useContext(AppContext)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => UserApi.uploadAvatar(file),
    onSuccess: (response) => {
      toast.success('Cập nhật avatar thành công!')
      // Cập nhật avatar URL trong state
      setUser((prev) => ({ ...prev, avatarUrl: response.data.data.avatarUrl }))
      refetch()
      setIsUploading(false)
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage || 'Upload avatar thất bại')
      setIsUploading(false)
    }
  })

  // Thêm hàm xử lý chọn file
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Kiểm tra kích thước (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File ảnh không được vượt quá 5MB')
      return
    }

    // Kiểm tra định dạng
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)')
      return
    }

    setIsUploading(true)
    uploadAvatarMutation.mutate(file)
  }

  const { data, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: UserApi.getProfile
  })
  const dataProfile = data?.data?.data

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm
  } = useForm<ChangePasswordFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(changePasswordSchema) as any,
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    watch
  } = useForm<UpdateProfileFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(updateProfileSchema) as any,
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      gender: 'OTHER',
      dateOfBirth: '',
      avatarUrl: ''
    }
  })
  const currentGender = watch('gender')

  const formatDateForInput = (isoString: string | undefined) => {
    if (!isoString) return ''

    // Tạo date object và điều chỉnh về local time
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }
  // console.log(currentGender)
  // Set giá trị mặc định khi có dataProfile
  useEffect(() => {
    if (dataProfile) {
      setValue('fullName', dataProfile.fullName || '')
      setValue('email', dataProfile.email || '')
      setValue('phone', dataProfile.phone || '')
      setValue('gender', (dataProfile.gender as 'MALE' | 'FEMALE' | 'OTHER') || 'OTHER')
      setValue('dateOfBirth', formatDateForInput(dataProfile.dateOfBirth))
      setValue('avatarUrl', dataProfile.avatarUrl || '')
    }
  }, [dataProfile, setValue])

  const updateProfileMutation = useMutation({
    mutationFn: (body: UpdateProfileFormData) => UserApi.updateProfile(body),
    onSuccess: (response) => {
      toast.success('Cập nhật hồ sơ thành công!')
      setUser(response.data.data)
      refetch()
      setIsModalOpen(false)
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage || 'Cập nhật thất bại')
    }
  })

  const changePasswordMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (body: ChangePasswordFormData) => UserApi.changePassword(body as any),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!')
      setIsChangePasswordModalOpen(false)
      resetPasswordForm()
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage || 'Đổi mật khẩu thất bại')
    }
  })

  const onSubmit: SubmitHandler<UpdateProfileFormData> = (data) => {
    // Validate required fields
    if (!data.fullName || !data.email || !data.phone || !data.gender || !data.dateOfBirth) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    updateProfileMutation.mutate(data)
  }

  const onSubmitPassword: SubmitHandler<ChangePasswordFormData> = (data) => {
    // Validate required fields
    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ tất cả các trường')
      return
    }
    changePasswordMutation.mutate(data)
  }

  const formatDateVN = (isoString: string | undefined) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day} tháng ${month}, ${year}`
  }

  // Hàm lấy avatar URL an toàn
  const getAvatarUrl = () => {
    if (!dataProfile?.avatarUrl) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(dataProfile?.fullName || 'User')}&background=005ab7&color=fff`
    }

    // Lấy tên file từ đường dẫn
    const filename = dataProfile.avatarUrl.split('/').pop()
    return `http://localhost:8000/test-file/${filename}`
  }

  if (!dataProfile) {
    return (
      <div className='bg-surface min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-slate-600'>Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface text-[#191c1e] min-h-screen font-['Manrope',sans-serif]">
      <div className='pb-12 px-6 md:px-12 max-w-6xl mx-auto'>
        {/* Hero Profile Section */}
        <section className='mb-12 flex flex-col md:flex-row items-center md:items-end gap-8'>
          {/* <div className='relative group'>
            <div className='h-32 w-32 md:h-44 md:w-44 rounded-full p-1.5 bg-gradient-to-tr from-[#005ab7] to-[#bdd6ff] shadow-2xl'>
              <img
                alt='Avatar'
                className='h-full w-full rounded-full object-cover border-4 border-white'
                src={
                  dataProfile.avatarUrl
                    ? `${BASE_URL}${dataProfile.avatarUrl}` // 👈 Thêm base URL
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(dataProfile.fullName || 'User')}&background=005ab7&color=fff`
                }
                // src={
                //   dataProfile.avatarUrl ||
                //   `https://ui-avatars.com/api/?name=${encodeURIComponent(dataProfile.fullName || 'User')}&background=005ab7&color=fff`
                // }
              />
            </div>
          </div> */}
          <div className='relative group'>
            <div className='h-32 w-32 md:h-44 md:w-44 rounded-full p-1.5 bg-gradient-to-tr from-[#005ab7] to-[#bdd6ff] shadow-2xl'>
              {/* <img
                alt='Avatar'
                className='h-full w-full rounded-full object-cover border-4 border-white'
                src={
                  dataProfile.avatarUrl
                    ? `${BASE_URL}${dataProfile.avatarUrl}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(dataProfile.fullName || 'User')}&background=005ab7&color=fff`
                }
              /> */}
              <img
                alt='Avatar'
                className='h-full w-full rounded-full object-cover border-4 border-white'
                src={getAvatarUrl()}
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dataProfile?.fullName || 'User')}&background=005ab7&color=fff`
                }}
              />
            </div>

            {/* 👉 Nút upload avatar - thêm phần này */}
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className='absolute bottom-0 right-0 bg-[#005ab7] text-white p-2 rounded-full shadow-lg hover:bg-[#004a9a] transition-all disabled:opacity-50'
            >
              <span className='material-symbols-outlined text-sm'>{isUploading ? 'hourglass_top' : 'camera_alt'}</span>
            </button>

            {/* Input file ẩn */}
            <input
              ref={fileInputRef}
              type='file'
              accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
              onChange={handleAvatarChange}
              className='hidden'
            />
          </div>

          <div className='text-center md:text-left flex-1'>
            <div className='flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2'>
              <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight text-[#191c1e]'>
                {dataProfile.fullName}
              </h2>
              <span className='px-3 py-1 bg-[#d4e3ff] text-[#2f486a] text-xs font-bold rounded-full tracking-wider uppercase'>
                {dataProfile.isActive ? 'Hoạt động' : 'Không Hoạt động'}
              </span>
            </div>
            <p className='text-[#414754] font-medium text-lg flex items-center justify-center md:justify-start gap-2'>
              <span className='material-symbols-outlined text-[#005ab7]'>verified</span>
              Cư dân Azure Serenity
            </p>
            <p className='text-sm text-[#717786] mt-1 italic'>Tham gia từ {formatDateVN(dataProfile.createdAt)}</p>
          </div>
          <div className='flex gap-4'>
            <button
              onClick={() => setIsModalOpen(true)}
              className='px-8 py-3 bg-gradient-to-tr from-[#005ab7] to-[#0072e5] text-white rounded-full font-semibold shadow-lg shadow-blue-900/10 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2'
            >
              <span className='material-symbols-outlined text-lg'>edit</span>
              Chỉnh sửa hồ sơ
            </button>
          </div>
        </section>

        {/* Bento Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Thông tin cá nhân */}
          <div className='md:col-span-2 bg-white p-8 rounded-3xl shadow-sm shadow-blue-900/5 relative overflow-hidden group'>
            <div className='absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity'>
              <span className='material-symbols-outlined text-8xl'>badge</span>
            </div>
            <div className='flex items-center gap-3 mb-8'>
              <div className='p-2 bg-[#005ab7]/5 rounded-xl'>
                <span className='material-symbols-outlined text-[#005ab7]'>person</span>
              </div>
              <h3 className='text-lg font-bold tracking-tight'>Thông tin cá nhân</h3>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12'>
              <div>
                <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Họ tên</p>
                <p className='text-[#191c1e] font-semibold text-lg'>{dataProfile.fullName}</p>
              </div>
              <div>
                <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Giới tính</p>
                <div className='flex items-center gap-2 text-[#191c1e] font-semibold text-lg'>
                  <span className='material-symbols-outlined text-blue-500'>
                    {dataProfile.gender === 'MALE'
                      ? 'male'
                      : dataProfile.gender === 'FEMALE'
                        ? 'female'
                        : 'transgender'}
                  </span>
                  {dataProfile.gender === 'MALE' ? 'Nam' : dataProfile.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                </div>
              </div>
              <div>
                <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Ngày sinh</p>
                <p className='text-[#191c1e] font-semibold text-lg'>{formatDateVN(dataProfile.dateOfBirth)}</p>
              </div>
              <div>
                <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Mã cư dân</p>
                <p className='text-[#191c1e] font-semibold text-lg'>{dataProfile.id}</p>
              </div>
            </div>
          </div>

          {/* Tài khoản */}
          <div className='bg-white p-8 rounded-3xl shadow-sm shadow-blue-900/5 relative overflow-hidden'>
            <div className='flex items-center gap-3 mb-8'>
              <div className='p-2 bg-[#005ab7]/5 rounded-xl'>
                <span className='material-symbols-outlined text-[#005ab7]'>shield_person</span>
              </div>
              <h3 className='text-lg font-bold tracking-tight'>Tài khoản</h3>
            </div>
            <div className='space-y-8'>
              <div>
                <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Vai trò</p>
                <div className='inline-flex items-center gap-2 px-3 py-1 bg-[#d3e5f1] text-blue-600 rounded-lg font-bold text-sm'>
                  {dataProfile.roles?.join(', ') || 'Người dùng'}
                </div>
              </div>
              <div>
                <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Bảo mật</p>
                <button
                  type='button'
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className='mt-2 w-full py-3 bg-[#f2f4f6] text-[#005ab7] rounded-full font-bold text-sm hover:bg-[#e6e8ea] transition-colors flex items-center justify-center gap-2 border border-[#c1c6d7]/15'
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>

          {/* Thông tin liên lạc */}
          <div className='md:col-span-3 bg-white p-8 rounded-3xl shadow-sm shadow-blue-900/5 relative overflow-hidden'>
            <div className='flex items-center gap-3 mb-8'>
              <div className='p-2 bg-[#005ab7]/5 rounded-xl'>
                <span className='material-symbols-outlined text-[#005ab7]'>contact_page</span>
              </div>
              <h3 className='text-lg font-bold tracking-tight'>Thông tin liên lạc</h3>
            </div>
            <div className='flex flex-col md:flex-row gap-12'>
              <div className='flex items-start gap-4 flex-1'>
                <div className='h-12 w-12 rounded-full bg-[#d4e3ff] flex items-center justify-center shrink-0'>
                  <span className='material-symbols-outlined text-[#2f486a]'>mail</span>
                </div>
                <div>
                  <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Địa chỉ Email</p>
                  <p className='text-[#191c1e] font-semibold text-lg'>{dataProfile.email}</p>
                  <p className='text-xs text-green-600 font-medium mt-1 flex items-center gap-1'>
                    <span className='material-symbols-outlined text-xs'>check_circle</span>
                    Đã xác minh
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-4 flex-1'>
                <div className='h-12 w-12 rounded-full bg-[#d4e3ff] flex items-center justify-center shrink-0'>
                  <span className='material-symbols-outlined text-[#2f486a]'>call</span>
                </div>
                <div>
                  <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Số điện thoại</p>
                  <p className='text-[#191c1e] font-semibold text-lg'>{dataProfile.phone || 'Chưa cập nhật'}</p>
                  <p className='text-xs text-[#717786] font-medium mt-1'>Liên hệ chính</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insight Card */}
          <div className='md:col-span-3 bg-white/60 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-lg shadow-blue-900/5 relative group overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-[#005ab7]/5 to-transparent pointer-events-none' />
            <div className='flex items-center gap-3 mb-6'>
              <span className='material-symbols-outlined text-[#005ab7]'>auto_awesome</span>
              <h3 className='text-sm font-bold tracking-widest uppercase text-[#2f486a]'>Azure Intelligence Insight</h3>
            </div>
            <div className='flex flex-col md:flex-row items-center gap-6'>
              <p className='text-[#414754] font-medium flex-1'>
                Hồ sơ của bạn đã hoàn thành <span className='text-[#005ab7] font-bold'>95%</span>. Cập nhật thêm thông
                tin căn hộ để nhận được các ưu đãi dành riêng cho cư dân Diamond.
              </p>
              <button className='px-6 py-2.5 bg-[#d4e3ff] text-[#2f486a] rounded-full text-sm font-bold hover:brightness-105 transition-all'>
                Xem ưu đãi
              </button>
            </div>
          </div>
        </div>
      </div>

      {isChangePasswordModalOpen && (
        <div className='fixed inset-0 z-[70] flex items-center justify-center p-6'>
          <div
            className='absolute inset-0 bg-black/20 backdrop-blur-sm'
            onClick={() => setIsChangePasswordModalOpen(false)}
          ></div>

          <div
            className='relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='px-6 pt-6 pb-4 border-b border-gray-100'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='material-symbols-outlined text-[#005ab7]'>lock</span>
                    <p className='uppercase tracking-[0.2em] text-[#005ab7] text-[10px] font-extrabold'>Bảo mật</p>
                  </div>
                  <h2 className='text-2xl font-extrabold text-[#191c1e] tracking-tight'>Đổi mật khẩu</h2>
                </div>
                <button
                  type='button'
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className='w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors'
                >
                  <span className='material-symbols-outlined text-[#717786] text-xl'>close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
              <div className='px-6 py-6'>
                <div className='space-y-5'>
                  <div>
                    <label className='block text-xs font-bold text-[#717786] tracking-widest uppercase mb-2'>
                      Mật khẩu hiện tại
                    </label>
                    <Input
                      register={registerPassword}
                      name='currentPassword'
                      errorMassage={passwordErrors.currentPassword?.message}
                      type='password'
                      placeholder='Nhập mật khẩu hiện tại'
                      classNameInput='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#005ab7] focus:bg-white transition-all'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-[#717786] tracking-widest uppercase mb-2'>
                      Mật khẩu mới
                    </label>
                    <Input
                      register={registerPassword}
                      name='newPassword'
                      errorMassage={passwordErrors.newPassword?.message}
                      type='password'
                      placeholder='Nhập mật khẩu mới'
                      classNameInput='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#005ab7] focus:bg-white transition-all'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-[#717786] tracking-widest uppercase mb-2'>
                      Xác nhận mật khẩu mới
                    </label>
                    <Input
                      register={registerPassword}
                      name='confirmPassword'
                      errorMassage={passwordErrors.confirmPassword?.message}
                      type='password'
                      placeholder='Nhập lại mật khẩu mới'
                      classNameInput='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#005ab7] focus:bg-white transition-all'
                    />
                  </div>

                  <div className='bg-blue-50/50 rounded-xl p-3'>
                    <p className='text-[10px] font-bold text-[#2f486a] uppercase tracking-wider mb-2'>
                      Yêu cầu mật khẩu
                    </p>
                    <div className='space-y-1 text-[11px] text-[#414754]'>
                      <p className='flex items-center gap-1'>• Ít nhất 8 ký tự</p>
                      <p className='flex items-center gap-1'>• Có ít nhất 1 chữ hoa</p>
                      <p className='flex items-center gap-1'>• Có ít nhất 1 số</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='px-6 py-5 bg-gray-50/50 flex items-center justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className='px-5 py-2.5 text-[#414754] font-bold text-[11px] tracking-widest uppercase hover:text-[#191c1e] transition-colors rounded-full'
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  disabled={changePasswordMutation.isPending}
                  className='bg-gradient-to-br from-[#005ab7] to-[#0072e5] text-white px-6 py-2.5 rounded-full font-bold text-[11px] tracking-widest uppercase shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50'
                >
                  {changePasswordMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa hồ sơ */}
      {isModalOpen && (
        <div
          className='fixed inset-0 z-[60] flex items-center justify-center p-6'
          onClick={() => setIsModalOpen(false)}
        >
          {/* Backdrop */}
          <div className='absolute inset-0 bg-slate-900/40' onClick={() => setIsModalOpen(false)}></div>

          {/* Modal Content */}
          <div
            className='relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl shadow-blue-900/20 overflow-hidden border border-outline-variant/20'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className='px-10 pt-10 pb-6'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='label-md uppercase tracking-[0.2em] text-[#005ab7] text-[10px] font-extrabold mb-2'>
                    Profile Integrity
                  </p>
                  <h2 className='text-3xl font-extrabold text-[#191c1e] tracking-tight'>Update Information</h2>
                </div>
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  className='w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#eceef0] transition-colors'
                >
                  <span className='material-symbols-outlined text-[#717786]'>close</span>
                </button>
              </div>
              <div className='h-[1px] w-full bg-gradient-to-r from-[#005ab7]/20 via-[#005ab7]/5 to-transparent mt-6'></div>
            </div>

            {/* Modal Form */}
            <div className='px-10 py-4 max-h-[716px] overflow-y-auto no-scrollbar'>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                {/* Name & Email Row */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div className='group'>
                    <label className='block label-md uppercase tracking-widest text-[10px] text-[#717786] font-bold mb-3 px-1'>
                      Full Name
                    </label>
                    <Input
                      register={register}
                      name='fullName'
                      errorMassage={errors.fullName?.message}
                      classNameInput='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-1 focus:ring-[#005ab7] focus:bg-white transition-all'
                      placeholder='Enter full name'
                      type='text'
                    />
                  </div>

                  <div className='group'>
                    <label className='block label-md uppercase tracking-widest text-[10px] text-[#717786] font-bold mb-3 px-1'>
                      Email Address
                    </label>
                    <Input
                      register={register}
                      name='email'
                      errorMassage={errors.email?.message}
                      classNameInput='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-1 focus:ring-[#005ab7] focus:bg-white transition-all'
                      placeholder='email@example.com'
                      type='email'
                    />
                  </div>
                </div>

                {/* Phone & DOB Row */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div className='group'>
                    <label className='block label-md uppercase tracking-widest text-[10px] text-[#717786] font-bold mb-3 px-1'>
                      Phone Number
                    </label>
                    <Input
                      register={register}
                      name='phone'
                      errorMassage={errors.phone?.message}
                      classNameInput='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-1 focus:ring-[#005ab7] focus:bg-white transition-all'
                      placeholder='+84 000 000 000'
                      type='tel'
                    />
                  </div>

                  <div className='group'>
                    <label className='block label-md uppercase tracking-widest text-[10px] text-[#717786] font-bold mb-3 px-1'>
                      Date of Birth
                    </label>
                    <Input
                      register={register}
                      name='dateOfBirth'
                      errorMassage={errors.dateOfBirth?.message}
                      classNameInput='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-1 focus:ring-[#005ab7] focus:bg-white transition-all'
                      type='date'
                    />
                  </div>
                </div>

                <div className='group'>
                  <label className='block label-md uppercase tracking-widest text-[10px] text-[#717786] font-bold mb-4 px-1'>
                    Biological Identity
                  </label>
                  <div className='grid grid-cols-3 gap-4'>
                    {(['MALE', 'FEMALE', 'OTHER'] as const).map((gender) => (
                      <label
                        key={gender}
                        className={`relative flex items-center justify-center p-4 rounded-xl cursor-pointer border transition-all ${
                          currentGender === gender // 👈 Đổi từ dataProfile?.gender thành currentGender
                            ? 'border-[#005ab7]/20 bg-[#005ab7]/5 text-[#005ab7]'
                            : 'border-[#c1c6d7]/10 bg-[#f2f4f6] hover:bg-[#eceef0] text-[#414754]'
                        }`}
                      >
                        <input type='radio' value={gender} {...register('gender')} className='hidden' />
                        <div className='flex flex-col items-center gap-1'>
                          <span className='material-symbols-outlined'>
                            {gender === 'MALE' && 'male'}
                            {gender === 'FEMALE' && 'female'}
                            {gender === 'OTHER' && 'transgender'}
                          </span>
                          <span className='text-[10px] font-bold tracking-widest uppercase'>{gender}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.gender && <p className='text-red-500 text-sm mt-1'>{errors.gender.message}</p>}
                </div>

                {/* Avatar URL (hidden field) */}
                <Input register={register} name='avatarUrl' type='hidden' />

                {/* Submit Button */}
                <div className='flex justify-end gap-4 pt-4'>
                  <button
                    type='submit'
                    disabled={updateProfileMutation.isPending}
                    className='px-6 py-2.5 bg-[#005ab7] text-white rounded-xl font-semibold hover:bg-[#004a9a] disabled:opacity-50 transition-all'
                  >
                    {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
