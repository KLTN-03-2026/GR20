import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { UserApi } from 'src/apis/User/user.api'

export default function UserDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-detail', id],
    queryFn: () => UserApi.getById(id || ''),
    enabled: Boolean(id)
  })

  const user = data?.data?.data
  const avatarSrc = user?.avatarUrl
    ? `http://localhost:8000${user.avatarUrl}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'User')}&background=005ab7&color=fff`

  return (
    <div className='min-h-screen bg-[#F8F9FA] font-sans'>
      <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 h-16 flex items-center justify-between'>
        <div className='flex items-center gap-6'>
          <button
            onClick={() => navigate('/admin/users')}
            className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all'
          >
            <span className='material-symbols-outlined'>arrow_back</span>
          </button>
          <div className='flex items-center gap-2 text-xs text-slate-400'>
            <span>Admin</span>
            <span className='material-symbols-outlined text-[14px]'>chevron_right</span>
            <button onClick={() => navigate('/admin/users')} className='hover:text-blue-500 transition-colors'>
              Quản lý người dùng
            </button>
            <span className='material-symbols-outlined text-[14px]'>chevron_right</span>
            <span className='text-slate-600 font-medium'>{user?.username || 'Chi tiết'}</span>
          </div>
        </div>
      </header>

      <main className='px-8 py-8 pb-20'>
        <div className='max-w-5xl mx-auto'>
          {isLoading && <div className='rounded-xl bg-white p-6 text-gray-500 shadow-sm'>Đang tải dữ liệu...</div>}
          {isError && <div className='rounded-xl bg-red-50 p-6 text-red-600 shadow-sm'>Không tải được chi tiết người dùng.</div>}

          {user && (
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              <div className='lg:col-span-2 space-y-6'>
                <div className='relative rounded-2xl overflow-hidden aspect-video bg-slate-200 border border-slate-100 shadow-sm'>
                  <img
                    alt={user.fullName || user.username}
                    className='w-full h-full object-cover'
                    src={avatarSrc}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username || 'User')}&background=005ab7&color=fff`
                    }}
                  />
                  <div className='absolute top-4 right-4'>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.isActive ? 'Đang hoạt động' : 'Đã xóa'}
                    </span>
                  </div>
                </div>

                <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
                  <h3 className='text-base font-semibold text-slate-800 mb-4'>Thông tin cá nhân</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                    <div><span className='text-slate-500'>ID:</span> <span className='font-semibold text-slate-800'>#{user.id}</span></div>
                    <div><span className='text-slate-500'>Username:</span> <span className='font-semibold text-slate-800'>{user.username}</span></div>
                    <div><span className='text-slate-500'>Họ tên:</span> <span className='text-slate-800'>{user.fullName || '-'}</span></div>
                    <div><span className='text-slate-500'>Vai trò:</span> <span className='text-slate-800'>{user.roleName || '-'}</span></div>
                    <div><span className='text-slate-500'>Giới tính:</span> <span className='text-slate-800'>{user.gender || '-'}</span></div>
                    <div><span className='text-slate-500'>Ngày sinh:</span> <span className='text-slate-800'>{user.dateOfBirth || '-'}</span></div>
                    <div className='md:col-span-2'><span className='text-slate-500'>CCCD:</span> <span className='text-slate-800'>{user.idCard || '-'}</span></div>
                  </div>
                </div>
              </div>

              <div className='space-y-6'>
                <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
                  <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4'>Liên hệ</h3>
                  <div className='space-y-3 text-sm'>
                    <div className='flex items-center gap-2 text-slate-700'>
                      <span className='material-symbols-outlined text-base text-slate-400'>mail</span>
                      {user.email || '-'}
                    </div>
                    <div className='flex items-center gap-2 text-slate-700'>
                      <span className='material-symbols-outlined text-base text-slate-400'>call</span>
                      {user.phone || '-'}
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-2xl p-6 border border-slate-100 shadow-sm'>
                  <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4'>Hệ thống</h3>
                  <div className='space-y-3 text-sm'>
                    <div className='flex justify-between'><span className='text-slate-500'>Ngày tạo</span><span className='text-slate-800'>{new Date(user.createdAt).toLocaleString('vi-VN')}</span></div>
                    <div className='flex justify-between'><span className='text-slate-500'>Cập nhật</span><span className='text-slate-800'>{new Date(user.updatedAt).toLocaleString('vi-VN')}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
