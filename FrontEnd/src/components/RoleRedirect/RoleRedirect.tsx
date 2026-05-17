import { Navigate } from 'react-router-dom'
import { useAuth } from 'src/hooks/useAuth'
import { ROLES } from 'src/constants/roles'

export default function RoleRedirect() {
  const { userRole, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to='/login' />

  switch (userRole) {
    case ROLES.ADMIN:
      return <Navigate to='/admin' />

    case ROLES.MANAGER:
      return <Navigate to='/manager' />

    case ROLES.STAFF:
      return <Navigate to='/staff' />

    case ROLES.SECURITY:
      return <Navigate to='/security' />

    case ROLES.RESIDENT:
      return <Navigate to='/resident' />

    default:
      return <Navigate to='/login' />
  }
}
