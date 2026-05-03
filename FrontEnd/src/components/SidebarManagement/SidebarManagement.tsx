import { NavLink } from 'react-router-dom'

export default function SidebarManagement() {
  const getNavClass = ({ isActive }) =>
    isActive
      ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
      : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'

  return (
    <aside className='hidden lg:flex flex-col p-6 space-y-8 h-screen w-64 fixed left-0 top-0 bg-surface-container-low shadow-sm z-50 overflow-y-auto'>
      {/* Logo / Header */}
      <div className='flex flex-col space-y-2'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white'>
            <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
          </div>
          <div>
            <h1 className='text-xl font-extrabold text-blue-900 tracking-tight'>HomeLink AI</h1>
            <p className='text-[10px] font-medium text-teal-700 uppercase tracking-widest'>Management HQ</p>
          </div>
        </div>

        {/* Menu chính */}
        <nav className='flex-1 space-y-1'>
          {/* Quản lý tổng quan */}
          <NavLink to='/homemanagement' className={getNavClass}>
            <span className='material-symbols-outlined'>dashboard</span>
            <span className='text-sm font-manrope'>Tổng quan</span>
          </NavLink>

          {/* Quản lý cư dân */}
          <NavLink to='/management/residents' className={getNavClass}>
            <span className='material-symbols-outlined'>people</span>
            <span className='text-sm font-manrope'>Quản lý cư dân</span>
          </NavLink>

          {/* Quản lý căn hộ */}
          <NavLink to='/management/apartments' className={getNavClass}>
            <span className='material-symbols-outlined'>apartment</span>
            <span className='text-sm font-manrope'>Quản lý căn hộ</span>
          </NavLink>

          {/* Quản lý nhân viên */}
          <NavLink to='/management/staff' className={getNavClass}>
            <span className='material-symbols-outlined'>badge</span>
            <span className='text-sm font-manrope'>Quản lý nhân viên</span>
          </NavLink>

          {/* Quản lý dịch vụ */}
          <NavLink to='/management/services' className={getNavClass}>
            <span className='material-symbols-outlined'>concierge</span>
            <span className='text-sm font-manrope'>Quản lý dịch vụ</span>
          </NavLink>

          {/* Quản lý yêu cầu */}
          <NavLink to='/management/requests' className={getNavClass}>
            <span className='material-symbols-outlined'>assignment</span>
            <span className='text-sm font-manrope'>Quản lý yêu cầu</span>
          </NavLink>

          {/* Quản lý hóa đơn */}
          <NavLink to='/management/invoices' className={getNavClass}>
            <span className='material-symbols-outlined'>receipt_long</span>
            <span className='text-sm font-manrope'>Quản lý hóa đơn</span>
          </NavLink>

          {/* Quản lý thông báo */}
          <NavLink to='/management/notifications' className={getNavClass}>
            <span className='material-symbols-outlined'>campaign</span>
            <span className='text-sm font-manrope'>Gửi thông báo</span>
          </NavLink>

          {/* Quản lý QR */}
          <NavLink to='/management/qr-management' className={getNavClass}>
            <span className='material-symbols-outlined'>qr_code_2</span>
            <span className='text-sm font-manrope'>Quản lý QR</span>
          </NavLink>

          {/* Báo cáo & Thống kê */}
          <NavLink to='/management/reports' className={getNavClass}>
            <span className='material-symbols-outlined'>analytics</span>
            <span className='text-sm font-manrope'>Báo cáo & Thống kê</span>
          </NavLink>

          {/* Chat cộng đồng */}
          <NavLink to='/management/community-chat' className={getNavClass}>
            <span className='material-symbols-outlined'>forum</span>
            <span className='text-sm font-manrope'>Chat cộng đồng</span>
          </NavLink>
        </nav>
      </div>

      {/* Menu cuối */}
      <div className='mt-auto space-y-1 pt-[30px] border-t border-gray-200'>
        <NavLink
          to='/management/profile'
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:text-blue-900 transition-colors hover:bg-secondary-container/20 ${
              isActive ? 'text-blue-900 bg-secondary-container/20' : ''
            }`
          }
        >
          <span className='material-symbols-outlined'>account_circle</span>
          <span className='text-sm'>Thông tin cá nhân</span>
        </NavLink>

        <NavLink
          to='/management/settings'
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
