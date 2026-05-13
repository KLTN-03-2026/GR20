import { useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

interface MenuGroup {
  label: string
  icon: string
  items: Array<{
    path: string
    label: string
    icon: string
  }>
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Tổng quan',
    icon: 'dashboard',
    items: [
      {
        path: '/admin',
        label: 'Tổng quan hệ thống',
        icon: 'analytics'
      },
      {
        path: '/statistics',
        label: 'Báo cáo thống kê',
        icon: 'bar_chart'
      }
    ]
  },

  {
    label: 'Quản lý cư dân & Căn hộ',
    icon: 'groups',
    items: [
      {
        path: '/owner/management/residents',
        label: 'Quản lý cư dân',
        icon: 'people'
      },
      {
        path: '/owner/management/apartments',
        label: 'Quản lý căn hộ',
        icon: 'apartment'
      },
      {
        path: '/owner/security/residents',
        label: 'Tra cứu thông tin cư dân',
        icon: 'person_search'
      }
    ]
  },

  /** Tòa nhà + hóa đơn + tiện ích — các route `/admin/*` dùng chung ADMIN & Quản lý */
  {
    label: 'Tòa nhà & Tài chính',
    icon: 'account_balance_wallet',
    items: [
      {
        path: '/admin/buildings',
        label: 'Quản lý tòa nhà',
        icon: 'apartment'
      },
      {
        path: '/admin/contracts',
        label: 'Quản lý hợp đồng',
        icon: 'description'
      },
      {
        path: '/admin/invoices',
        label: 'Quản lý hóa đơn',
        icon: 'receipt_long'
      },
      {
        path: '/admin/payments',
        label: 'Quản lý thanh toán',
        icon: 'payments'
      },
      {
        path: '/admin/utility-meters',
        label: 'Quản lý đồng hồ',
        icon: 'speed'
      },
      {
        path: '/admin/meter-readings',
        label: 'Quản lý chỉ số',
        icon: 'insights'
      },
      {
        path: '/admin/utility-pricing',
        label: 'Quản lý giá tiện ích',
        icon: 'sell'
      }
    ]
  },

  {
    label: 'Vận hành & Dịch vụ',
    icon: 'build',
    items: [
      {
        path: '/owner/operations/requests',
        label: 'Quản lý yêu cầu cư dân',
        icon: 'assignment'
      },
      {
        path: '/owner/management/staff',
        label: 'Quản lý nhân viên',
        icon: 'badge'
      },
      {
        path: '/owner/management/services',
        label: 'Quản lý tiện ích',
        icon: 'home_repair_service'
      },
      {
        path: '/owner/management/contracts',
        label: 'Quản lý hợp đồng',
        icon: 'description'
      }
    ]
  },

  {
    label: 'Báo cáo & Thống kê',
    icon: 'bar_chart',
    items: [
      {
        path: '/owner/management/notifications',
        label: 'Quản lý thông báo',
        icon: 'campaign'
      }
    ]
  },

  {
    label: 'Bảo mật & Kiểm soát',
    icon: 'security',
    items: [
      {
        path: '/qrcode',
        label: 'Quản lý QR',
        icon: 'qr_code_2'
      },
      {
        path: '/owner/security/scan',
        label: 'Quét QR',
        icon: 'qr_code_scanner'
      },
      {
        path: '/owner/security/history',
        label: 'Lịch sử ra vào',
        icon: 'history'
      },
      {
        path: '/owner/security/incident-report',
        label: 'Báo cáo sự cố',
        icon: 'report_problem'
      },
      {
        path: '/owner/system-monitor',
        label: 'Theo dõi hệ thống',
        icon: 'monitor_heart'
      }
    ]
  }
]

type SidebarVariant = 'admin' | 'manager'

interface Props {
  /** ADMIN: /admin*, QUẢN LÝ: /manager & cùng menu /admin/buildings … */
  variant?: SidebarVariant
}

