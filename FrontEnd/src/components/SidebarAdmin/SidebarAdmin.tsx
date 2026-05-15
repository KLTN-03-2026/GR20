import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

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
        path: '/admin/',
        label: 'Tổng quan hệ thống',
        icon: 'analytics'
      }
    ]
  },

  {
    label: 'Quản lý cư dân & Căn hộ',
    icon: 'groups',
    items: [
      {
        path: '/Getresidentlist',
        label: 'Quản lý cư dân',
        icon: 'people'
      },
      {
        path: '/owner/management/apartments',
        label: 'Quản lý căn hộ',
        icon: 'apartment'
      },
      {
        path: '/residents',
        label: 'Tra cứu thông tin cư dân',
        icon: 'person_search'
      },
      {
        path: '/admin/buildings',
        label: 'Quản lý tòa nhà',
        icon: 'location_city'
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
        path: '/owner/management/invoices',
        label: 'Quản lý phí dịch vụ',
        icon: 'receipt_long'
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
      },
      {
        path: '/admin/meter-readings',
        label: 'Quản lí Chỉ Số',
        icon: 'electric_meter'
      },
      {
        path: '/admin/utility-pricing',
        label: 'Quản lí Giá',
        icon: 'price_change'
      },
      {
        path: '/admin/utility-meters',
        label: 'Quản lí Đồng Hồ',
        icon: 'electric_meter'
      },
      {
        path: '/admin/invoices',
        label: 'Quản lí Hóa Đơn',
        icon: 'receipt_long'
      },
      {
        path: '/admin/payments',
        label: 'Quản lí Thanh Toán',
        icon: 'payments'
      }
    ]
  },

  {
    label: 'Báo cáo & Thống kê',
    icon: 'bar_chart',
    items: [
      {
        path: '/statisticsreportpage',
        label: 'Báo cáo thống kê',
        icon: 'analytics'
      },
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
        path: '/admin/qrcodeAdmin',
        label: 'Quản lý QR',
        icon: 'qr_code_2'
      },
      {
        path: '/scanqr',
        label: 'Quét QR',
        icon: 'qr_code_scanner'
      }
    ]
  }
]

export default function SidebarOwnerOptimized() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const navigate = useNavigate()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Tổng quan'])

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
          <Link
            to={'/admin'}
            className='flex items-center space-x-3 mb-3 group transition-all duration-300 hover:scale-[1.02]'
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
                OWNER
              </p>
            </div>
          </Link>
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

      <nav className='flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden'>
        {menuGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.label)

          return (
            <div key={group.label}>
              {/* Group header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl
transition-all duration-300 border
    ${
      isExpanded
        ? 'bg-blue-100   border-blue-300 text-blue-500 shadow-md'
        : 'border-transparent text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20'
    }`}
                >
                  <div className='flex items-center gap-3 min-w-0 flex-1'>
                    <span
                      className={`material-symbols-outlined text-[20px]
        ${isExpanded ? 'text-blue-500' : 'text-slate-400'}`}
                    >
                      {group.icon}
                    </span>

                    <span className='truncate text-left text-[12px] font-extrabold uppercase tracking-wider'>
                      {group.label}
                    </span>
                  </div>

                  <span
                    className='material-symbols-outlined text-[20px] transition-transform duration-300'
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
