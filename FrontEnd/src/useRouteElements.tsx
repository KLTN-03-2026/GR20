// import { Navigate, Outlet, useRoutes } from 'react-router-dom'
// import { AppContext } from './contexts/app.context'
// import { useContext } from 'react'

// import Buildings from './pages/building management/Buildings'
// import Profile from './pages/profile_Management/Profile'
// import ScanQr from './pages/QRCODE_USER/Scanqr'
// import Login from './pages/Login'
// import HomePage from './pages/HomePage'

// import DashboardLayoutUser from './layout/DashboardLayoutUser'
// import DashboardLayoutProtect from './layout/DashboardLayoutProtect'
// import ResidentNotifications from './pages/notifications/ResidentNotifications'
// import AdminNotifications from './pages/notifications/AdminNotifications'
// import EmployeeManagement from './pages/employees/EmployeeManagement'
// import Getresidentlist from './pages/residentmanagement/Getresidentlist'
// import Addresident from './pages/residentmanagement/Addresident'
// import ResidentDetail from './pages/residentmanagement/Residentdetail'

// // QR code
// import QrcodeManagement from './pages/QRCODE_USER/QrcodeManagement'
// import ViewQRcodeDetails from './pages/QRCODE_USER/ViewQRcodeDetails'
// import ResultQrcode from './pages/QRCODE_USER/ResultQrcode'
// import HomePageProtect from './pages/protect/HomePage/HomePage'
// import HistoryQrcode from './pages/QRCODE_USER/HistoryQrcode'
// import ViewQrcodeMe from './pages/QRCODE_USER/ViewQrcodeMe'
// import QrcodeManagementAdmin from './pages/QrcodeAdmin/QrcodeManagementAdmin'
// import ViewAllHistoryQrcode from './pages/QrcodeAdmin/ViewAllHistoryQrcode'
// import DashboaedLayoutStaff from './layout/DashboaedLayoutStaff'
// import DashboaedLayoutAdmin from './layout/DashboaedLayoutAdmin'
// import SecurityResident from './pages/security_CuDan/SecurityResident'
// import ResidentDetailPage from './pages/security_CuDan/ResidentDetailModal'
// import ViewDetailResident from './pages/QrcodeAdmin/ViewDetailResident'

// // kiểm tra login
// function ProtectedAdminRoute({ children }: { children?: React.ReactNode }) {
//   const { isAuthenticated, user } = useContext(AppContext)
//   const hasPermission = user?.roles?.includes('ADMIN') || user?.roles?.includes('Quản lý')

//   if (!isAuthenticated) return <Navigate to='/login' />
//   if (!hasPermission) return <Navigate to='/' />

//   return children || <Outlet />
// }

// function ProtecdRouter() {
//   const { isAuthenticated } = useContext(AppContext)
//   return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
// }

// function RejectedRouter() {
//   const { isAuthenticated } = useContext(AppContext)
//   return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
// }

// export default function useRouteElements() {
//   const routeElements = useRoutes([
//     {
//       path: '/',
//       element: (
//         <DashboardLayoutUser>
//           <HomePage />
//         </DashboardLayoutUser>
//       )
//     },
//     {
//       path: '/buildings',
//       element: (
//         <DashboaedLayoutStaff>
//           <Buildings />
//         </DashboaedLayoutStaff>
//       )
//     },
//     {
//       path: '/profile',
//       element: (
//         <DashboardLayoutUser>
//           <Profile />
//         </DashboardLayoutUser>
//       )
//     },
//     {
//       path: '/login',
//       element: <Login />
//     },
//     {
//       path: '/employees',
//       element: (
//         <ProtectedAdminRoute>
//           <DashboardLayoutProtect>
//             <EmployeeManagement />
//           </DashboardLayoutProtect>
//         </ProtectedAdminRoute>
//       )
//     },

