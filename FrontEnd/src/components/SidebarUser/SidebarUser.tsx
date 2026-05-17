import { Link, NavLink } from 'react-router-dom'

export default function SidebarResident() {
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
      : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'

  return (
    <aside className='hidden lg:flex flex-col p-6 space-y-8 h-screen w-64 fixed left-0 top-0 bg-surface-container-low shadow-sm z-50'>
      {/* Logo / Header */}
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
              My Home
            </p>
          </div>
        </Link>
        {/* Menu chính */}
        <nav className='flex-1 space-y-1'>
          <NavLink to='/homeresident' className={getNavClass}>
            <span className='material-symbols-outlined'>dashboard</span>
            <span className='text-sm font-manrope'>Tổng quan</span>
          </NavLink>
          <NavLink to='/notifications' className={getNavClass}>
            <span className='material-symbols-outlined'>notifications</span>
            <span className='text-sm font-manrope'>thông báo</span>
          </NavLink>

          <NavLink to='/MyApartment' className={getNavClass}>
            <span className='material-symbols-outlined'>apartment</span>
            <span className='text-sm font-manrope'>Thông tin căn hộ</span>
          </NavLink>

          <NavLink to='/MyContract' className={getNavClass}>
            <span className='material-symbols-outlined'>contract</span>
            <span className='text-sm font-manrope'>Thông tin hợp đồng</span>
          </NavLink>

          {/* <NavLink to='/resident/maintenance-request' className={getNavClass}> */}
          <NavLink to='/resident/GetMaintenanceRequestList' className={getNavClass}>
            <span className='material-symbols-outlined'>build</span>
            <span className='text-sm font-manrope'>Gửi yêu cầu bảo trì</span>
          </NavLink>

          {/* <NavLink to='/resident/request-history' className={getNavClass}>
            <span className='material-symbols-outlined'>history</span>
            <span className='text-sm font-manrope'>Lịch sử yêu cầu</span>
          </NavLink> */}

          <NavLink to='/invoices' className={getNavClass}>
            <span className='material-symbols-outlined'>receipt_long</span>
            <span className='text-sm font-manrope'>Hóa đơn</span>
          </NavLink>

          <NavLink to='/payments' className={getNavClass}>
            <span className='material-symbols-outlined'>payments</span>
            <span className='text-sm font-manrope'>Thanh toán</span>
          </NavLink>

          <NavLink to='/resident/qrcode' className={getNavClass}>
            <span className='material-symbols-outlined'>qr_code</span>
            <span className='text-sm font-manrope'>Quản lý QR</span>
          </NavLink>

          <NavLink to='/resident/guest-qr' className={getNavClass}>
            <span className='material-symbols-outlined'>qr_code_scanner</span>
            <span className='text-sm font-manrope'>Tạo QR cho khách</span>
          </NavLink>

          
          <NavLink to='/resident/amenities' className={getNavClass}>
            <span className='material-symbols-outlined'>spa</span>
            <span className='text-sm font-manrope'>Tiện ích tòa nhà</span>
          </NavLink>

          <NavLink to='/resident/community-chat' className={getNavClass}>
            <span className='material-symbols-outlined'>forum</span>
            <span className='text-sm font-manrope'>Chat cộng đồng</span>
          </NavLink>
        </nav>
      </div>

      {/* Menu cuối */}
      <div className='mt-auto space-y-1 pt-[50px] border-t border-gray-200'>
        <NavLink
          to='/resident/notifications'
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:text-blue-900 transition-colors hover:bg-secondary-container/20 ${
              isActive ? 'text-blue-900 bg-secondary-container/20' : ''
            }`
          }
        >
          <span className='material-symbols-outlined'>notifications</span>
          <span className='text-sm'>Thông báo</span>
        </NavLink>

        <NavLink
          to='/resident/profile'
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
          to='/resident/settings'
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
