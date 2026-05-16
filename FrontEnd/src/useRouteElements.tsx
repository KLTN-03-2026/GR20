import { Navigate, useRoutes } from 'react-router-dom'
import { ROLES } from 'src/constants/roles'
import Buildings from './pages/building management/Buildings'
import BuildingDetailManagement from './pages/building management/BuildingDetailManagement'
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
import ChatPage from './pages/chat/ChatPage'

import QrcodeManagement from './pages/QRCODE_USER/QrcodeManagement'
import ViewQRcodeDetails from './pages/QRCODE_USER/ViewQRcodeDetails'
import ResultQrcode from './pages/QRCODE_USER/ResultQrcode'
import HistoryQrcode from './pages/QRCODE_USER/HistoryQrcode'
import ViewQrcodeMe from './pages/QRCODE_USER/ViewQrcodeMe'
import GuestQRDetail from './pages/QRCODE_USER/GuestQRDetail'

import QrcodeManagementAdmin from './pages/QrcodeAdmin/QrcodeManagementAdmin'
import ViewAllHistoryQrcode from './pages/QrcodeAdmin/ViewAllHistoryQrcode'
import ViewDetailResident from './pages/QrcodeAdmin/ViewDetailResident'

import DashboaedLayoutStaff from './layout/DashboaedLayoutStaff'
import DashboaedLayoutAdmin from './layout/DashboaedLayoutAdmin'
import DashboaedLayoutManager from './layout/DashboaedLayoutManager'

import SecurityResident from './pages/security_CuDan/SecurityResident'
import ResidentDetailPage from './pages/security_CuDan/ResidentDetailModal'

import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute'
import RoleRedirect from './components/RoleRedirect/RoleRedirect'

import HomePageSecurity from './pages/HomePageScurity/HomePageScurity'
import HomePageAdmin from './pages/HomePageAdmin/HomePageAdmin'
import HomePageStaff from './pages/HomePageStaff/HomePageStaff'
import HomePageManager from './pages/HomePageManager/HomePageManager'
import UserInvoicesPage from './pages/billing/UserInvoicesPage'
import UserPaymentsPage from './pages/billing/UserPaymentsPage'
import GetMaintenanceRequestList from './pages/maintenance request management/GetMaintenanceRequestList'
import MaintenanceRequestDetail from './pages/maintenance request management/MaintenanceRequestDetail'
import AddMaintenanceRequest from './pages/maintenance request management/AddMaintenanceRequest'
import GetResidentRequestList from './pages/resident request management/GetResidentRequestList'
import GetResidentRequestDetail from './pages/resident request management/GetResidentRequestDetail'
// import ContractList from './pages/Contracts/ContractList'
// import ContractDetail from './pages/Contracts/ContractDetail'
import MyContract from './pages/MyApartment/MyContract'
import { useContext } from 'react'
import { AppContext } from './contexts/app.context'
import UserInvoiceDetailPage from './pages/billing/UserInvoiceDetailPage'
import UserPaymentDetailPage from './pages/billing/UserPaymentDetailPage'
import UserPaymentSuccessPage from './pages/billing/UserPaymentSuccessPage'
import InvoicesPage from './pages/billing/InvoicesPage'
import InvoiceDetailAdminPage from './pages/billing/InvoiceDetailAdminPage'
import PaymentsPage from './pages/billing/PaymentsPage'
import PaymentDetailAdminPage from './pages/billing/PaymentDetailAdminPage'
import ContractList from './pages/Contracts/ContractList'
import ContractDetail from './pages/Contracts/ContractDetail'
import UtilityMetersPage from './pages/utility/UtilityMetersPage'
import MeterReadingsPage from './pages/utility/MeterReadingsPage'
import UtilityPricingPage from './pages/utility/UtilityPricingPage'
import StatisticsReportShell from './pages/statistics/StatisticsReportShell'
import DashboaedLayoutAdminOrManager from './layout/DashboaedLayoutAdminOrManager'
import StatisticsReportPage from './pages/statistics/StatisticsReportPage'

