import { useNavigate } from 'react-router-dom'

type Props = {
  /** Để header thanh chỉnh theo chiều rộng sidebar (thu gọn / mở rộng) */
  sidebarCollapsed?: boolean
}

export default function HeaderProtect({ sidebarCollapsed = false }: Props) {
  const navigate = useNavigate()
  const leftOffsetClass = sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-40 bg-slate-50/70 backdrop-blur-xl shadow-sm ${leftOffsetClass}`}
    >
      <div className='mx-auto flex w-full max-w-screen-2xl items-center justify-end px-6 py-4'>
        <div className='flex items-center space-x-4'>
          <div className='group relative'>
            <span className='absolute inset-y-0 left-3 flex items-center text-slate-400'>
              <span className='material-symbols-outlined text-sm'>search</span>
            </span>
            <input
              className='w-64 rounded-full border-none bg-surface-container-highest py-2 pl-10 pr-4 text-sm transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary'
              placeholder='Tìm kiếm nhanh...'
              type='text'
            />
          </div>
          <button
            type='button'
            onClick={() => navigate('/admin/notifications')}
            className='p-2 text-slate-500 transition-colors hover:text-blue-500'
            title='Thông báo admin'
          >
            <span className='material-symbols-outlined'>notifications</span>
          </button>
          <button
            type='button'
            className='p-2 text-slate-500 transition-colors hover:text-blue-500'
            onClick={() => navigate('/admin/profile')}
            title='Thông tin cá nhân'
          >
            <span className='material-symbols-outlined'>account_circle</span>
          </button>
        </div>
      </div>
    </header>
  )
}
