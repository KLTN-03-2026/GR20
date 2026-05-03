import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import { AppContext } from './contexts/app.context'
import { useContext } from 'react'

import Buildings from './pages/building management/Buildings'
import BuildingImagesManagement from './pages/building management/BuildingImagesManagement'
import UtilityMetersPage from './pages/utility/UtilityMetersPage'
import UtilityPricingPage from './pages/utility/UtilityPricingPage'
import MeterReadingsPage from './pages/utility/MeterReadingsPage'
import UserUtilityMetersPage from './pages/utility/UserUtilityMetersPage'
import UserUtilityMeterDetailPage from './pages/utility/UserUtilityMeterDetailPage'
import UserUtilityPricingPage from './pages/utility/UserUtilityPricingPage'
import UserUtilityPricingDetailPage from './pages/utility/UserUtilityPricingDetailPage'
import UserMeterReadingsPage from './pages/utility/UserMeterReadingsPage'
import UserMeterReadingDetailPage from './pages/utility/UserMeterReadingDetailPage'
import InvoicesPage from './pages/billing/InvoicesPage'
import UserInvoicesPage from './pages/billing/UserInvoicesPage'
import UserInvoiceDetailPage from './pages/billing/UserInvoiceDetailPage'
import InvoiceItemsPage from './pages/billing/InvoiceItemsPage'
import PaymentsPage from './pages/billing/PaymentsPage'
import PaymentDetailAdminPage from './pages/billing/PaymentDetailAdminPage'
import UserPaymentsPage from './pages/billing/UserPaymentsPage'
import UserPaymentDetailPage from './pages/billing/UserPaymentDetailPage'
import InvoiceDetailAdminPage from './pages/billing/InvoiceDetailAdminPage'
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

import Floors from './pages/building management/Floors'
import Apartment from './pages/Apartments/Apartment'
import ApartmentDetail from './pages/Apartments/ApartmentDetail'
import BuildingAssignmentsManagement from './pages/building management/BuildingAssignmentsManagement'
import BuildingDetailManagement from './pages/building management/BuildingDetailManagement'
import RoleManagement from './pages/roles/RoleManagement'
import UserManagement from './pages/users/UserManagement'
import UserDetailPage from './pages/users/UserDetailPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import MaintenanceRequestsAdminPage from './pages/maintenance/MaintenanceRequestsAdminPage'
import MaintenanceAssignmentsAdminPage from './pages/maintenance/MaintenanceAssignmentsAdminPage'
import MaintenanceUserPage from './pages/maintenance/MaintenanceUserPage'
import MyApartment from './pages/MyApartment/MyApartment'
import MyContract from './pages/MyApartment/MyContract'
import ContractList from './pages/Contracts/ContractList'
import ContractDetail from './pages/Contracts/ContractDetail'
import Analytics from './pages/Analytics/Analytics'
import AmenityList from './pages/Amenities/AmenityList'
import AmenityDetail from './pages/Amenities/AmenityDetail'
import VehiclesAdminPage from './pages/vehicles/VehiclesAdminPage'
import VisitorsAdminPage from './pages/visitors/VisitorsAdminPage'

// QR code
import QrcodeManagement from './pages/QRCODE_USER/QrcodeManagement'
import ViewQRcodeDetails from './pages/QRCODE_USER/ViewQRcodeDetails'
import ResultQrcode from './pages/QRCODE_USER/ResultQrcode'
import HomePageProtect from './pages/protect/HomePage/HomePage'
import HistoryQrcode from './pages/QRCODE_USER/HistoryQrcode'
import ViewQrcodeMe from './pages/QRCODE_USER/ViewQrcodeMe'
import QrcodeManagementAdmin from './pages/QrcodeAdmin/QrcodeManagementAdmin'
import ViewAllHistoryQrcode from './pages/QrcodeAdmin/ViewAllHistoryQrcode'
import { userHasAdminPanelAccess } from 'src/utils/postLoginRedirect'