export default function SidebarOwnerOptimized({ variant = 'admin' }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const navigate = useNavigate()
  const subtitle = variant === 'manager' ? 'QUẢN LÝ' : 'ADMIN'
  /** Mặc định mở nhóm có /admin/buildings để không phải tìm trong sidebar */
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Tổng quan', 'Tòa nhà & Tài chính'])

  const dashboardPath = variant === 'manager' ? '/manager' : '/admin'
  const resolvedMenuGroups = useMemo(
    () =>
      menuGroups.map((group) =>
        group.label === 'Tổng quan'
          ? {
              ...group,
              items: group.items.map((item) =>
                item.path === '/admin' ? { ...item, path: dashboardPath } : item
              ),
            }
          : group
      ),
    [dashboardPath]
  )

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupLabel) ? prev.filter((g) => g !== groupLabel) : [...prev, groupLabel]
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    navigate('/login', { replace: true })
  }

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
      : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen fixed left-0 top-0 bg-surface-container-low shadow-sm z-50 overflow-hidden transition-all duration-300 border-r border-secondary-container/20 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className='p-4 flex items-center justify-between border-b border-secondary-container/20'>
        {!isCollapsed && (
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <div className='w-11 h-11 bg-blue-900 rounded-2xl flex items-center justify-center text-white flex-shrink-0'>
              <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
                home
              </span>
            </div>

            <div className='min-w-0 flex-1'>
              <h1 className='text-base font-extrabold text-blue-900 tracking-tight truncate'>HomeLink AI</h1>

              <p className='text-[10px] font-semibold text-teal-700 uppercase tracking-[0.25em] truncate'>
                {subtitle}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='p-2 hover:bg-secondary-container/20 rounded-lg text-slate-500 hover:text-blue-900 transition-colors flex-shrink-0'
        >
          <span className='material-symbols-outlined text-xl'>
            {isCollapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className='flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden'>
        {resolvedMenuGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.label)

          return (
            <div key={group.label}>
              {/* Group header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className='w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors'
                >
                  <div className='flex items-center gap-2 min-w-0 flex-1'>
                    <span className='material-symbols-outlined text-[18px] flex-shrink-0'>{group.icon}</span>

                    <span className='truncate text-left'>{group.label}</span>
                  </div>

                  <span
                    className='material-symbols-outlined text-[18px] transition-transform duration-200 flex-shrink-0'
                    style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  >
                    expand_more
                  </span>
                </button>
              )}

              {(isCollapsed || isExpanded) && (
                <div className={`space-y-1 ${!isCollapsed ? 'mt-2' : ''}`}>
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/admin' || item.path === '/manager'}
                      className={getNavClass}
                      title={isCollapsed ? item.label : ''}
                    >
                      <span className='material-symbols-outlined text-xl flex-shrink-0'>{item.icon}</span>

                      {!isCollapsed && (
                        <span className='text-sm font-medium truncate flex-1 min-w-0'>{item.label}</span>
                      )}

                      {isCollapsed && (
                        <div className='absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50'>
                          {item.label}
                        </div>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom menu */}
      <div className='border-t border-secondary-container/20 pt-3 pb-4 px-3 space-y-1'>
        <NavLink
          to='/owner/community-chat'
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 relative group ${
              isActive ? 'text-blue-900 bg-secondary-container/20' : ''
            }`
          }
        >
          <span className='material-symbols-outlined text-xl flex-shrink-0'>forum</span>

          {!isCollapsed && <span className='text-sm truncate flex-1'>Chat cộng đồng</span>}
        </NavLink>

        <NavLink
          to='/profile'
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 relative group ${
              isActive ? 'text-blue-900 bg-secondary-container/20' : ''
            }`
          }
        >
          <span className='material-symbols-outlined text-xl flex-shrink-0'>account_circle</span>

          {!isCollapsed && <span className='text-sm truncate flex-1'>Thông tin cá nhân</span>}
        </NavLink>

        <NavLink
          to='/owner/settings'
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 relative group ${
              isActive ? 'text-blue-900 bg-secondary-container/20' : ''
            }`
          }
        >
          <span className='material-symbols-outlined text-xl flex-shrink-0'>settings</span>

          {!isCollapsed && <span className='text-sm truncate flex-1'>Cài đặt</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors'
        >
          <span className='material-symbols-outlined text-xl flex-shrink-0'>logout</span>

          {!isCollapsed && <span className='text-sm truncate flex-1'>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  )
}
