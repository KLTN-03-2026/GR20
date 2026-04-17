import { useRoutes } from 'react-router-dom'
import Buildings from './pages/building management/Buildings'
import Profile from './pages/profile_Management/Profile'
import ScanQr from './pages/QRCODE_USER/Scanqr'
import Login from './pages/Login'
import HomePage from './pages/HomePage'
import DashboardLayoutUser from './layout/DashboardLayoutUser'
import Getresidentlist from './pages/residentmanagement/Getresidentlist'
import Addresident from './pages/residentmanagement/Addresident'
import ResidentDetail from './pages/residentmanagement/Residentdetail'

export default function useRouteElements() {
  //bảng chất thằng này là theo kiểu trên xuống dưới nên dể lỗi ko mong muốn
  const routeElements = useRoutes([
    {
      index: true,
      path: '/',
      element: (
        <DashboardLayoutUser>
          <HomePage />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/buildings',
      element: <Buildings />
    },
    {
      path: '/profile',
      element: (
        <DashboardLayoutUser>
          <Profile />
        </DashboardLayoutUser>
      )
    },
    {
      path: 'api/qrcode',
      element: <ScanQr />
    },
    {
      // ✅ Route cho scan QR
      path: 'scan/:qrCode', //
      element: <ScanQr />
    },
    {
      path: 'login', //
      element: <Login />
    },
    {
      path: '/residents/add',
      element: <Addresident />
    },
    {
      path: '/residents',
      element: <Getresidentlist />
    },
    {
      path: '/residents/:id',
      element: <ResidentDetail />
    }
  ])
  return routeElements
}