//     // ===== QR CODE =====
//     {
//       path: '/qrcode',
//       element: (
//         <DashboardLayoutUser>
//           <QrcodeManagement />
//         </DashboardLayoutUser>
//       )
//     },
//     {
//       path: 'viewQrcodeMe',
//       element: (
//         <DashboardLayoutUser>
//           <ViewQrcodeMe />
//         </DashboardLayoutUser>
//       )
//     },
//     {
//       path: '/qrcodeDetail/:id',
//       element: (
//         <DashboardLayoutProtect>
//           <ViewQRcodeDetails />
//         </DashboardLayoutProtect>
//       )
//     },
//     {
//       path: '/result/:qrCode',
//       element: (
//         <DashboardLayoutProtect>
//           <ResultQrcode />
//         </DashboardLayoutProtect>
//       )
//     },
//     {
//       path: '/scanqr',
//       element: (
//         <DashboardLayoutProtect>
//           <ScanQr />
//         </DashboardLayoutProtect>
//       )
//     },
//     {
//       path: '/homepageprotect',
//       element: (
//         <DashboardLayoutProtect>
//           <HomePageProtect />
//         </DashboardLayoutProtect>
//       )
//     },
//     {
//       path: '/history/qrcode',
//       element: (
//         <DashboardLayoutProtect>
//           <HistoryQrcode />
//         </DashboardLayoutProtect>
//       )
//     },
//     {
//       path: '/residents',
//       element: <Getresidentlist />
//     },
//     {
//       path: '/residents/add',
//       element: <Addresident />
//     },
//     {
//       path: '/residents/:id',
//       element: <ResidentDetail />
//     },
//     {
//       path: 'qrcodeAdmin',
//       element: (
//         <DashboaedLayoutAdmin>
//           <QrcodeManagementAdmin />
//         </DashboaedLayoutAdmin>
//       )
//     },
//     {
//       path: 'historyQrcodeAdmin',
//       element: (
//         <DashboaedLayoutAdmin>
//           <ViewAllHistoryQrcode />
//         </DashboaedLayoutAdmin>
//       )
//     },
//     {
//       path: 'security/residents',
//       element: (
//         <DashboardLayoutProtect>
//           <SecurityResident />
//         </DashboardLayoutProtect>
//       )
//     },
//     {
//       path: '/security/residents/:id',
//       element: (
//         <DashboardLayoutProtect>
//           <ResidentDetailPage />
//         </DashboardLayoutProtect>
//       )
//     },
//     {
//       path: '/notifications',
//       element: (
//         <DashboardLayoutUser>
//           <ResidentNotifications />
//         </DashboardLayoutUser>
//       )
//     },
//     {
//       path: '/admin/notifications',
//       element: (
//         <ProtectedAdminRoute>
//           <DashboardLayoutProtect>
//             <AdminNotifications />
//           </DashboardLayoutProtect>
//         </ProtectedAdminRoute>
//       )
//     },
//     {
//       path: '/admin/viewDetailResident/:id',
//       element: (
//         <ProtectedAdminRoute>
//           <DashboardLayoutProtect>
//             <ViewDetailResident />
//           </DashboardLayoutProtect>
//         </ProtectedAdminRoute>
//       )
//     }
//   ])

//   return routeElements
// }

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

// QR code
import QrcodeManagement from './pages/QRCODE_USER/QrcodeManagement'
import ViewQRcodeDetails from './pages/QRCODE_USER/ViewQRcodeDetails'
import ResultQrcode from './pages/QRCODE_USER/ResultQrcode'
// import HomePageProtect from './pages/protect/HomePage/HomePage'
import HistoryQrcode from './pages/QRCODE_USER/HistoryQrcode'
import ViewQrcodeMe from './pages/QRCODE_USER/ViewQrcodeMe'
import QrcodeManagementAdmin from './pages/QrcodeAdmin/QrcodeManagementAdmin'
import ViewAllHistoryQrcode from './pages/QrcodeAdmin/ViewAllHistoryQrcode'
import DashboaedLayoutStaff from './layout/DashboaedLayoutStaff'
import DashboaedLayoutAdmin from './layout/DashboaedLayoutAdmin'
import SecurityResident from './pages/security_CuDan/SecurityResident'
import ResidentDetailPage from './pages/security_CuDan/ResidentDetailModal'
import ViewDetailResident from './pages/QrcodeAdmin/ViewDetailResident'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute'
import RoleRedirect from './components/RoleRedirect/RoleRedirect'
import HomePageSecurity from './pages/HomePageScurity/HomePageScurity'
import HomePageAdmin from './pages/HomePageAdmin/HomePageAdmin'

