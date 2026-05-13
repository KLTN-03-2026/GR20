import { Navigate, useRoutes } from 'react-router-dom'
import { ROLES } from 'src/constants/roles'
import Buildings from './pages/building management/Buildings'
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
import ContractList from './pages/Contracts/ContractList'
import ContractDetail from './pages/Contracts/ContractDetail'
import MyContract from './pages/MyApartment/MyContract'
import { useContext } from 'react'
import { AppContext } from './contexts/app.context'

export default function useRouteElements() {
  const { user } = useContext(AppContext)
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

    // BUILDINGS
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
        { index: true, element: <Getresidentlist /> },
        { path: 'add', element: <Addresident /> },
        { path: ':id', element: <ResidentDetail /> }
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
      element: <ProtectedRoute allowedRoles={[ROLES.RESIDENT]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutUser>
              <UserInvoicesPage />
            </DashboardLayoutUser>
          )
        }
      ]
    },
    {
      path: '/UserPaymentsPage',
      element: <ProtectedRoute allowedRoles={[ROLES.RESIDENT]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutUser>
              <UserPaymentsPage />
            </DashboardLayoutUser>
          )
        }
      ]
    },

    // 404
    { path: '*', element: <Navigate to='/' replace /> }
  ])

  return routeElements
}
