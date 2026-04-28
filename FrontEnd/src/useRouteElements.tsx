import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import { AppContext } from './contexts/app.context'
import { useContext } from 'react'
import Buildings from './pages/building management/Buildings'
import EmployeeManagement from './pages/employees/EmployeeManagement'
import Apartment from './pages/Apartments/Apartment'
import ApartmentDetail from './pages/Apartments/ApartmentDetail'
import Analytics from './pages/Analytics/Analytics';
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
      element: <Navigate to='/buildings' replace />
    },
    {
      path: '/buildings',
      element: <Buildings />
    },
    {
      path: '/api/buildings',
      element: <Navigate to='/buildings' replace />
    },
    {
      path: '/employees',
      element: <EmployeeManagement />
    },
    {
      path: '/apartments',
      element: <Apartment />
    },
    {
      path: '/apartments/:id',
      element: <ApartmentDetail />
    },
    {
      path: '/analytics',
      element: <Analytics />
    }
  ])
  return routeElements
}
