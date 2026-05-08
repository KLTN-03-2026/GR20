import { NavLink } from 'react-router-dom'

export default function SidebarProtect() {
  // Hàm xử lý className active giống SidebarUser
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
      : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'

  return (
    <aside className='hidden lg:flex flex-col p-6 space-y-8 h-screen w-64 fixed left-0 top-0 bg-surface-container-low shadow-sm z-50'>
      {/* Logo / Header - giống SidebarUser */}
      <div className='flex flex-col space-y-2'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white'>
            <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
              security
            </span>
          </div>
          <div>
            <h1 className='text-xl font-extrabold text-blue-900 tracking-tight'>HomeLink AI</h1>
            <p className='text-[10px] font-medium text-teal-700 uppercase tracking-widest'>Security Gateway</p>
          </div>
        </div>

        {/* Menu chính */}
        <nav className='flex-1 space-y-1'>
          <NavLink to='/homepageprotect' className={getNavClass}>
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

          <NavLink to='/security/residents' className={getNavClass}>
            <span className='material-symbols-outlined'>person_search</span>
            <span className='text-sm font-manrope'>Tra cứu cư dân</span>
          </NavLink>
        </nav>
      </div>

      {/* Menu cuối */}
      <div className='mt-auto space-y-1 pt-[250px] border-t border-gray-200'>
        {/* Nút báo động khẩn cấp */}

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
