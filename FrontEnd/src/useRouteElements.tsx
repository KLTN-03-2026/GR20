import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import { AppContext } from './contexts/app.context'
import { useContext } from 'react'
import Buildings from './pages/building management/Buildings'
import Profile from './pages/profile_Management/Profile'
import ScanQr from './pages/QRCODE_USER/Scanqr'
import Login from './pages/Login'
import HomePage from './pages/HomePage'
import DashboardLayoutUser from './layout/DashboardLayoutUser'
import QrcodeManagement from './pages/QRCODE_USER/QrcodeManagement'
import ViewQRcodeDetails from './pages/QRCODE_USER/ViewQRcodeDetails'
import ResultQrcode from './pages/QRCODE_USER/ResultQrcode'
import HomePageProtect from './pages/protect/HomePage/HomePage'
import DashboardLayoutProtect from './layout/DashboardLayoutProtect'
import HistoryQrcode from './pages/QRCODE_USER/HistoryQrcode'

//tạo cái component để kiểm tra người dùng login chưa

function ProtecdRouter() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
  //nghĩa là nêu login rồi là true thi outlet(tiếp tục vào) ngược kaij thì tới trang login
}

const a = {}
//người dùng login r ko cho vào lại trang login nữa login ban đầu là false

function RejectedRouter() {
  const { isAuthenticated } = useContext(AppContext)
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
  //nghĩa là nêu login rồi là true thi outlet(tiếp tục vào) ngược lại thì tới trang login
}

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
      path: 'login', //
      element: <Login />
    },
    {
      path: 'qrcode', //
      element: (
        <DashboardLayoutUser>
          <QrcodeManagement />
        </DashboardLayoutUser>
      )
    },
    {
      path: 'qrcodeDetail/:id',
      element: (
        <DashboardLayoutProtect>
          <ViewQRcodeDetails />
        </DashboardLayoutProtect>
      )
    },
    {
      path: 'result/:qrCode',
      element: (
        <DashboardLayoutProtect>
          <ResultQrcode />
        </DashboardLayoutProtect>
      )
    },
    {
      path: 'scanqr',
      element: (
        <DashboardLayoutProtect>
          <ScanQr />
        </DashboardLayoutProtect>
      )
    },
    {
      path: 'homepageprotect',
      element: (
        <DashboardLayoutProtect>
          <HomePageProtect />
        </DashboardLayoutProtect>
      )
    },
    {
      path: 'history/qrcode',
      element: (
        <DashboardLayoutProtect>
          <HistoryQrcode />
        </DashboardLayoutProtect>
      )
    }
  ])
  return routeElements
}