import HomePageStaff from './pages/HomePageStaff/HomePageStaff'
import HomePageManager from './pages/HomePageManager/HomePageManager'
import DashboaedLayoutManager from './layout/DashboaedLayoutManager'

// Component chặn truy cập dựa trên role
// function RoleBasedRedirect() {
//   const { isAuthenticated, userRole } = useAuth()
//   const location = useLocation()

//   useEffect(() => {
//     // Nếu đã login nhưng vào route không được phép
//     if (isAuthenticated && userRole && !isRouteAllowed(location.pathname, userRole)) {
//       // Redirect về trang chủ của role đó
//       const defaultRoutes: Record<string, string> = {
//         [ROLES.ADMIN]: '/',
//         [ROLES.MANAGER]: '/',
//         [ROLES.STAFF]: '/',
//         [ROLES.SECURITY]: '/',
//         [ROLES.RESIDENT]: '/'
//       }
//       window.location.href = defaultRoutes[userRole] || '/'
//     }
//   }, [location.pathname, isAuthenticated, userRole])

//   return null
// }

export default function useRouteElements() {
  const routeElements = useRoutes([
    // Public routes
    { path: '/login', element: <Login /> },
    {
      path: '/',
      element: <RoleRedirect />
    },

    //HOMEPAGE
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
    // Profile - tất cả role đều xem được
    {
      path: '/profile',
      element: <ProtectedRoute />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutUser>
              <Profile />
            </DashboardLayoutUser>
          )
        }
      ]
    },
    // Buildings - chỉ Staff (Nhân viên vận hành)
    {
      path: '/buildings',
      element: <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.MANAGER, ROLES.ADMIN]} />,
      children: [
        {
          index: true,
          element: (
            <DashboaedLayoutStaff>
              <Buildings />
            </DashboaedLayoutStaff>
          )
        }
      ]
    },

    // Employees Management - chỉ Admin và Manager
    {
      path: '/employees',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutProtect>
              <EmployeeManagement />
            </DashboardLayoutProtect>
          )
        }
      ]
    },

    // QR Code - Resident được dùng
    {
      path: '/qrcode',
      element: <ProtectedRoute allowedRoles={[ROLES.RESIDENT, ROLES.MANAGER, ROLES.ADMIN]} />,
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
      path: '/qrcodeDetail/:id',
      element: <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.ADMIN, ROLES.RESIDENT]} />,
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

    // Scan QR - Security, Manager, Admin
    {
      path: '/scanqr',
      element: <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.ADMIN, ROLES.SECURITY]} />,
      children: [
        {
          index: true,
          element: (
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
    {
      path: '/security/residents',
      element: <ProtectedRoute allowedRoles={[ROLES.SECURITY, ROLES.MANAGER, ROLES.ADMIN]} />,
      children: [
        {
          index: true,
          element: (
            <DashboardLayoutProtect>
              <SecurityResident />
            </DashboardLayoutProtect>
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

    // Notifications - Resident
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

    // Admin Notifications - chỉ Admin và Manager
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

    // QR Admin - chỉ Admin và Manager
    {
      path: '/qrcodeAdmin',
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
    }, //historyQrcodeAdmin
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
    // Resident Management - chỉ Admin và Manager
    {
      path: '/residents',
      element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />,
      children: [
        {
          index: true,
          element: <Getresidentlist />
        },
        {
          path: 'add',
          element: <Addresident />
        },
        {
          path: ':id',
          element: <ResidentDetail />
        }
      ]
    },

    // Các route còn lại tương tự... (bạn có thể thêm tiếp)
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
      path: '/history/qrcode',
      element: <ProtectedRoute allowedRoles={[ROLES.SECURITY, ROLES.MANAGER, ROLES.ADMIN]} />,
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

    // 404 - Not Found
    { path: '*', element: <Navigate to='/' replace /> }
  ])

  return routeElements
}
