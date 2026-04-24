import { NavLink } from 'react-router-dom'

export default function SidebarAdmin() {
  // Hàm xử lý className active
  const getNavClass = ({ isActive }) =>
    isActive
      ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
      : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'

  return (
    <aside className='hidden lg:flex flex-col p-6 space-y-8 h-screen w-64 fixed left-0 top-0 bg-surface-container-low shadow-sm z-50'>
      {/* Logo / Header */}
      <div className='flex flex-col space-y-2'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white'>
            <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
              apartment
            </span>
          </div>
          <div>
            <h1 className='text-xl font-extrabold text-blue-900 tracking-tight'>HomeLink AI</h1>
            <p className='text-[10px] font-medium text-teal-700 uppercase tracking-widest'>Management Portal</p>
          </div>
        </div>

        {/* Menu chính */}
        <nav className='flex-1 space-y-1 overflow-y-auto max-h-[calc(100vh-300px)]'>
          {/* Dashboard */}
          <NavLink to='/' className={getNavClass} end>
            <span className='material-symbols-outlined'>dashboard</span>
            <span className='text-sm font-manrope'>Tổng quan</span>
          </NavLink>

          {/* Quản lý cư dân */}
          <NavLink to='/residents' className={getNavClass}>
            <span className='material-symbols-outlined'>people</span>
            <span className='text-sm font-manrope'>Quản lý cư dân</span>
          </NavLink>

          {/* Quản lý căn hộ */}
          <NavLink to='/apartments' className={getNavClass}>
            <span className='material-symbols-outlined'>home_work</span>
            <span className='text-sm font-manrope'>Quản lý căn hộ</span>
          </NavLink>

          {/* Quản lý nhân viên */}
          <NavLink to='/staff' className={getNavClass}>
            <span className='material-symbols-outlined'>badge</span>
            <span className='text-sm font-manrope'>Quản lý nhân viên</span>
          </NavLink>

          {/* Quản lý dịch vụ */}
          <NavLink to='/services' className={getNavClass}>
            <span className='material-symbols-outlined'>handyman</span>
            <span className='text-sm font-manrope'>Quản lý dịch vụ</span>
          </NavLink>

          {/* Quản lý hóa đơn */}
          <NavLink to='/bills' className={getNavClass}>
            <span className='material-symbols-outlined'>receipt</span>
            <span className='text-sm font-manrope'>Quản lý hóa đơn</span>
          </NavLink>

          {/* Quản lý QR */}
          <NavLink to='/qrcodeAdmin' className={getNavClass}>
            <span className='material-symbols-outlined'>qr_code</span>
            <span className='text-sm font-manrope'>Quản lý QR</span>
          </NavLink>

          {/* Báo cáo & Thống kê */}
          <NavLink to='/reports' className={getNavClass}>
            <span className='material-symbols-outlined'>bar_chart</span>
            <span className='text-sm font-manrope'>Báo cáo & Thống kê</span>
          </NavLink>

          {/* Quản lý thông báo */}
          <NavLink to='/notifications' className={getNavClass}>
            <span className='material-symbols-outlined'>notifications_active</span>
            <span className='text-sm font-manrope'>Gửi thông báo</span>
          </NavLink>

          {/* Divider + Chức năng kế thừa */}
          <div className='pt-4 mt-2'>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-2'>Chức năng kế thừa</p>

            {/* Bảo vệ - Quét QR */}
            <NavLink to='/security/scan' className={getNavClass}>
              <span className='material-symbols-outlined'>qr_code_scanner</span>
              <span className='text-sm font-manrope'>Quét QR (BV)</span>
            </NavLink>

            {/* Bảo vệ - Lịch sử ra vào */}
            <NavLink to='/security/access-history' className={getNavClass}>
              <span className='material-symbols-outlined'>history</span>
              <span className='text-sm font-manrope'>Lịch sử ra vào (BV)</span>
            </NavLink>

            {/* Nhân viên - Yêu cầu từ cư dân */}
            <NavLink to='/staff/requests' className={getNavClass}>
              <span className='material-symbols-outlined'>assignment</span>
              <span className='text-sm font-manrope'>Yêu cầu cư dân (NV)</span>
            </NavLink>
          </div>
        </nav>
      </div>

      {/* Menu cuối - Cài đặt & Đăng xuất */}
      <div className='mt-auto space-y-1 pt-6 border-t border-gray-200'>
        <NavLink
          to='/settings'
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:text-blue-900 transition-colors hover:bg-secondary-container/20 ${
              isActive ? 'text-blue-900 bg-secondary-container/20' : ''
            }`
          }
        >
          <span className='material-symbols-outlined'>settings</span>
          <span className='text-sm'>Cài đặt</span>
        </NavLink>

        <NavLink
          to='/support'
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:text-blue-900 transition-colors hover:bg-secondary-container/20 ${
              isActive ? 'text-blue-900 bg-secondary-container/20' : ''
            }`
          }
        >
          <span className='material-symbols-outlined'>help</span>
          <span className='text-sm'>Hỗ trợ</span>
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