export default function useRouteElements() {
  const { user } = useContext(AppContext)
  const renderLayout = () => {
    switch (user?.roles?.[0]) {
      case ROLES.ADMIN:
        return (
          <DashboaedLayoutAdmin>
            <GetResidentRequestList />
          </DashboaedLayoutAdmin>
        )
      case ROLES.MANAGER:
        return (
          <DashboaedLayoutManager>
            <GetResidentRequestList />
          </DashboaedLayoutManager>
        )
      default:
        return (
          <DashboaedLayoutStaff>
            <GetResidentRequestList />
          </DashboaedLayoutStaff>
        )
    }
  }
  const routeElements = useRoutes([
    // PUBLIC
    { path: '/login', element: <Login /> },
    { path: '/', element: <RoleRedirect /> },

    // HOME BY ROLE
    {
      path: '/resident',
      element: (
        <ProtectedRoute allowedRoles={[ROLES.RESIDENT]}>
          <DashboardLayoutUser>
            <HomePage />
          </DashboardLayoutUser>
        </ProtectedRoute>
      )
    },
    {
      path: '/security',
      element: (
        <ProtectedRoute allowedRoles={[ROLES.SECURITY]}>
          <DashboardLayoutProtect>
            <HomePageSecurity />
          </DashboardLayoutProtect>
        </ProtectedRoute>
      )
    },
    {
      path: '/admin',
      element: (
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <DashboaedLayoutAdmin>
            <HomePageAdmin />
          </DashboaedLayoutAdmin>
        </ProtectedRoute>
      )
    },
    {
      path: '/manager',
      element: (
        <ProtectedRoute allowedRoles={[ROLES.MANAGER]}>
          <DashboaedLayoutManager>
            <HomePageManager />
          </DashboaedLayoutManager>
        </ProtectedRoute>
      )
    },
    {
      path: '/staff',
      element: (
        <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
          <DashboaedLayoutStaff>
            <HomePageStaff />
          </DashboaedLayoutStaff>
        </ProtectedRoute>
      )
    },

    // PROFILE
    {
      path: '/profile',
      element: <ProtectedRoute />,
      children: [
        {
          index: true,
          element:
            user?.roles?.[0] === ROLES.ADMIN ? (
              <DashboaedLayoutAdmin>
                <Profile />
              </DashboaedLayoutAdmin>
            ) : user?.roles?.[0] === ROLES.RESIDENT ? (
              <DashboardLayoutUser>
                <Profile />
              </DashboardLayoutUser>
            ) : user?.roles?.[0] === ROLES.SECURITY ? (
              <DashboardLayoutProtect>
                <Profile />
              </DashboardLayoutProtect>
            ) : (
              <DashboaedLayoutStaff>
                <Profile />
              </DashboaedLayoutStaff>
            )
        }
      ]
    },

    // BUILDINGS (staff + admin/manager có thể vào list theo layout bảo vệ)
    {
      path: '/buildings',
      element: <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.MANAGER, ROLES.ADMIN]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutProtect>
              <Buildings />
            </DashboardLayoutProtect>
          )
        },
        {
          path: ':id',
          element: (
            <DashboardLayoutProtect>
              <BuildingDetailManagement />
            </DashboardLayoutProtect>
          )
        }
      ]
    },

    // BÁO CÁO THỐNG KÊ (/api/statistics/dashboard)
    {
      path: '/statistics',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: <StatisticsReportShell />
        }
      ]
    },

    // EMPLOYEES
    {
      path: '/employees',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutManager>
              <EmployeeManagement />
            </DashboaedLayoutManager>
          )
        }
      ]
    },

    // QR USER
    {
      path: '/resident/qrcode',
      element: <ProtectedRoute allowedRoles={[ROLES.RESIDENT, ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutUser>
              <QrcodeManagement />
            </DashboardLayoutUser>
          )
        }
      ]
    },
    {
      path: '/qrcodeDetail/:qrCode',
      element: <ProtectedRoute allowedRoles={[ROLES.RESIDENT, ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutUser>
              <ViewQRcodeDetails />
            </DashboardLayoutUser>
          )
        }
      ]
    },
    {
      path: '/viewQrcodeMe',
      element: <ProtectedRoute allowedRoles={[ROLES.RESIDENT]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutUser>
              <ViewQrcodeMe />
            </DashboardLayoutUser>
          )
        }
      ]
    },
    {
      path: '/guest-qr/:id',
      element: <ProtectedRoute allowedRoles={[ROLES.RESIDENT]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutUser>
              <GuestQRDetail />
            </DashboardLayoutUser>
          )
        }
      ]
    },

    {
      path: '/scanqr',
      element: <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.ADMIN, ROLES.SECURITY]} />,
      children: [
        {
          index: true,
          element:
            user?.roles?.[0] === ROLES.ADMIN ? (
              <DashboaedLayoutAdmin>
                <ScanQr />
              </DashboaedLayoutAdmin>
            ) : (
              <DashboardLayoutProtect>
                <ScanQr />
              </DashboardLayoutProtect>
            )
        }
      ]
    },
    {
      path: '/result/:qrcode',
      element: (
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.SECURITY]}>
          <DashboardLayoutProtect>
            <ResultQrcode />
          </DashboardLayoutProtect>
        </ProtectedRoute>
      )
    },

    // SECURITY
    {
      path: '/SecurityResident/',
      element: <ProtectedRoute allowedRoles={[ROLES.SECURITY, ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element:
            user?.roles?.[0] === ROLES.SECURITY ? (
              <DashboardLayoutProtect>
                <SecurityResident />
              </DashboardLayoutProtect>
            ) : (
              <DashboaedLayoutAdmin>
                <SecurityResident />
              </DashboaedLayoutAdmin>
            )
        },
        {
          path: ':id',
          element: (
            <DashboardLayoutProtect>
              <ResidentDetailPage />
            </DashboardLayoutProtect>
          )
        }
      ]
    },

    // NOTIFICATIONS
    {
      path: '/notifications',
      element: <ProtectedRoute allowedRoles={[ROLES.RESIDENT]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutUser>
              <ResidentNotifications />
            </DashboardLayoutUser>
          )
        }
      ]
    },
    {
      path: '/admin/notifications',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutProtect>
              <AdminNotifications />
            </DashboardLayoutProtect>
          )
        }
      ]
    },

    // CHAT
    {
      path: '/chat',
      element: (
        <DashboardLayoutUser>
          <ChatPage />
        </DashboardLayoutUser>
      )
    },

    // ADMIN QR
    {
      path: '/admin/qrcodeAdmin',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdmin>
              <QrcodeManagementAdmin />
            </DashboaedLayoutAdmin>
          )
        }
      ]
    },
    {
      path: '/ContractList',
      element: <ProtectedRoute />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdmin>
              <ContractList />
            </DashboaedLayoutAdmin>
          )
        }
      ]
    },
    {
      path: '/ContractList/:id',
      element: <ProtectedRoute />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdmin>
              <ContractDetail />
            </DashboaedLayoutAdmin>
          )
        }
      ]
    },
    {
      path: '/abc',
      element: <ProtectedRoute />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdmin>
              <MyContract />
            </DashboaedLayoutAdmin>
          )
        }
      ]
    },
    {
      path: '/historyQrcodeAdmin',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdmin>
              <ViewAllHistoryQrcode />
            </DashboaedLayoutAdmin>
          )
        }
      ]
    },
    {
      path: '/admin/viewDetailResident/:id',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdmin>
              <ViewDetailResident />
            </DashboaedLayoutAdmin>
          )
        }
      ]
    },

    // RESIDENT MANAGEMENT
    {
      path: '/residents',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdmin>
              <Getresidentlist />
            </DashboaedLayoutAdmin>
          )
        },
        {
          path: 'add',
          element: (
            <DashboaedLayoutAdmin>
              <Addresident />
            </DashboaedLayoutAdmin>
          )
        },
        {
          path: ':id',
          element: (
            <DashboaedLayoutAdmin>
              <ResidentDetail />
            </DashboaedLayoutAdmin>
          )
        }
      ]
    },

    // HISTORY QR
    {
      path: '/history/qrcode',
      element: <ProtectedRoute allowedRoles={[ROLES.SECURITY, ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutProtect>
              <HistoryQrcode />
            </DashboardLayoutProtect>
          )
        }
      ]
    },
    {
      path: '/UserInvoicesPage',
      element: (
        <ProtectedRoute allowedRoles={[ROLES.RESIDENT]}>
          <Navigate to='/invoices' replace />
        </ProtectedRoute>
      )
    },
    {
      path: '/UserPaymentsPage',
      element: (
        <ProtectedRoute allowedRoles={[ROLES.RESIDENT]}>
          <Navigate to='/payments' replace />
        </ProtectedRoute>
      )
    },
    {
      path: '/invoices',
      element: <ProtectedRoute allowedRoles={[ROLES.RESIDENT]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutUser>
              <UserInvoicesPage />
            </DashboardLayoutUser>
          )
        },
        {
          path: ':id',
          element: (
            <DashboardLayoutUser>
              <UserInvoiceDetailPage />
            </DashboardLayoutUser>
          )
        }
      ]
    },
    {
      path: '/payments',
      element: <ProtectedRoute allowedRoles={[ROLES.RESIDENT]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutUser>
              <UserPaymentsPage />
            </DashboardLayoutUser>
          )
        },
        {
          path: ':id/success',
          element: (
            <DashboardLayoutUser>
              <UserPaymentSuccessPage />
            </DashboardLayoutUser>
          )
        },
        {
          path: ':id',
          element: (
            <DashboardLayoutUser>
              <UserPaymentDetailPage />
            </DashboardLayoutUser>
          )
        }
      ]
    },
    {
      path: '/Getresidentlist',
      element: (
        <DashboaedLayoutAdmin>
          <Getresidentlist />
        </DashboaedLayoutAdmin>
      )
    },

    {
      path: '/ResidentDetail/:id',
      element: (
        <DashboaedLayoutAdmin>
          <ResidentDetail />
        </DashboaedLayoutAdmin>
      )
    },

    {
      path: '/resident/GetMaintenanceRequestList',
      element: <ProtectedRoute allowedRoles={[ROLES.RESIDENT]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutUser>
              <GetMaintenanceRequestList />
            </DashboardLayoutUser>
          )
        }
      ]
    },

    {
      path: '/resident/MaintenanceRequestDetail/:id',
      element: <ProtectedRoute allowedRoles={[ROLES.RESIDENT]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutUser>
              <MaintenanceRequestDetail />
            </DashboardLayoutUser>
          )
        }
      ]
    },
    // ADMIN + QUẢN LÝ: tòa nhà, billing, đồng hồ / chỉ số / giá
    {
      path: '/admin/buildings',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdminOrManager>
              <Buildings />
            </DashboaedLayoutAdminOrManager>
          )
        },
        {
          path: ':id',
          element: (
            <DashboaedLayoutAdminOrManager>
              <BuildingDetailManagement />
            </DashboaedLayoutAdminOrManager>
          )
        }
      ]
    },
    {
      path: '/admin/contracts',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdminOrManager>
              <ContractList />
            </DashboaedLayoutAdminOrManager>
          )
        },
        {
          path: ':id',
          element: (
            <DashboaedLayoutAdminOrManager>
              <ContractDetail />
            </DashboaedLayoutAdminOrManager>
          )
        }
      ]
    },
    {
      path: '/admin/invoices',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdminOrManager>
              <InvoicesPage />
            </DashboaedLayoutAdminOrManager>
          )
        },
        {
          path: ':id',
          element: (
            <DashboaedLayoutAdminOrManager>
              <InvoiceDetailAdminPage />
            </DashboaedLayoutAdminOrManager>
          )
        }
      ]
    },
    {
      path: '/admin/payments',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdminOrManager>
              <PaymentsPage />
            </DashboaedLayoutAdminOrManager>
          )
        },
        {
          path: ':id',
          element: (
            <DashboaedLayoutAdminOrManager>
              <PaymentDetailAdminPage />
            </DashboaedLayoutAdminOrManager>
          )
        }
      ]
    },
    {
      path: '/admin/utility-meters',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdminOrManager>
              <UtilityMetersPage />
            </DashboaedLayoutAdminOrManager>
          )
        }
      ]
    },
    {
      path: '/admin/meter-readings',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdminOrManager>
              <MeterReadingsPage />
            </DashboaedLayoutAdminOrManager>
          )
        }
      ]
    },
    {
      path: '/admin/utility-pricing',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutAdminOrManager>
              <UtilityPricingPage />
            </DashboaedLayoutAdminOrManager>
          )
        }
      ]
    },
    {
      path: '/StatisticsReportPage',
      element: (
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <DashboaedLayoutAdmin>
            <StatisticsReportPage />
          </DashboaedLayoutAdmin>
        </ProtectedRoute>
      )
    },

    {
      path: '/resident/AddMaintenanceRequest',
      element: <ProtectedRoute allowedRoles={[ROLES.RESIDENT]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutUser>
              <AddMaintenanceRequest />
            </DashboardLayoutUser>
          )
        }
      ]
    },

    {
      path: '/GetResidentRequestList',
      element: <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: renderLayout()
        }
      ]
    },

    {
      path: '/GetResidentRequestDetail/:id',
      element: <ProtectedRoute allowedRoles={[ROLES.STAFF]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutStaff>
              <GetResidentRequestDetail />
            </DashboaedLayoutStaff>
          )
        }
      ]
    },
    // 404
    { path: '*', element: <Navigate to='/' replace /> }
  ])

  return routeElements
}
