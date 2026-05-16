import { Link, NavLink, useNavigate } from 'react-router-dom'

export default function SidebarProtect() {
  const navigate = useNavigate()
  // Hàm xử lý className active giống SidebarUser
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
      : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    navigate('/login', { replace: true })
  }
  return (
    <aside className='hidden lg:flex flex-col p-6 space-y-8 h-screen w-64 fixed left-0 top-0 bg-surface-container-low shadow-sm z-50'>
      {/* Logo / Header - giống SidebarUser */}
      <div className='flex flex-col space-y-2'>
        <Link
          to={'/security'}
          className='flex items-center space-x-3 mb-6 group transition-all duration-300 hover:scale-[1.02]'
        >
          <div
            className='w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white
    transition-all duration-300 group-hover:bg-blue-700 group-hover:shadow-lg'
          >
            <span
              className='material-symbols-outlined transition-transform duration-300 group-hover:rotate-6'
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              home
            </span>
          </div>

          <div>
            <h1 className='text-xl font-extrabold text-blue-900 tracking-tight transition-colors duration-300 group-hover:text-blue-700'>
              HomeLink AI
            </h1>

            <p className='text-[10px] font-medium text-teal-700 uppercase tracking-widest transition-colors duration-300 group-hover:text-teal-500'>
              Security Gateway
            </p>
          </div>
        </Link>

        {/* Menu chính */}
        <nav className='flex-1 space-y-1'>
          <NavLink to='/security' className={getNavClass}>
            <span className='material-symbols-outlined'>dashboard</span>
            <span className='text-sm font-manrope'>Tổng quan</span>
          </NavLink>

          <NavLink to='/scanqr' className={getNavClass}>
            <span className='material-symbols-outlined'>qr_code_scanner</span>
            <span className='text-sm font-manrope'>Quét QR</span>
          </NavLink>

          <NavLink to='/history/qrcode' className={getNavClass}>
            <span className='material-symbols-outlined'>history</span>
            <span className='text-sm font-manrope'>Lịch sử ra vào</span>
          </NavLink>

          <NavLink to='/residents' className={getNavClass}>
            <span className='material-symbols-outlined'>person_search</span>
            <span className='text-sm font-manrope'>Tra cứu cư dân</span>
          </NavLink>
          <NavLink to='/chat' className={getNavClass}>
            <span className='material-symbols-outlined'>Chat</span>
            <span className='text-sm font-manrope'>Chat cộng đồng</span>
          </NavLink>
        </nav>
      </div>

      {/* Menu cuối */}
      <div className='mt-auto space-y-1 pt-[250px] border-t border-gray-200'>
        {/* Nút báo động khẩn cấp */}
        <NavLink to='/profile' className={getNavClass}>
          <span className='material-symbols-outlined text-xl flex-shrink-0'>account_circle</span>

          {<span className='text-sm truncate flex-1'>Thông tin cá nhân</span>}
        </NavLink>

        <NavLink
          to='/support'
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:text-blue-900 transition-colors hover:bg-secondary-container/20 ${
              isActive ? 'text-blue-900 bg-secondary-container/20' : ''
            }`
          }
        >
          <span className='material-symbols-outlined'>settings</span>
          <span className='text-sm'>Cài đặt</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className='w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors'
        >
          <span className='material-symbols-outlined'>logout</span>
          <span className='text-sm'>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
