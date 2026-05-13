import { ROLES } from 'src/constants/roles'

// Định nghĩa cấu hình cho từng route
export interface RouteConfig {
  path: string
  element: React.ReactNode
  allowedRoles?: string[] // undefined = tất cả role đã login đều được, [] = chỉ cần login
  children?: RouteConfig[]
}

export const ROLE_ROUTE_MAP: Record<string, string[]> = {
  [ROLES.ADMIN]: [
    '/',
    '/profile',
    '/employees',
    '/residents',
    '/residents/*',
    '/admin/notifications',
    '/admin/viewDetailResident/*',
    '/admin/buildings',
    '/admin/invoices',
    '/admin/invoices/*',
    '/admin/payments',
    '/admin/payments/*',
    '/admin/contracts',
    '/admin/contracts/*',
    '/admin/utility-meters',
    '/admin/meter-readings',
    '/admin/utility-pricing',
    'qrcodeAdmin',
    'historyQrcodeAdmin',
    '/notifications',
    '/qrcode',
    '/viewQrcodeMe',
    '/qrcodeDetail/*',
    '/scanqr',
    '/homepageprotect',
    '/history/qrcode',
    '/security/residents',
    '/security/residents/*',
    '/statistics'
  ],

  [ROLES.MANAGER]: [
    '/',
    '/profile',
    '/employees',
    '/residents',
    '/residents/*',
    '/admin/notifications',
    '/admin/viewDetailResident/*',
    '/admin/buildings',
    '/admin/invoices',
    '/admin/invoices/*',
    '/admin/payments',
    '/admin/payments/*',
    '/admin/contracts',
    '/admin/contracts/*',
    '/admin/utility-meters',
    '/admin/meter-readings',
    '/admin/utility-pricing',
    'qrcodeAdmin',
    'historyQrcodeAdmin',
    '/notifications',
    '/qrcode',
    '/viewQrcodeMe',
    '/qrcodeDetail/*',
    '/scanqr',
    '/homepageprotect',
    '/history/qrcode',
    '/security/residents',
    '/security/residents/*',
    '/statistics'
  ],

  [ROLES.STAFF]: [
    '/',
    '/profile',
    '/buildings',
    '/notifications',
    '/qrcode',
    '/viewQrcodeMe',
    '/scanqr',
    '/homepageprotect'
  ],

  [ROLES.SECURITY]: [
    '/',
    '/profile',
    '/security/residents',
    '/security/residents/*',
    '/scanqr',
    '/homepageprotect',
    '/history/qrcode'
  ],

  [ROLES.RESIDENT]: [
    '/',
    '/profile',
    '/notifications',
    '/UserInvoicesPage',
    '/UserPaymentsPage',
    '/invoices',
    '/invoices/*',
    '/payments',
    '/payments/*',
    '/my-utility-meters',
    '/my-utility-meters/*',
    '/my-meter-readings',
    '/my-meter-readings/*',
    '/qrcode',
    '/viewQrcodeMe',
    '/qrcodeDetail/*',
    '/history/qrcode'
  ]
}

// Helper kiểm tra route có được phép không
export const isRouteAllowed = (pathname: string, userRole: string | null): boolean => {
  if (!userRole) return false

  const allowedPaths = ROLE_ROUTE_MAP[userRole] || []

  // Kiểm tra exact match hoặc pattern match (VD: /residents/123 match /residents/*)
  return allowedPaths.some((pattern) => {
    if (pattern.endsWith('/*')) {
      const basePath = pattern.slice(0, -2)
      return pathname.startsWith(basePath)
    }
    return pattern === pathname
  })
}
