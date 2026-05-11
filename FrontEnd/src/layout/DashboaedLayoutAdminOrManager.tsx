import { useContext, type ReactNode } from 'react'
import { AppContext } from 'src/contexts/app.context'
import { ROLES } from 'src/constants/roles'
import DashboaedLayoutAdmin from './DashboaedLayoutAdmin'
import DashboaedLayoutManager from './DashboaedLayoutManager'

/** Cùng sidebar admin; chen lề khác ADMIN vs Quản lý. */
export default function DashboaedLayoutAdminOrManager({ children }: { children?: ReactNode }) {
  const { user } = useContext(AppContext)
  const roles = user?.roles ?? []
  const isAdmin = roles.includes(ROLES.ADMIN)

  const Layout = isAdmin ? DashboaedLayoutAdmin : DashboaedLayoutManager

  return <Layout>{children}</Layout>
}
