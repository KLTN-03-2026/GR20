// Định nghĩa role constants
export const ROLES = {
  ADMIN: 'ADMIN', // Quyền quản trị toàn bộ
  MANAGER: 'Quản lý', // Ban quản lý
  STAFF: 'Nhân viên', // Nhân viên vận hành
  SECURITY: 'Bảo vệ', // Bảo vệ
  RESIDENT: 'Người Dùng' // Cư dân
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export type PermissionKey = keyof typeof PERMISSIONS //nghĩa là lấy tất cả tên key làm types ( "VIEW_USERS" | "CREATE_USER" |...)

// Định nghĩa quyền cho từng role (có thể mở rộng)
export const PERMISSIONS = {
  // Quyền quản lý user
  VIEW_USERS: ['ADMIN', 'Quản lý'],
  CREATE_USER: ['ADMIN', 'Quản lý'],
  EDIT_USER: ['ADMIN', 'Quản lý'],
  DELETE_USER: ['ADMIN', 'Quản lý'],

  // Quyền quản lý căn hộ
  VIEW_APARTMENTS: ['ADMIN', 'Quản lý', 'Người Dùng'],
  MANAGE_APARTMENTS: ['ADMIN', 'Quản lý'],

  // Quyền quản lý QR
  VIEW_QR: ['ADMIN', 'Quản lý', 'Người Dùng', 'Bảo vệ'],
  CREATE_QR: ['ADMIN', 'Quản lý', 'Người Dùng'],
  SCAN_QR: ['ADMIN', 'Quản lý', 'Bảo vệ'],
  MANAGE_QR: ['ADMIN', 'Quản lý'],

  // Quyền quản lý thông báo
  VIEW_NOTIFICATIONS: ['ADMIN', 'Quản lý', 'Người Dùng'],
  CREATE_NOTIFICATION: ['ADMIN', 'Quản lý'],
  EDIT_NOTIFICATION: ['ADMIN', 'Quản lý'],
  DELETE_NOTIFICATION: ['ADMIN', 'Quản lý'],

  // Quyền nhân viên vận hành
  VIEW_MAINTENANCE_REQUESTS: ['ADMIN', 'Quản lý', 'Nhân viên'],
  UPDATE_MAINTENANCE_STATUS: ['ADMIN', 'Quản lý', 'Nhân viên'],

  // Quyền bảo vệ
  VIEW_RESIDENT_INFO: ['ADMIN', 'Quản lý', 'Bảo vệ'],
  VIEW_VISIT_HISTORY: ['ADMIN', 'Quản lý', 'Bảo vệ'],

  // Quyền cư dân
  VIEW_OWN_APARTMENT: ['Người Dùng'],
  CREATE_MAINTENANCE_REQUEST: ['Người Dùng'],
  VIEW_INVOICES: ['Người Dùng'],
  PAY_INVOICES: ['Người Dùng'],

  // Quyền admin đặc biệt
  FULL_ACCESS: ['ADMIN']
}

// Helper function để kiểm tra quyền
export const hasPermission = (userRole: string, permissionKey: keyof typeof PERMISSIONS): boolean => {
  if (!userRole) return false
  const allowedRoles = PERMISSIONS[permissionKey]
  return allowedRoles.includes(userRole as Role) || (allowedRoles.includes('ADMIN') && userRole === 'ADMIN')
}
