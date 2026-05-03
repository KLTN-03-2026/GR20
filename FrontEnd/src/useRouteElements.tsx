import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import { AppContext } from './contexts/app.context'
import { useContext } from 'react'
import Buildings from './pages/building management/Buildings'
import EmployeeManagement from './pages/employees/EmployeeManagement'
import Apartment from './pages/Apartments/Apartment'
import ApartmentDetail from './pages/Apartments/ApartmentDetail'
import Analytics from './pages/Analytics/Analytics';
import ContractList from './pages/Contracts/ContractList';
import ContractDetail from './pages/Contracts/ContractDetail';
import MyApartment from './pages/MyApartment/MyApartment';
import MyContract from './pages/MyApartment/MyContract';
import AmenityList from './pages/Amenities/AmenityList';
import AmenityDetail from './pages/Amenities/AmenityDetail';
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
    },
    {
      path: '/contracts',
      element: <ContractList />
    },
    {
      path: '/contracts/:id',
      element: <ContractDetail />
    },
    {
      path: '/my-apartment', 
      element: <MyApartment /> 
    },
    { 
      path: '/my-contract', 
      element: <MyContract /> 
    },
    { 
      path: '/amenities', 
      element: <AmenityList /> 
    },
    { 
      path: '/amenities/:id',
      element: <AmenityDetail /> 
    },
    { 
      path: '/my-amenities', 
      element: <AmenityList isResident={true} /> 
    }
  ])
  return routeElements
}