// kiểm tra login
function ProtectedAdminRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, user } = useContext(AppContext)

  if (!isAuthenticated) return <Navigate to='/login' />
  if (!userHasAdminPanelAccess(user)) return <Navigate to='/' />

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
      path: '/my-apartment',
      element: (
        <DashboardLayoutUser>
          <MyApartment />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/my-contract',
      element: (
        <DashboardLayoutUser>
          <MyContract />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/maintenance',
      element: (
        <DashboardLayoutUser>
          <MaintenanceUserPage />
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
      path: '/floors',
      element: <Floors />
    },
    {
      path: '/apartments',
      element: (
        <DashboardLayoutProtect>
          <Apartment />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/apartments/:id',
      element: (
        <DashboardLayoutProtect>
          <ApartmentDetail />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/buildings/:id',
      element: <BuildingDetailManagement />
    },
    {
      path: '/building-assignments',
      element: <BuildingAssignmentsManagement />
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
      path: '/my-utility-meters/:id',
      element: (
        <DashboardLayoutUser>
          <UserUtilityMeterDetailPage />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/utility-pricing',
      element: (
        <DashboardLayoutUser>
          <UserUtilityPricingPage />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/utility-pricing/:id',
      element: (
        <DashboardLayoutUser>
          <UserUtilityPricingDetailPage />
        </DashboardLayoutUser>
      )
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
      path: '/my-meter-readings/:id',
      element: (
        <DashboardLayoutUser>
          <UserMeterReadingDetailPage />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/invoices',
      element: (
        <DashboardLayoutUser>
          <UserInvoicesPage />
        </DashboardLayoutUser>
      )
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
      path: '/invoices/:id',
      element: (
        <DashboardLayoutUser>
          <UserInvoiceDetailPage />
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
      path: '/payments/:id',
      element: (
        <DashboardLayoutUser>
          <UserPaymentDetailPage />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/analytics',
      element: (
        <DashboardLayoutProtect>
          <Analytics />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/contracts',
      element: (
        <DashboardLayoutProtect>
          <ContractList />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/contracts/:id',
      element: (
        <DashboardLayoutProtect>
          <ContractDetail />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/amenities',
      element: (
        <DashboardLayoutProtect>
          <AmenityList />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/amenities/:id',
      element: (
        <DashboardLayoutProtect>
          <AmenityDetail />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/my-amenities',
      element: (
        <DashboardLayoutUser>
          <AmenityList isResident />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/my-amenities/:id',
      element: (
        <DashboardLayoutUser>
          <AmenityDetail />
        </DashboardLayoutUser>
      )
    },
    {
      path: '/admin/payments',
      element: (
        <DashboardLayoutProtect>
          <PaymentsPage />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/payments/:id',
      element: (
        <DashboardLayoutProtect>
          <PaymentDetailAdminPage />
        </DashboardLayoutProtect>
      )
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
      path: '/admin/login',
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
    {
      path: '/roles',
      element: (
        <DashboardLayoutProtect>
          <RoleManagement />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/users-test',
      element: (
        <DashboardLayoutProtect>
          <UserManagement />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin',
      element: (
        <DashboardLayoutProtect>
          <AdminDashboard />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/roles',
      element: (
        <DashboardLayoutProtect>
          <RoleManagement />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/users/:id',
      element: (
        <DashboardLayoutProtect>
          <UserDetailPage />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/users',
      element: (
        <DashboardLayoutProtect>
          <UserManagement />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/buildings',
      element: (
        <DashboardLayoutProtect>
          <Buildings />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/floors',
      element: (
        <DashboardLayoutProtect>
          <Floors />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/utility-pricing',
      element: (
        <DashboardLayoutProtect>
          <UtilityPricingPage />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/utility-meters',
      element: (
        <DashboardLayoutProtect>
          <UtilityMetersPage />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/meter-readings',
      element: (
        <DashboardLayoutProtect>
          <MeterReadingsPage />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/invoices',
      element: (
        <DashboardLayoutProtect>
          <InvoicesPage />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/invoices/:id',
      element: (
        <DashboardLayoutProtect>
          <InvoiceDetailAdminPage />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/invoice-items',
      element: (
        <DashboardLayoutProtect>
          <InvoiceItemsPage />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/maintenance-requests',
      element: (
        <DashboardLayoutProtect>
          <MaintenanceRequestsAdminPage />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/maintenance-assignments',
      element: (
        <DashboardLayoutProtect>
          <MaintenanceAssignmentsAdminPage />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/vehicles',
      element: (
        <DashboardLayoutProtect>
          <VehiclesAdminPage />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/visitors',
      element: (
        <DashboardLayoutProtect>
          <VisitorsAdminPage />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/contracts',
      element: (
        <DashboardLayoutProtect>
          <ContractList />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/contracts/:id',
      element: (
        <DashboardLayoutProtect>
          <ContractDetail />
        </DashboardLayoutProtect>
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
        <DashboardLayoutProtect>
          <AdminNotifications />
        </DashboardLayoutProtect>
      )
    },
    {
      path: '/admin/profile',
      element: (
        <DashboardLayoutProtect>
          <Profile />
        </DashboardLayoutProtect>
      )
    }
  ])

  return routeElements
}
