export type AdminNavItem = {
  label: string
  description: string
  to: string
  icon: string
  /** Nhóm section giống GR20_1 (Billing & Finance / Utilities) */
  group?: 'billing' | 'utility'
}

/**
 * Menu admin khớp thứ tự & nhóm với GR20_1 SidebarProtect; nhãn tiếng Việt.
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    label: 'Tổng quan',
    description: 'Admin Dashboard',
    to: '/admin',
    icon: 'dashboard'
  },
  {
    label: 'Báo cáo thống kê',
    description: 'Dân cư, căn hộ, tài chính, yêu cầu dịch vụ',
    to: '/statistics',
    icon: 'bar_chart'
  },
  {
    label: 'Quản lý vai trò',
    description: 'Tạo/sửa/xóa vai trò',
    to: '/admin/roles',
    icon: 'admin_panel_settings'
  },
  {
    label: 'Quản lý user',
    description: 'Danh sách người dùng',
    to: '/admin/users',
    icon: 'group'
  },
  {
    label: 'Quản lý tòa nhà',
    description: 'Danh sách building',
    to: '/admin/buildings',
    icon: 'apartment'
  },
  {
    label: 'Quản lý tầng',
    description: 'Danh sách floors',
    to: '/admin/floors',
    icon: 'stairs'
  },
  {
    label: 'Quản lý căn hộ',
    description: 'Danh sách apartments',
    to: '/apartments',
    icon: 'meeting_room'
  },
  {
    label: 'Quản lý tiện ích',
    description: 'Danh sách tiện ích theo tòa',
    to: '/admin/amenities',
    icon: 'pool',
    group: 'utility'
  },
  {
    label: 'Bảo trì',
    description: 'Yêu cầu bảo trì',
    to: '/admin/maintenance-requests',
    icon: 'handyman'
  },
  {
    label: 'Phân công bảo trì',
    description: 'Phân công kỹ thuật',
    to: '/admin/maintenance-assignments',
    icon: 'person_add'
  },
  {
    label: 'Quản lý phương tiện',
    description: 'Danh sách vehicles',
    to: '/admin/vehicles',
    icon: 'directions_car'
  },
  {
    label: 'Quản lý khách',
    description: 'Danh sách visitors',
    to: '/admin/visitors',
    icon: 'badge'
  },
  {
    label: 'Quản lý hợp đồng',
    description: 'Danh sách contracts',
    to: '/admin/contracts',
    icon: 'description'
  },
  {
    label: 'Quản lý hóa đơn',
    description: 'Invoices',
    to: '/admin/invoices',
    icon: 'receipt_long',
    group: 'billing'
  },
  {
    label: 'Quản lý thanh toán',
    description: 'Payments',
    to: '/admin/payments',
    icon: 'payments',
    group: 'billing'
  },
  {
    label: 'Quản lý đồng hồ',
    description: 'Utility meters',
    to: '/admin/utility-meters',
    icon: 'speed',
    group: 'utility'
  },
  {
    label: 'Quản lý chỉ số',
    description: 'Meter readings',
    to: '/admin/meter-readings',
    icon: 'insights',
    group: 'utility'
  },
  {
    label: 'Quản lý giá tiện ích',
    description: 'Bảng giá tiện ích',
    to: '/admin/utility-pricing',
    icon: 'sell',
    group: 'utility'
  },
  {
    label: 'Thông báo admin',
    description: 'Gửi/thu hồi thông báo',
    to: '/admin/notifications',
    icon: 'notifications_active'
  }
]

export const ADMIN_DASHBOARD_SHORTCUTS = ADMIN_NAV_ITEMS.filter((item) => item.to !== '/admin')
