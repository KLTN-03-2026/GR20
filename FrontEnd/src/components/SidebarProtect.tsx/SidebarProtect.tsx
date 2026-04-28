import { NavLink } from 'react-router-dom'

type Props = {
  collapsed?: boolean
  onToggle?: () => void
}

export default function SidebarProtect({ collapsed = false, onToggle }: Props) {
  const navItems = [
    { to: '/admin', icon: 'dashboard', label: 'Dashboard' },
    { to: '/admin/roles', icon: 'admin_panel_settings', label: 'Role' },
    { to: '/admin/users', icon: 'group', label: 'User' },
    { to: '/admin/buildings', icon: 'apartment', label: 'Building' },
    { to: '/admin/floors', icon: 'stairs', label: 'Floor' },
    { to: '/admin/apartments', icon: 'meeting_room', label: 'Apartment' },
    { to: '/admin/maintenance-requests', icon: 'handyman', label: 'Bảo trì' },
    { to: '/admin/maintenance-assignments', icon: 'person_add', label: 'Phân công' },
    { to: '/admin/vehicles', icon: 'directions_car', label: 'Phương tiện' },
    { to: '/admin/visitors', icon: 'badge', label: 'Khách' },
    { to: '/admin/contracts', icon: 'description', label: 'Hợp đồng' },
    { to: '/admin/utility-pricing', icon: 'sell', label: 'Giá' },
    { to: '/admin/utility-meters', icon: 'speed', label: 'Đồng hồ' },
    { to: '/admin/meter-readings', icon: 'insights', label: 'Chỉ số' },
    { to: '/admin/invoices', icon: 'receipt_long', label: 'Hóa đơn' },
    { to: '/admin/payments', icon: 'payments', label: 'Thanh toán' },
    { to: '/admin/notifications', icon: 'notifications_active', label: 'Thông báo' }
  ]

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen fixed left-0 top-0 bg-white dark:bg-slate-950 shadow-2xl shadow-blue-900/5 z-50 p-4 space-y-4 transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className='flex items-center justify-between px-2 py-4'>
        {!collapsed && <span className='text-lg font-black text-blue-700 tracking-tighter'>Admin Panel</span>}
        <button
          type='button'
          onClick={onToggle}
          className='ml-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200'
          title={collapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
        >
          <span className='material-symbols-outlined'>{collapsed ? 'chevron_right' : 'chevron_left'}</span>
        </button>
      </div>

      {!collapsed && (
        <div className='flex items-center space-x-3 px-2 pb-6'>
          <div className='w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden'>
            <img
              alt='Admin avatar'
              className='w-full h-full object-cover'
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuBXVPiosIDYlFWm89IzH3ybG-UFvXln53igSYaQY5AomsqswsWB1wKnLWU6GcnSTkBzQicyFTD-NIMD409zfnfPfd7JGyylmicBfuR6f8zxE2QYO49Lawv-Lymui1jzTKw7El6sQMS6v72q1C4LU34LC2G5et4McIq4YQ5kCsFYdnCvCKldU4JQ-6zQWtogW0y1oTjolhPH7no5c1fS71sW_kPQfTvn0nn8EEi9BBgadUXZLs0HC0oJ9TI95w8kGqfSpz2k_uKA4FDP'
            />
          </div>
          <div>
            <p className='font-manrope text-sm font-bold tracking-tight text-on-surface'>Admin</p>
            <p className='font-manrope text-[10px] uppercase tracking-widest text-on-surface-variant'>Workspace</p>
          </div>
        </div>
      )}
      <nav className='flex-1 space-y-2 overflow-y-auto pr-1'>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} rounded-lg p-3 transition-all duration-200 ${
                isActive
                  ? 'scale-95 bg-blue-50 font-bold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`
            }
          >
            <span className='material-symbols-outlined'>{item.icon}</span>
            {!collapsed && <span className='font-manrope text-sm font-medium uppercase tracking-widest'>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      {!collapsed && (
        <button className='mt-auto w-full py-3 px-4 bg-error text-on-error font-bold rounded-full text-xs uppercase tracking-widest active:opacity-80 transition-opacity'>
          Emergency Alert
        </button>
      )}
      <div className='pt-4 border-t border-slate-100 dark:border-slate-800'>
        <a
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-2 py-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all text-xs font-bold uppercase tracking-widest`}
          href='#'
        >
          <span className='material-symbols-outlined text-lg'>help_outline</span>
          {!collapsed && <span>Support</span>}
        </a>
        <a
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-2 py-2 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all text-xs font-bold uppercase tracking-widest`}
          href='#'
        >
          <span className='material-symbols-outlined text-lg'>logout</span>
          {!collapsed && <span>Logout</span>}
        </a>
      </div>
    </aside>
  )
}
