// import { Navigate, Outlet } from 'react-router-dom'
// import { useAuth } from 'src/hooks/useAuth'

// interface ProtectedRouteProps {
//   allowedRoles?: string[] // Nếu có thì kiểm tra role, không thì chỉ kiểm tra login
//   children?: React.ReactNode
//   redirectTo?: string
// }

// export const ProtectedRoute = ({ allowedRoles, children, redirectTo = '/login' }: ProtectedRouteProps) => {
//   const { isAuthenticated, hasAnyRole } = useAuth()

//   if (allowedRoles && !hasAnyRole(allowedRoles)) {
//     return <Navigate to='/' />
//   }
//   // Chưa đăng nhập
//   if (!isAuthenticated) {
//     return <Navigate to={redirectTo} replace />
//   }

//   // Có yêu cầu role nhưng user không có quyền
//   if (allowedRoles && allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
//     return <Navigate to='/' replace />
//   }

//   return children ? <>{children}</> : <Outlet />
// }

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from 'src/hooks/useAuth'

interface ProtectedRouteProps {
  allowedRoles?: string[]
  children?: React.ReactNode
  redirectTo?: string
}

export const ProtectedRoute = ({ allowedRoles, children, redirectTo = '/login' }: ProtectedRouteProps) => {
  const { isAuthenticated, hasAnyRole } = useAuth()

  // 1. Chưa login → về login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // 2. Sai role → về "/" (RoleRedirect xử lý tiếp)
  if (allowedRoles?.length && !hasAnyRole(allowedRoles)) {
    return <Navigate to='/' replace />
  }

  // 3. OK → render
  return children ?? <Outlet />
}
