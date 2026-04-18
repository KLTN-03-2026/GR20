import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import { AppContext } from './contexts/app.context'
import { useContext } from 'react'

import Buildings from './pages/building management/Buildings'
import Profile from './pages/profile_Management/Profile'
import ScanQr from './pages/QRCODE_USER/Scanqr'
import Login from './pages/Login'
import HomePage from './pages/HomePage'

import DashboardLayoutUser from './layout/DashboardLayoutUser'
import DashboardLayoutProtect from './layout/DashboardLayoutProtect'

import EmployeeManagement from './pages/employees/EmployeeManagement'

// QR code
import QrcodeManagement from './pages/QRCODE_USER/QrcodeManagement'
import ViewQRcodeDetails from './pages/QRCODE_USER/ViewQRcodeDetails'
import ResultQrcode from './pages/QRCODE_USER/ResultQrcode'
import HomePageProtect from './pages/protect/HomePage/HomePage'
import HistoryQrcode from './pages/QRCODE_USER/HistoryQrcode'

// kiểm tra login
function ProtecdRouter() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

function RejectedRouter() {
  const { isAuthenticated } = useContext(AppContext)
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
}

export default function useRouteElements() {
  const routeElements = useRoutes([
    {
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
      path: '/login',
      element: <Login />
    },
    {
      path: '/employees',
      element: <EmployeeManagement />
    },

    // ===== QR CODE =====
    {
      path: '/qrcode',
      element: (
        <DashboardLayoutUser>
          <QrcodeManagement />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/qrcodeDetail/:id',
      element: (
        <DashboardLayoutProtect>
          <ViewQRcodeDetails />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/result/:qrCode',
      element: (
        <DashboardLayoutProtect>
          <ResultQrcode />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/scanqr',
      element: (
        <DashboardLayoutProtect>
          <ScanQr />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/homepageprotect',
      element: (
        <DashboardLayoutProtect>
          <HomePageProtect />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/history/qrcode',
      element: (
        <DashboardLayoutProtect>
          <HistoryQrcode />
        </DashboardLayoutProtect>
      )
    }
  ])

  return routeElements
}
