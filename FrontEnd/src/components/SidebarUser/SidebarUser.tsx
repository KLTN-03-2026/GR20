import { Link, NavLink } from 'react-router-dom'

export default function SidebarUser() {
  return (
    <aside className='hidden lg:flex flex-col p-6 space-y-8 h-screen w-64 fixed left-0 top-0 bg-surface-container-low shadow-sm z-50'>
      {/* Logo / Header */}
      <div className='flex flex-col space-y-2'>
        <Link to={'/'} className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white'>
            <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
              home_app_logo
            </span>
          </div>
          <div>
            <h1 className='text-xl font-extrabold text-blue-900 tracking-tight'>HomeLink AI</h1>
            <p className='text-[10px] font-medium text-teal-700 uppercase tracking-widest'>Nơi an cư thông minh</p>
          </div>
        </Link>

        {/* Menu chính */}
        <nav className='flex-1 space-y-1'>
          <NavLink
            // className='flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
            className={({ isActive }) =>
              isActive
                ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
                : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'
            }
            to='/'
          >
            <span className='material-symbols-outlined'>dashboard</span>
            <span className='text-sm font-manrope'>Tổng quan</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive
                ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
                : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'
            }
            to='/profile'
          >
            <span className='material-symbols-outlined'>account_circle</span>
            <span className='text-sm'>Quản lý tài khoản</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive
                ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
                : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'
            }
            to='/notifications'
          >
            <span className='material-symbols-outlined'>notifications</span>
            <span className='text-sm font-manrope'>Thông báo</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive
                ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
                : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'
            }
            to='/maintenance'
          >
            <span className='material-symbols-outlined'>build</span>
            <span className='text-sm font-manrope'>Bảo trì</span>
          </NavLink>

          {/* <Link
            className='flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'
            to='/maintenance/history'
          >
            <span className='material-symbols-outlined'>history</span>
            <span className='text-sm font-manrope'>Lịch sử bảo trì</span>
          </Link> */}

          <NavLink
            className={({ isActive }) =>
              isActive
                ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
                : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'
            }
            to='/chat'
          >
            <span className='material-symbols-outlined'>chat_bubble</span>
            <span className='text-sm font-manrope'>Chat cộng đồng</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive
                ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
                : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'
            }
            to='/payments'
          >
            <span className='material-symbols-outlined'>payments</span>
            <span className='text-sm font-manrope'>Hóa đơn</span>
          </NavLink>

          <NavLink
            // className='flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'
            className={({ isActive }) =>
              isActive
                ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
                : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'
            }
            to='/qrcode'
          >
            <span className='material-symbols-outlined'>qr_code_2</span>
            <span className='text-sm font-manrope'>Quản lý QR cá nhân</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive
                ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
                : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'
            }
            to='/utilities'
          >
            <span className='material-symbols-outlined'>apartment</span>
            <span className='text-sm font-manrope'>Tiện ích tòa nhà</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive
                ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
                : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'
            }
            to='/my-apartment'
          >
            <span className='material-symbols-outlined'>home</span>
            <span className='text-sm font-manrope'>Căn hộ của tôi</span>
          </NavLink>
        </nav>
      </div>

      {/* Menu cuối trang (cá nhân) */}
      <div className='mt-auto space-y-1 pt-6 border-t border-gray-200'>
        <NavLink
          className={({ isActive }) =>
            isActive
              ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
              : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'
          }
          to='/settings'
        >
          <span className='material-symbols-outlined'>settings</span>
          <span className='text-sm'>Cài đặt</span>
        </NavLink>

        <button
          onClick={() => {
            /* xử lý đăng xuất */
          }}
          className='w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors'
        >
          <span className='material-symbols-outlined'>logout</span>
          <span className='text-sm'>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
