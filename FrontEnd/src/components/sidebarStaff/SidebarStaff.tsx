// import { NavLink } from 'react-router-dom'

// export default function SidebarStaff() {
//   // Hàm xử lý className active
//   const getNavClass = ({ isActive }) =>
//     isActive
//       ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
//       : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'

//   return (
//     <aside className='hidden lg:flex flex-col p-6 space-y-8 h-screen w-64 fixed left-0 top-0 bg-surface-container-low shadow-sm z-50'>
//       {/* Logo / Header */}
//       <div className='flex flex-col space-y-2'>
//         <div className='flex items-center space-x-3 mb-6'>
//           <div className='w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white'>
//             <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
//               badge
//             </span>
//           </div>
//           <div>
//             <h1 className='text-xl font-extrabold text-blue-900 tracking-tight'>HomeLink AI</h1>
//             <p className='text-[10px] font-medium text-teal-700 uppercase tracking-widest'>Staff Portal</p>
//           </div>
//         </div>

//         {/* Menu chính */}
//         <nav className='flex-1 space-y-1'>
//           <NavLink to='/' className={getNavClass} end>
//             <span className='material-symbols-outlined'>dashboard</span>
//             <span className='text-sm font-manrope'>Tổng quan</span>
//           </NavLink>

//           <NavLink to='/requests' className={getNavClass}>
//             <span className='material-symbols-outlined'>assignment</span>
//             <span className='text-sm font-manrope'>Danh sách yêu cầu</span>
//           </NavLink>

//           <NavLink to='/requests/pending' className={getNavClass}>
//             <span className='material-symbols-outlined'>pending_actions</span>
//             <span className='text-sm font-manrope'>Chờ xử lý</span>
//           </NavLink>

//           <NavLink to='/requests/processing' className={getNavClass}>
//             <span className='material-symbols-outlined'>hourglass_top</span>
//             <span className='text-sm font-manrope'>Đang xử lý</span>
//           </NavLink>

//           <NavLink to='/requests/completed' className={getNavClass}>
//             <span className='material-symbols-outlined'>check_circle</span>
//             <span className='text-sm font-manrope'>Đã hoàn thành</span>
//           </NavLink>
//         </nav>
//       </div>

//       {/* Menu cuối - Cài đặt & Đăng xuất */}
//       <div className='mt-auto space-y-1 pt-[120px] border-t border-gray-200'>
//         <NavLink
//           to='/settings'
//           className={({ isActive }) =>
//             `flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:text-blue-900 transition-colors hover:bg-secondary-container/20 ${
//               isActive ? 'text-blue-900 bg-secondary-container/20' : ''
//             }`
//           }
//         >
//           <span className='material-symbols-outlined'>settings</span>
//           <span className='text-sm'>Cài đặt</span>
//         </NavLink>

//         <NavLink
//           to='/support'
//           className={({ isActive }) =>
//             `flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:text-blue-900 transition-colors hover:bg-secondary-container/20 ${
//               isActive ? 'text-blue-900 bg-secondary-container/20' : ''
//             }`
//           }
//         >
//           <span className='material-symbols-outlined'>help</span>
//           <span className='text-sm'>Hỗ trợ</span>
//         </NavLink>

//         <button
//           onClick={() => {
//             /* xử lý đăng xuất */
//           }}
//           className='w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors'
//         >
//           <span className='material-symbols-outlined'>logout</span>
//           <span className='text-sm'>Đăng xuất</span>
//         </button>
//       </div>
//     </aside>
//   )
// }

import { NavLink } from 'react-router-dom'

export default function SidebarStaff() {
  const getNavClass = ({ isActive }) =>
    isActive
      ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-l-4 border-blue-900 bg-surface hover:bg-secondary-container/20 transition-all duration-300'
      : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-secondary-container/20 transition-all duration-300'

  return (
    <aside className='hidden lg:flex flex-col p-6 space-y-8 h-screen w-64 fixed left-0 top-0 bg-surface-container-low shadow-sm z-50'>
      {/* Logo / Header */}
      <div className='flex flex-col space-y-2'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white'>
            <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
              handyman
            </span>
          </div>
          <div>
            <h1 className='text-xl font-extrabold text-blue-900 tracking-tight'>HomeLink AI</h1>
            <p className='text-[10px] font-medium text-teal-700 uppercase tracking-widest'>Ops Center</p>
          </div>
        </div>

        {/* Menu chính */}
        <nav className='flex-1 space-y-1'>
          <NavLink to='/homestaff' className={getNavClass}>
            <span className='material-symbols-outlined'>dashboard</span>
            <span className='text-sm font-manrope'>Tổng quan</span>
          </NavLink>

          <NavLink to='/staff/requests' className={getNavClass}>
            <span className='material-symbols-outlined'>assignment</span>
            <span className='text-sm font-manrope'>Quản lý yêu cầu</span>
          </NavLink>

          <NavLink to='/staff/request-detail' className={getNavClass}>
            <span className='material-symbols-outlined'>description</span>
            <span className='text-sm font-manrope'>Chi tiết yêu cầu</span>
          </NavLink>

          <NavLink to='/staff/residents' className={getNavClass}>
            <span className='material-symbols-outlined'>groups</span>
            <span className='text-sm font-manrope'>Danh sách cư dân</span>
          </NavLink>

          <NavLink to='/staff/community-chat' className={getNavClass}>
            <span className='material-symbols-outlined'>forum</span>
            <span className='text-sm font-manrope'>Chat cộng đồng</span>
          </NavLink>
        </nav>
      </div>

      {/* Menu cuối */}
      <div className='mt-auto space-y-1 pt-[100px] border-t border-gray-200'>
        <NavLink
          to='/staff/profile'
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:text-blue-900 transition-colors hover:bg-secondary-container/20 ${
              isActive ? 'text-blue-900 bg-secondary-container/20' : ''
            }`
          }
        >
          <span className='material-symbols-outlined'>account_circle</span>
          <span className='text-sm'>Thông tin cá nhân</span>
        </NavLink>

        <NavLink
          to='/staff/settings'
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:text-blue-900 transition-colors hover:bg-secondary-container/20 ${
              isActive ? 'text-blue-900 bg-secondary-container/20' : ''
            }`
          }
        >
          <span className='material-symbols-outlined'>settings</span>
          <span className='text-sm'>Cài đặt</span>
        </NavLink>

        <button
          onClick={() => {
            /* xử lý đăng xuất */
          }}
          className='w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors'
        >
          <span className='material-symbols-outlined'>logout</span>
          <span className='text-sm'>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
