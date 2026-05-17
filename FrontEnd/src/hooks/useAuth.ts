import { useContext, useMemo } from 'react'
import { AppContext } from 'src/contexts/app.context'
import { ROLES, hasPermission, type PermissionKey } from 'src/constants/roles'

export const useAuth = () => {
  const { isAuthenticated, user } = useContext(AppContext)

  const userRole = useMemo(() => {
    if (!user?.roles || user.roles.length === 0) return null
    return user.roles[0] // Lấy role đầu tiên (theo DB của bạn)
  }, [user])

  const isAdmin = useMemo(() => userRole === ROLES.ADMIN, [userRole])
  const isManager = useMemo(() => userRole === ROLES.MANAGER, [userRole])
  const isStaff = useMemo(() => userRole === ROLES.STAFF, [userRole])
  const isSecurity = useMemo(() => userRole === ROLES.SECURITY, [userRole])
  const isResident = useMemo(() => userRole === ROLES.RESIDENT, [userRole])

  // Kiểm tra có ít nhất 1 trong các role được truyền vào không
  const hasAnyRole = (roles: string[]) => {
    if (!userRole) return false
    return roles.includes(userRole)
  }

  // Kiểm tra có tất cả các role được truyền vào không
  const hasAllRoles = (roles: string[]) => {
    if (!userRole) return false
    return roles.every((role) => role === userRole)
  }

  // Kiểm tra permission cụ thể
  const can = (permission: PermissionKey) => {
    return hasPermission(userRole || undefined, permission)
  }

  return {
    isAuthenticated,
    user,
    userRole,
    isAdmin,
    isManager,
    isStaff,
    isSecurity,
    isResident,
    hasAnyRole,
    hasAllRoles,
    can
  }
}
