import type { User } from 'src/types/user.type'

/** Chuẩn hoá một phần tử role (string hoặc object từ API). */
export function normalizeRoleToken(role: unknown): string {
  if (role == null) return ''
  if (typeof role === 'string') return role.toLowerCase().trim()
  if (typeof role === 'object') {
    const o = role as Record<string, unknown>
    const v = o.name ?? o.roleName ?? o.code ?? o.role ?? o.label
    if (typeof v === 'string') return v.toLowerCase().trim()
  }
  return String(role).toLowerCase().trim()
}

/**
 * Ai có một trong các role này (không phân biệt hoa thường) được coi là vào được khu vực admin.
 * Khớp với ProtectedAdminRoute trong useRouteElements.
 */
export function userHasAdminPanelAccess(user: Pick<User, 'roles'> | null | undefined): boolean {
  const list = user?.roles
  if (!Array.isArray(list) || list.length === 0) return false

  const normalized = list.map(normalizeRoleToken)

  const ADMIN_PANEL_ROLES = new Set([
    'admin',
    'administrator',
    'super_admin',
    'role_admin',
    'manager',
    'management',
    'quản lý'
  ])

  return normalized.some((r) => r !== '' && ADMIN_PANEL_ROLES.has(r))
}

/** Sau đăng nhập: admin → dashboard admin, còn lại → trang chủ. */
export function getPostLoginRedirectPath(user: Pick<User, 'roles'> | null | undefined): string {
  return userHasAdminPanelAccess(user) ? '/admin' : '/'
}
