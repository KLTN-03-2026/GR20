import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { residentApi } from 'src/apis/resident_api/residents.api'
import { toast } from 'react-toastify'

export default function Addresident() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: ''
  })

  const createMutation = useMutation({
    mutationFn: () =>
      residentApi.createResidentAccount({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        ...(formData.email.trim() ? { email: formData.email.trim() } : {})
      }),
    onSuccess: () => {
      toast.success('Tạo tài khoản cư dân thành công')
      navigate('/Getresidentlist')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo tài khoản thất bại')
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập họ tên')
      return
    }
    if (!formData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }
    if (!/^(0|\+84)[1-9][0-9]{8}$/.test(formData.phone.trim())) {
      toast.error('Số điện thoại không hợp lệ (VD: 0901234567)')
      return
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error('Mật khẩu tối thiểu 6 ký tự')
      return
    }
    createMutation.mutate()
  }

  const handleCancel = () => {
    navigate('/Getresidentlist')
  }

  return (
    <div className='bg-surface text-on-surface antialiased'>
      <main className='min-h-screen'>
        <div className='max-w-5xl mx-auto px-10 py-12'>
          <header className='mb-10'>
            <div className='flex items-center gap-4 mb-4'>
              <button
                type='button'
                onClick={handleCancel}
                className='p-2 hover:bg-gray-100 rounded-full transition-colors'
              >
                <span className='material-symbols-outlined text-gray-600'>arrow_back</span>
              </button>
              <div>
                <h1 className='text-4xl font-extrabold tracking-tight mb-2'>Thêm cư dân</h1>
                <p className='text-on-surface-variant max-w-2xl'>
                  Tạo tài khoản đăng nhập (vai trò mặc định: người dùng). Gắn vào căn hộ có thể thực hiện sau từ danh
                  sách cư dân hoặc màn chi tiết căn hộ.
                </p>
              </div>
            </div>
          </header>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-10'>
            <div className='lg:col-span-2'>
              <div className='bg-white rounded-3xl p-10 shadow-sm'>
                <form onSubmit={handleSubmit} className='space-y-8'>
                  <div>
                    <label className='block text-sm font-semibold mb-2 text-gray-700'>
                      Họ và tên <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='fullName'
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder='Nguyễn Văn A'
                      className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      autoComplete='name'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold mb-2 text-gray-700'>
                      Số điện thoại <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='tel'
                      name='phone'
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder='0901234567'
                      className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      autoComplete='tel'
                    />
                    <p className='text-xs text-gray-400 mt-1'>Dùng làm tên đăng nhập (username)</p>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold mb-2 text-gray-700'>Email</label>
                    <input
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      placeholder='không bắt buộc'
                      className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      autoComplete='email'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold mb-2 text-gray-700'>
                      Mật khẩu <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='password'
                      name='password'
                      value={formData.password}
                      onChange={handleChange}
                      placeholder='Tối thiểu 6 ký tự'
                      className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      autoComplete='new-password'
                    />
                  </div>

                  <div className='flex gap-4 pt-4'>
                    <button
                      type='button'
                      onClick={handleCancel}
                      className='flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors'
                    >
                      Hủy
                    </button>
                    <button
                      type='submit'
                      disabled={createMutation.isPending}
                      className='flex-1 py-3 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {createMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <aside className='space-y-6'>
              <div className='bg-white rounded-3xl p-6 shadow-sm'>
                <h3 className='font-bold text-gray-800 mb-3'>Lưu ý</h3>
                <ul className='space-y-2 text-sm text-gray-600'>
                  <li>• Tài khoản dùng vai trò người dùng mặc định.</li>
                  <li>• Sau khi tạo, dùng nút thêm vào căn hộ trên danh sách để gắn căn.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
