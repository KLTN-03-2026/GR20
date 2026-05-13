import { useContext } from 'react'
import { AppContext } from 'src/contexts/app.context'
import { ROLES } from 'src/constants/roles'
import DashboaedLayoutAdmin from 'src/layout/DashboaedLayoutAdmin'
import DashboaedLayoutManager from 'src/layout/DashboaedLayoutManager'
import StatisticsReportPage from './StatisticsReportPage'

export default function StatisticsReportShell() {
  const { user } = useContext(AppContext)
  const roles = user?.roles ?? []
  const isAdmin = roles.includes(ROLES.ADMIN)

  const Layout = isAdmin ? DashboaedLayoutAdmin : DashboaedLayoutManager

  return (
    <Layout>
      <StatisticsReportPage />
    </Layout>
  )
}
