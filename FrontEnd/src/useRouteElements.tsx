import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import { AppContext } from './contexts/app.context'
import { useContext } from 'react'

import Buildings from './pages/building management/Buildings'
import BuildingImagesManagement from './pages/building management/BuildingImagesManagement'
import UtilityMetersPage from './pages/utility/UtilityMetersPage'
import UtilityPricingPage from './pages/utility/UtilityPricingPage'
import MeterReadingsPage from './pages/utility/MeterReadingsPage'
import UserUtilityMetersPage from './pages/utility/UserUtilityMetersPage'
import UserMeterReadingsPage from './pages/utility/UserMeterReadingsPage'
import InvoicesPage from './pages/billing/InvoicesPage'
import UserInvoicesPage from './pages/billing/UserInvoicesPage'
import InvoiceItemsPage from './pages/billing/InvoiceItemsPage'
import PaymentsPage from './pages/billing/PaymentsPage'
import UserPaymentsPage from './pages/billing/UserPaymentsPage'
import GenerateCashInvoicePage from './pages/billing/GenerateCashInvoicePage'
import Profile from './pages/profile_Management/Profile'
import ScanQr from './pages/QRCODE_USER/Scanqr'
import Login from './pages/Login'
import HomePage from './pages/HomePage'

import DashboardLayoutUser from './layout/DashboardLayoutUser'
import DashboardLayoutProtect from './layout/DashboardLayoutProtect'
import ResidentNotifications from './pages/notifications/ResidentNotifications'
import AdminNotifications from './pages/notifications/AdminNotifications'
import EmployeeManagement from './pages/employees/EmployeeManagement'
import Getresidentlist from './pages/residentmanagement/Getresidentlist'
import Addresident from './pages/residentmanagement/Addresident'
import ResidentDetail from './pages/residentmanagement/Residentdetail'

// QR code
import QrcodeManagement from './pages/QRCODE_USER/QrcodeManagement'
import ViewQRcodeDetails from './pages/QRCODE_USER/ViewQRcodeDetails'
import ResultQrcode from './pages/QRCODE_USER/ResultQrcode'
import HomePageProtect from './pages/protect/HomePage/HomePage'
import HistoryQrcode from './pages/QRCODE_USER/HistoryQrcode'
import ViewQrcodeMe from './pages/QRCODE_USER/ViewQrcodeMe'
import QrcodeManagementAdmin from './pages/QrcodeAdmin/QrcodeManagementAdmin'
import ViewAllHistoryQrcode from './pages/QrcodeAdmin/ViewAllHistoryQrcode'

// kiểm tra login
function ProtectedAdminRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, user } = useContext(AppContext)
  const hasPermission = user?.roles?.includes('ADMIN') || user?.roles?.includes('Quản lý')

  if (!isAuthenticated) return <Navigate to='/login' />
  if (!hasPermission) return <Navigate to='/' />

  return children || <Outlet />
}

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
      path: '/building-images',
      element: <BuildingImagesManagement />
    },
    {
      path: '/utility-meters',
      element: <UtilityMetersPage />
    },
    {
      path: '/my-utility-meters',
      element: (
        <DashboardLayoutUser>
          <UserUtilityMetersPage />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/utility-pricing',
      element: <UtilityPricingPage />
    },
    {
      path: '/meter-readings',
      element: <MeterReadingsPage />
    },
    {
      path: '/my-meter-readings',
      element: (
        <DashboardLayoutUser>
          <UserMeterReadingsPage />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/invoices',
      element: <InvoicesPage />
    },
    {
      path: '/my-invoices',
      element: (
        <DashboardLayoutUser>
          <UserInvoicesPage />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/invoice-items',
      element: <InvoiceItemsPage />
    },
    {
      path: '/payments',
      element: (
        <DashboardLayoutUser>
          <UserPaymentsPage />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/admin/payments',
      element: <PaymentsPage />
    },
    {
      path: '/billing-generate-cash',
      element: <GenerateCashInvoicePage />
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
      element: (
        <ProtectedAdminRoute>
          <DashboardLayoutProtect>
            <EmployeeManagement />
          </DashboardLayoutProtect>
        </ProtectedAdminRoute>
      )
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
      path: 'viewQrcodeMe',
      element: (
        <DashboardLayoutUser>
          <ViewQrcodeMe />
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
    },
    {
      path: '/residents',
      element: <Getresidentlist />
    },
    {
      path: '/residents/add',
      element: <Addresident />
    },
    {
      path: '/residents/:id',
      element: <ResidentDetail />
    },
    {
      path: 'qrcodeAdmin',
      element: <QrcodeManagementAdmin />
    },
    {
      path: 'historyQrcodeAdmin',
      element: <ViewAllHistoryQrcode />
    },
    {
      path: '/notifications',
      element: (
        <DashboardLayoutUser>
          <ResidentNotifications />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/admin/notifications',
      element: (
        <ProtectedAdminRoute>
          <DashboardLayoutProtect>
            <AdminNotifications />
          </DashboardLayoutProtect>
        </ProtectedAdminRoute>
      )
    }
  ])

  return routeElements
}
