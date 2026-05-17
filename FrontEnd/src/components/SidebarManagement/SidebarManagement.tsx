import { useState } from 'react'
import { NavLink } from 'react-router-dom'

interface MenuItem {
  path: string
  label: string
  icon: string
}

const mainMenuItems: MenuItem[] = [
  { path: '/homemanagement', label: 'Tổng quan', icon: 'dashboard' },
  { path: '/management/residents', label: 'Quản lý cư dân', icon: 'people' },
  { path: '/management/apartments', label: 'Quản lý căn hộ', icon: 'apartment' },
  { path: '/management/staff', label: 'Quản lý nhân viên', icon: 'badge' },
  { path: '/management/services', label: 'Quản lý dịch vụ', icon: 'concierge' },
  { path: '/management/requests', label: 'Quản lý yêu cầu', icon: 'assignment' },
  { path: '/management/invoices', label: 'Quản lý hóa đơn', icon: 'receipt_long' },
  { path: '/management/notifications', label: 'Gửi thông báo', icon: 'campaign' },
  { path: '/management/qr-management', label: 'Quản lý QR', icon: 'qr_code_2' },
  { path: '/management/reports', label: 'Báo cáo & Thống kê', icon: 'analytics' },
  { path: '/management/community-chat', label: 'Chat cộng đồng', icon: 'forum' }
]

const bottomMenuItems: MenuItem[] = [
  { path: '/management/profile', label: 'Thông tin cá nhân', icon: 'account_circle' },
  { path: '/management/settings', label: 'Cài đặt', icon: 'settings' }
]

export default function SidebarManagementOptimized() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const getNavClass = ({ isActive }: { isActive: boolean }) => {
    const baseClass = 'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 relative group'
    const activeClass = isActive
      ? 'text-blue-900 font-bold border-l-4 border-blue-900 bg-surface'
      : 'text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20'
    return `${baseClass} ${activeClass}`
  }

  const renderNavItem = (item: MenuItem) => (
    <NavLink key={item.path} to={item.path} className={getNavClass} title={isCollapsed ? item.label : ''}>
      <span className='material-symbols-outlined text-xl flex-shrink-0'>{item.icon}</span>
      {!isCollapsed && <span className='text-sm font-manrope truncate'>{item.label}</span>}

      {/* Tooltip untuk collapsed state */}
      {isCollapsed && (
        <div className='absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50'>
          {item.label}
        </div>
      )}
    </NavLink>
  )

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen fixed left-0 top-0 bg-surface-container-low shadow-sm z-50 overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header dengan logo */}
      <div className='p-4 flex items-center justify-between'>
        {!isCollapsed && (
          <div className='flex items-center space-x-3 flex-1'>
            <div className='w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white flex-shrink-0'>
              <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
                admin_panel_settings
              </span>
            </div>
            <div className='min-w-0'>
              <h1 className='text-lg font-extrabold text-blue-900 tracking-tight truncate'>HomeLink AI</h1>
              <p className='text-[9px] font-medium text-teal-700 uppercase tracking-widest truncate'>Management HQ</p>
            </div>
          </div>
        )}

        {/* Toggle collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='p-2 hover:bg-secondary-container/20 rounded-lg text-slate-500 hover:text-blue-900 transition-colors flex-shrink-0 ml-auto'
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className='material-symbols-outlined text-xl'>
            {isCollapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className='flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin'>
        {mainMenuItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Bottom menu */}
      <div className='border-t border-gray-200 pt-3 pb-4 px-3 space-y-1'>
        {bottomMenuItems.map((item) => renderNavItem(item))}

        <button
          onClick={() => {
            /* xử lý đăng xuất */
          }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors relative group ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Đăng xuất' : ''}
        >
          <span className='material-symbols-outlined text-xl flex-shrink-0'>logout</span>
          {!isCollapsed && <span className='text-sm truncate'>Đăng xuất</span>}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className='absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50'>
              Đăng xuất
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
