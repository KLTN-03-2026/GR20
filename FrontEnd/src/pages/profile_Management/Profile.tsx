// import { useQuery } from '@tanstack/react-query'
// import { UserApi } from 'src/apis/User/user.api'

// export default function Profile() {
//   const { data } = useQuery({
//     queryKey: ['profile'],
//     queryFn: () => {
//       return UserApi.getDetailUser(2)
//     }
//   })

//   const dataProfile = data?.data.data
//   // console.log(dataProfile)
//   const formatDateVN = (isoString: string) => {
//     const date = new Date(isoString)
//     const day = String(date.getDate()).padStart(2, '0')
//     const month = String(date.getMonth() + 1).padStart(2, '0')
//     const year = date.getFullYear()
//     return `${day} tháng ${month}, ${year}`
//   }

//   const ShowRole = (role: number) => {
//     if (role === 1) {
//       return 'ADMIN'
//     }
//     if (role === 2) {
//       return 'Quản Lý'
//     }
//     if (role === 3) {
//       return 'Nhân Viên'
//     }
//     if (role === 4) {
//       return 'Bảo Vệ'
//     }
//     if (role === 5) {
//       return 'Người Dùng'
//     }
//   }

//   if (dataProfile) {
//     return (
//       <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen font-['Manrope',sans-serif]">
//         {/* SideNavBar - Hidden on Mobile */}
//         {/* <aside className='h-screen w-64 fixed left-0 top-0 bg-slate-100 flex flex-col p-4 gap-2 z-40 hidden md:flex'>
//         <div className='mb-8 px-2'>
//           <h1 className='text-lg font-black text-blue-700 tracking-tighter'>Azure Serenity</h1>
//           <p className='text-xs text-slate-500 font-medium'>Quản lý cư dân</p>
//         </div>
//         <nav className='flex-1 space-y-1'>
//           <a
//             className='flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-transform hover:translate-x-1 text-sm font-medium'
//             href='#'
//           >
//             <span className='material-symbols-outlined'>dashboard</span> Tổng quan
//           </a>
//           <a
//             className='flex items-center gap-3 px-3 py-2 text-blue-600 bg-white shadow-sm rounded-lg text-sm font-semibold'
//             href='#'
//           >
//             <span className='material-symbols-outlined'>person</span> Hồ sơ cá nhân
//           </a>
//           <a
//             className='flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-transform hover:translate-x-1 text-sm font-medium'
//             href='#'
//           >
//             <span className='material-symbols-outlined'>apartment</span> Căn hộ của tôi
//           </a>
//           <a
//             className='flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-transform hover:translate-x-1 text-sm font-medium'
//             href='#'
//           >
//             <span className='material-symbols-outlined'>receipt_long</span> Hóa đơn
//           </a>
//           <a
//             className='flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-transform hover:translate-x-1 text-sm font-medium'
//             href='#'
//           >
//             <span className='material-symbols-outlined'>contact_support</span> Hỗ trợ
//           </a>
//         </nav>
//         <div className='mt-auto border-t border-slate-200 pt-4'>
//           <a
//             className='flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-transform hover:translate-x-1 text-sm font-medium'
//             href='#'
//           >
//             <span className='material-symbols-outlined'>logout</span> Đăng xuất
//           </a>
//         </div>
//       </aside> */}

//         {/* Main Content Canvas */}
//         <main className='md:ml-64 min-h-screen'>
//           {/* TopAppBar */}
//           <header className='fixed top-0 right-0 left-0 md:left-64 z-50 h-16 bg-slate-50/70 backdrop-blur-xl flex justify-between items-center px-8 shadow-sm shadow-blue-900/5'>
//             <div className='flex items-center gap-4'>
//               <span className='text-xl font-bold tracking-tighter text-slate-900'>Hồ sơ cư dân</span>
//             </div>
//             <div className='flex items-center gap-6'>
//               <div className='hidden md:flex items-center gap-2 bg-[#f2f4f6] px-4 py-1.5 rounded-full'>
//                 <span className='material-symbols-outlined text-sm text-[#717786]'>search</span>
//                 <input
//                   className='bg-transparent border-none text-sm focus:ring-0 p-0 w-32 outline-none'
//                   placeholder='Tìm kiếm...'
//                   type='text'
//                 />
//               </div>
//               <div className='flex items-center gap-3'>
//                 <button className='p-2 text-slate-500 hover:bg-slate-200/50 rounded-full transition-colors'>
//                   <span className='material-symbols-outlined'>notifications</span>
//                 </button>
//                 <button className='p-2 text-slate-500 hover:bg-slate-200/50 rounded-full transition-colors'>
//                   <span className='material-symbols-outlined'>settings</span>
//                 </button>
//                 <div className='h-8 w-8 rounded-full bg-[#0072e5] overflow-hidden'>
//                   <img alt='Cư dân Profile' className='h-full w-full object-cover' src={dataProfile?.avatarUrl} />
//                 </div>
//               </div>
//             </div>
//           </header>

//           {/* Content Area */}
//           <div className='pt-24 pb-12 px-6 md:px-12 max-w-6xl mx-auto'>
//             {/* Hero Profile Section */}
//             <section className='mb-12 flex flex-col md:flex-row items-center md:items-end gap-8'>
//               <div className='relative group'>
//                 <div className='h-32 w-32 md:h-44 md:w-44 rounded-full p-1.5 bg-gradient-to-tr from-[#005ab7] to-[#bdd6ff] shadow-2xl'>
//                   <img
//                     alt='Avatar'
//                     className='h-full w-full rounded-full object-cover border-4 border-white'
//                     src={dataProfile.avatarUrl}
//                   />
//                 </div>
//                 {/* <button className='absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg border border-slate-100 hover:scale-105 transition-transform'>
//                   <span className='material-symbols-outlined text-[#005ab7] text-xl'>Thay đổi</span>
//                 </button> */}
//               </div>
//               <div className='text-center md:text-left flex-1'>
//                 <div className='flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2'>
//                   <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight text-[#191c1e]'>
//                     {dataProfile.fullName}
//                   </h2>
//                   <span className='px-3 py-1 bg-[#d4e3ff] text-[#2f486a] text-xs font-bold rounded-full tracking-wider uppercase'>
//                     {dataProfile.isActive ? 'Hoạt động' : 'Không Hoạt động'}
//                   </span>
//                 </div>
//                 <p className='text-[#414754] font-medium text-lg flex items-center justify-center md:justify-start gap-2'>
//                   <span className='material-symbols-outlined text-[#005ab7]'>verified</span>
//                   Cư dân Azure Serenity
//                 </p>
//                 <p className='text-sm text-[#717786] mt-1 italic'>Tham gia từ {formatDateVN(dataProfile.createdAt)}</p>
//               </div>
//               <div className='flex gap-4'>
//                 <button className='px-8 py-3 bg-gradient-to-tr from-[#005ab7] to-[#0072e5] text-white rounded-full font-semibold shadow-lg shadow-blue-900/10 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2'>
//                   <span className='material-symbols-outlined text-lg'>edit</span>
//                   Chỉnh sửa hồ sơ
//                 </button>
//               </div>
//             </section>

//             {/* Bento Grid */}
//             <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
//               {/* Thông tin cá nhân */}
//               <div className='md:col-span-2 bg-white p-8 rounded-3xl shadow-sm shadow-blue-900/5 relative overflow-hidden group'>
//                 <div className='absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity'>
//                   <span className='material-symbols-outlined text-8xl'>badge</span>
//                 </div>
//                 <div className='flex items-center gap-3 mb-8'>
//                   <div className='p-2 bg-[#005ab7]/5 rounded-xl'>
//                     <span className='material-symbols-outlined text-[#005ab7]'>person</span>
//                   </div>
//                   <h3 className='text-lg font-bold tracking-tight'>Thông tin cá nhân</h3>
//                 </div>
//                 <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12'>
//                   <div>
//                     <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Họ tên</p>
//                     <p className='text-[#191c1e] font-semibold text-lg'>{dataProfile.fullName}</p>
//                   </div>
//                   <div>
//                     <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Giới tính</p>
//                     <div className='flex items-center gap-2 text-[#191c1e] font-semibold text-lg'>
//                       <span className='material-symbols-outlined text-blue-500'>male</span>
//                       {dataProfile.gender === 'MALE' ? 'Nam' : 'Nữ'}
//                     </div>
//                   </div>
//                   <div>
//                     <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Ngày sinh</p>
//                     <p className='text-[#191c1e] font-semibold text-lg'>{formatDateVN(dataProfile.dateOfBirth)}</p>
//                   </div>
//                   <div>
//                     <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Mã cư dân</p>
//                     <p className='text-[#191c1e] font-semibold text-lg'>{dataProfile.id}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Tài khoản */}
//               <div className='bg-white p-8 rounded-3xl shadow-sm shadow-blue-900/5 relative overflow-hidden'>
//                 <div className='flex items-center gap-3 mb-8'>
//                   <div className='p-2 bg-[#005ab7]/5 rounded-xl'>
//                     <span className='material-symbols-outlined text-[#005ab7]'>shield_person</span>
//                   </div>
//                   <h3 className='text-lg font-bold tracking-tight'>Tài khoản</h3>
//                 </div>
//                 <div className='space-y-8'>
//                   <div>
//                     <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Vai trò</p>
//                     <div className='inline-flex items-center gap-2 px-3 py-1 bg-[#d3e5f1] text-blue-600 rounded-lg font-bold text-sm'>
//                       {/* <span className='material-symbols-outlined text-sm'>home</span> */}
//                       {dataProfile.roles}
//                     </div>
//                   </div>
//                   <div>
//                     <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Bảo mật</p>
//                     <button className='mt-2 w-full py-3 bg-[#f2f4f6] text-[#005ab7] rounded-full font-bold text-sm hover:bg-[#e6e8ea] transition-colors flex items-center justify-center gap-2 border border-[#c1c6d7]/15'>
//                       Đổi mật khẩu
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Thông tin liên lạc */}
//               <div className='md:col-span-3 bg-white p-8 rounded-3xl shadow-sm shadow-blue-900/5 relative overflow-hidden'>
//                 <div className='flex items-center gap-3 mb-8'>
//                   <div className='p-2 bg-[#005ab7]/5 rounded-xl'>
//                     <span className='material-symbols-outlined text-[#005ab7]'>contact_page</span>
//                   </div>
//                   <h3 className='text-lg font-bold tracking-tight'>Thông tin liên lạc</h3>
//                 </div>
//                 <div className='flex flex-col md:flex-row gap-12'>
//                   <div className='flex items-start gap-4 flex-1'>
//                     <div className='h-12 w-12 rounded-full bg-[#d4e3ff] flex items-center justify-center shrink-0'>
//                       <span className='material-symbols-outlined text-[#2f486a]'>mail</span>
//                     </div>
//                     <div>
//                       <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Địa chỉ Email</p>
//                       <p className='text-[#191c1e] font-semibold text-lg'>{dataProfile.email}</p>
//                       <p className='text-xs text-green-600 font-medium mt-1 flex items-center gap-1'>
//                         <span className='material-symbols-outlined text-xs'>check_circle</span>
//                         Đã xác minh
//                       </p>
//                     </div>
//                   </div>
//                   <div className='flex items-start gap-4 flex-1'>
//                     <div className='h-12 w-12 rounded-full bg-[#d4e3ff] flex items-center justify-center shrink-0'>
//                       <span className='material-symbols-outlined text-[#2f486a]'>call</span>
//                     </div>
//                     <div>
//                       <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Số điện thoại</p>
//                       <p className='text-[#191c1e] font-semibold text-lg'>{dataProfile.phone}</p>
//                       <p className='text-xs text-[#717786] font-medium mt-1'>Liên hệ chính</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* AI Insight Card */}
//               <div className='md:col-span-3 bg-white/60 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-lg shadow-blue-900/5 relative group overflow-hidden'>
//                 <div className='absolute inset-0 bg-gradient-to-r from-[#005ab7]/5 to-transparent pointer-events-none' />
//                 <div className='flex items-center gap-3 mb-6'>
//                   <span className='material-symbols-outlined text-[#005ab7]'>auto_awesome</span>
//                   <h3 className='text-sm font-bold tracking-widest uppercase text-[#2f486a]'>
//                     Azure Intelligence Insight
//                   </h3>
//                 </div>
//                 <div className='flex flex-col md:flex-row items-center gap-6'>
//                   <p className='text-[#414754] font-medium flex-1'>
//                     Hồ sơ của bạn đã hoàn thành <span className='text-[#005ab7] font-bold'>95%</span>. Cập nhật thêm
//                     thông tin căn hộ để nhận được các ưu đãi dành riêng cho cư dân Diamond.
//                   </p>
//                   <button className='px-6 py-2.5 bg-[#d4e3ff] text-[#2f486a] rounded-full text-sm font-bold hover:brightness-105 transition-all'>
//                     Xem ưu đãi
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>

//         {/* BottomNavBar - Mobile Only */}
//         <nav className='md:hidden fixed bottom-0 left-0 right-0 bg-slate-50/70 backdrop-blur-xl h-16 flex justify-around items-center px-4 z-50'>
//           <button className='flex flex-col items-center gap-1 text-slate-500'>
//             <span className='material-symbols-outlined'>dashboard</span>
//             <span className='text-[10px] font-medium'>Tổng quan</span>
//           </button>
//           <button className='flex flex-col items-center gap-1 text-blue-600'>
//             <span className='material-symbols-outlined'>person</span>
//             <span className='text-[10px] font-bold'>Hồ sơ</span>
//           </button>
//           <button className='flex flex-col items-center gap-1 text-slate-500'>
//             <span className='material-symbols-outlined'>apartment</span>
//             <span className='text-[10px] font-medium'>Căn hộ</span>
//           </button>
//           <button className='flex flex-col items-center gap-1 text-slate-500'>
//             <span className='material-symbols-outlined'>receipt_long</span>
//             <span className='text-[10px] font-medium'>Hóa đơn</span>
//           </button>
//           <button className='flex flex-col items-center gap-1 text-slate-500'>
//             <span className='material-symbols-outlined'>more_horiz</span>
//             <span className='text-[10px] font-medium'>Thêm</span>
//           </button>
//         </nav>
//       </div>
//     )
//   }
// }

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UserApi } from 'src/apis/User/user.api'

export default function Profile() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: () => {
      return UserApi.getDetailUser(2)
    }
  })

  const dataProfile = data?.data.data

  const formatDateVN = (isoString: string) => {
    const date = new Date(isoString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day} tháng ${month}, ${year}`
  }

  const formatDateForInput = (isoString: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toISOString().split('T')[0]
  }

  if (!dataProfile) {
    return (
      <div className='bg-[#f7f9fb] min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-slate-600'>Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen font-['Manrope',sans-serif]">
      {/* Main Content Canvas */}
      <main className='md:ml-64 min-h-screen'>
        {/* TopAppBar */}
        <header className='fixed top-0 right-0 left-0 md:left-64 z-50 h-16 bg-slate-50/70 backdrop-blur-xl flex justify-between items-center px-8 shadow-sm shadow-blue-900/5'>
          <div className='flex items-center gap-4'>
            <span className='text-xl font-bold tracking-tighter text-slate-900'>Hồ sơ cư dân</span>
          </div>
          <div className='flex items-center gap-6'>
            <div className='hidden md:flex items-center gap-2 bg-[#f2f4f6] px-4 py-1.5 rounded-full'>
              <span className='material-symbols-outlined text-sm text-[#717786]'>search</span>
              <input
                className='bg-transparent border-none text-sm focus:ring-0 p-0 w-32 outline-none'
                placeholder='Tìm kiếm...'
                type='text'
              />
            </div>
            <div className='flex items-center gap-3'>
              <button className='p-2 text-slate-500 hover:bg-slate-200/50 rounded-full transition-colors'>
                <span className='material-symbols-outlined'>notifications</span>
              </button>
              <button className='p-2 text-slate-500 hover:bg-slate-200/50 rounded-full transition-colors'>
                <span className='material-symbols-outlined'>settings</span>
              </button>
              <div className='h-8 w-8 rounded-full bg-[#0072e5] overflow-hidden'>
                <img alt='Cư dân Profile' className='h-full w-full object-cover' src={dataProfile?.avatarUrl} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className='pt-24 pb-12 px-6 md:px-12 max-w-6xl mx-auto'>
          {/* Hero Profile Section */}
          <section className='mb-12 flex flex-col md:flex-row items-center md:items-end gap-8'>
            <div className='relative group'>
              <div className='h-32 w-32 md:h-44 md:w-44 rounded-full p-1.5 bg-gradient-to-tr from-[#005ab7] to-[#bdd6ff] shadow-2xl'>
                <img
                  alt='Avatar'
                  className='h-full w-full rounded-full object-cover border-4 border-white'
                  src={dataProfile.avatarUrl}
                />
              </div>
            </div>
            <div className='text-center md:text-left flex-1'>
              <div className='flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2'>
                <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight text-[#191c1e]'>
                  {dataProfile.fullName}
                </h2>
                <span className='px-3 py-1 bg-[#d4e3ff] text-[#2f486a] text-xs font-bold rounded-full tracking-wider uppercase'>
                  {dataProfile.isActive ? 'Hoạt động' : 'Không Hoạt động'}
                </span>
              </div>
              <p className='text-[#414754] font-medium text-lg flex items-center justify-center md:justify-start gap-2'>
                <span className='material-symbols-outlined text-[#005ab7]'>verified</span>
                Cư dân Azure Serenity
              </p>
              <p className='text-sm text-[#717786] mt-1 italic'>Tham gia từ {formatDateVN(dataProfile.createdAt)}</p>
            </div>
            <div className='flex gap-4'>
              <button
                onClick={() => setIsModalOpen(true)}
                className='px-8 py-3 bg-gradient-to-tr from-[#005ab7] to-[#0072e5] text-white rounded-full font-semibold shadow-lg shadow-blue-900/10 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2'
              >
                <span className='material-symbols-outlined text-lg'>edit</span>
                Chỉnh sửa hồ sơ
              </button>
            </div>
          </section>

          {/* Bento Grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Thông tin cá nhân */}
            <div className='md:col-span-2 bg-white p-8 rounded-3xl shadow-sm shadow-blue-900/5 relative overflow-hidden group'>
              <div className='absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity'>
                <span className='material-symbols-outlined text-8xl'>badge</span>
              </div>
              <div className='flex items-center gap-3 mb-8'>
                <div className='p-2 bg-[#005ab7]/5 rounded-xl'>
                  <span className='material-symbols-outlined text-[#005ab7]'>person</span>
                </div>
                <h3 className='text-lg font-bold tracking-tight'>Thông tin cá nhân</h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12'>
                <div>
                  <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Họ tên</p>
                  <p className='text-[#191c1e] font-semibold text-lg'>{dataProfile.fullName}</p>
                </div>
                <div>
                  <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Giới tính</p>
                  <div className='flex items-center gap-2 text-[#191c1e] font-semibold text-lg'>
                    <span className='material-symbols-outlined text-blue-500'>male</span>
                    {dataProfile.gender === 'MALE' ? 'Nam' : 'Nữ'}
                  </div>
                </div>
                <div>
                  <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Ngày sinh</p>
                  <p className='text-[#191c1e] font-semibold text-lg'>{formatDateVN(dataProfile.dateOfBirth)}</p>
                </div>
                <div>
                  <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Mã cư dân</p>
                  <p className='text-[#191c1e] font-semibold text-lg'>{dataProfile.id}</p>
                </div>
              </div>
            </div>

            {/* Tài khoản */}
            <div className='bg-white p-8 rounded-3xl shadow-sm shadow-blue-900/5 relative overflow-hidden'>
              <div className='flex items-center gap-3 mb-8'>
                <div className='p-2 bg-[#005ab7]/5 rounded-xl'>
                  <span className='material-symbols-outlined text-[#005ab7]'>shield_person</span>
                </div>
                <h3 className='text-lg font-bold tracking-tight'>Tài khoản</h3>
              </div>
              <div className='space-y-8'>
                <div>
                  <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Vai trò</p>
                  <div className='inline-flex items-center gap-2 px-3 py-1 bg-[#d3e5f1] text-blue-600 rounded-lg font-bold text-sm'>
                    {dataProfile.roles}
                  </div>
                </div>
                <div>
                  <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Bảo mật</p>
                  <button
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    className='mt-2 w-full py-3 bg-[#f2f4f6] text-[#005ab7] rounded-full font-bold text-sm hover:bg-[#e6e8ea] transition-colors flex items-center justify-center gap-2 border border-[#c1c6d7]/15'
                  >
                    Đổi mật khẩu
                  </button>
                  {/* <button className='mt-2 w-full py-3 bg-[#f2f4f6] text-[#005ab7] rounded-full font-bold text-sm hover:bg-[#e6e8ea] transition-colors flex items-center justify-center gap-2 border border-[#c1c6d7]/15'>
                    Đổi mật khẩu
                  </button> */}
                </div>
              </div>
            </div>

            {/* Thông tin liên lạc */}
            <div className='md:col-span-3 bg-white p-8 rounded-3xl shadow-sm shadow-blue-900/5 relative overflow-hidden'>
              <div className='flex items-center gap-3 mb-8'>
                <div className='p-2 bg-[#005ab7]/5 rounded-xl'>
                  <span className='material-symbols-outlined text-[#005ab7]'>contact_page</span>
                </div>
                <h3 className='text-lg font-bold tracking-tight'>Thông tin liên lạc</h3>
              </div>
              <div className='flex flex-col md:flex-row gap-12'>
                <div className='flex items-start gap-4 flex-1'>
                  <div className='h-12 w-12 rounded-full bg-[#d4e3ff] flex items-center justify-center shrink-0'>
                    <span className='material-symbols-outlined text-[#2f486a]'>mail</span>
                  </div>
                  <div>
                    <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Địa chỉ Email</p>
                    <p className='text-[#191c1e] font-semibold text-lg'>{dataProfile.email}</p>
                    <p className='text-xs text-green-600 font-medium mt-1 flex items-center gap-1'>
                      <span className='material-symbols-outlined text-xs'>check_circle</span>
                      Đã xác minh
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-4 flex-1'>
                  <div className='h-12 w-12 rounded-full bg-[#d4e3ff] flex items-center justify-center shrink-0'>
                    <span className='material-symbols-outlined text-[#2f486a]'>call</span>
                  </div>
                  <div>
                    <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Số điện thoại</p>
                    <p className='text-[#191c1e] font-semibold text-lg'>{dataProfile.phone}</p>
                    <p className='text-xs text-[#717786] font-medium mt-1'>Liên hệ chính</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insight Card */}
            <div className='md:col-span-3 bg-white/60 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-lg shadow-blue-900/5 relative group overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-r from-[#005ab7]/5 to-transparent pointer-events-none' />
              <div className='flex items-center gap-3 mb-6'>
                <span className='material-symbols-outlined text-[#005ab7]'>auto_awesome</span>
                <h3 className='text-sm font-bold tracking-widest uppercase text-[#2f486a]'>
                  Azure Intelligence Insight
                </h3>
              </div>
              <div className='flex flex-col md:flex-row items-center gap-6'>
                <p className='text-[#414754] font-medium flex-1'>
                  Hồ sơ của bạn đã hoàn thành <span className='text-[#005ab7] font-bold'>95%</span>. Cập nhật thêm thông
                  tin căn hộ để nhận được các ưu đãi dành riêng cho cư dân Diamond.
                </p>
                <button className='px-6 py-2.5 bg-[#d4e3ff] text-[#2f486a] rounded-full text-sm font-bold hover:brightness-105 transition-all'>
                  Xem ưu đãi
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar - Mobile Only */}
      <nav className='md:hidden fixed bottom-0 left-0 right-0 bg-slate-50/70 backdrop-blur-xl h-16 flex justify-around items-center px-4 z-50'>
        <button className='flex flex-col items-center gap-1 text-slate-500'>
          <span className='material-symbols-outlined'>dashboard</span>
          <span className='text-[10px] font-medium'>Tổng quan</span>
        </button>
        <button className='flex flex-col items-center gap-1 text-blue-600'>
          <span className='material-symbols-outlined'>person</span>
          <span className='text-[10px] font-bold'>Hồ sơ</span>
        </button>
        <button className='flex flex-col items-center gap-1 text-slate-500'>
          <span className='material-symbols-outlined'>apartment</span>
          <span className='text-[10px] font-medium'>Căn hộ</span>
        </button>
        <button className='flex flex-col items-center gap-1 text-slate-500'>
          <span className='material-symbols-outlined'>receipt_long</span>
          <span className='text-[10px] font-medium'>Hóa đơn</span>
        </button>
        <button className='flex flex-col items-center gap-1 text-slate-500'>
          <span className='material-symbols-outlined'>more_horiz</span>
          <span className='text-[10px] font-medium'>Thêm</span>
        </button>
      </nav>

      {/* ============================================ */}
      {/* MODAL - Update Information */}
      {/* ============================================ */}
      {isModalOpen && (
        <div
          className='fixed inset-0 z-[60] flex items-center justify-center p-6 shadow-emerald-500  '
          onClick={() => setIsModalOpen(false)}
        >
          {/* Backdrop */}
          {/* backdrop-blur-sm */}
          <div className='absolute inset-0 bg-slate-900/40 '></div>

          {/* Modal Content */}
          <div className='relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl shadow-blue-900/20 overflow-hidden border border-outline-variant/20'>
            {/* Modal Header */}
            <div className='px-10 pt-10 pb-6'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='label-md uppercase tracking-[0.2em] text-[#005ab7] text-[10px] font-extrabold mb-2'>
                    Profile Integrity
                  </p>
                  <h2 className='text-3xl font-extrabold text-[#191c1e] tracking-tight'>Update Information</h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className='w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#eceef0] transition-colors'
                >
                  <span className='material-symbols-outlined text-[#717786]'>close</span>
                </button>
              </div>
              <div className='h-[1px] w-full bg-gradient-to-r from-[#005ab7]/20 via-[#005ab7]/5 to-transparent mt-6'></div>
            </div>

            {/* Modal Form */}
            <div className='px-10 py-4 max-h-[716px] overflow-y-auto no-scrollbar'>
              <form className='space-y-8'>
                {/* Name & Email Row */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div className='group'>
                    <label className='block label-md uppercase tracking-widest text-[10px] text-[#717786] font-bold mb-3 px-1'>
                      Full Name
                    </label>
                    <div className='relative'>
                      <input
                        className='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-1 focus:ring-[#005ab7] focus:bg-white transition-all'
                        placeholder='Enter full name'
                        type='text'
                        defaultValue={dataProfile.fullName}
                      />
                    </div>
                  </div>
                  <div className='group'>
                    <label className='block label-md uppercase tracking-widest text-[10px] text-[#717786] font-bold mb-3 px-1'>
                      Email Address
                    </label>
                    <div className='relative'>
                      <input
                        className='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-1 focus:ring-[#005ab7] focus:bg-white transition-all'
                        placeholder='email@example.com'
                        type='email'
                        defaultValue={dataProfile.email}
                      />
                    </div>
                  </div>
                </div>

                {/* Phone & DOB Row */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div className='group'>
                    <label className='block label-md uppercase tracking-widest text-[10px] text-[#717786] font-bold mb-3 px-1'>
                      Phone Number
                    </label>
                    <div className='relative'>
                      <input
                        className='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-1 focus:ring-[#005ab7] focus:bg-white transition-all'
                        placeholder='+84 000 000 000'
                        type='tel'
                        defaultValue={dataProfile.phone}
                      />
                    </div>
                  </div>
                  <div className='group'>
                    <label className='block label-md uppercase tracking-widest text-[10px] text-[#717786] font-bold mb-3 px-1'>
                      Date of Birth
                    </label>
                    <div className='relative'>
                      <input
                        className='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-1 focus:ring-[#005ab7] focus:bg-white transition-all'
                        type='date'
                        defaultValue={formatDateForInput(dataProfile.dateOfBirth)}
                      />
                    </div>
                  </div>
                </div>

                {/* Gender Selection */}
                <div className='group'>
                  <label className='block label-md uppercase tracking-widest text-[10px] text-[#717786] font-bold mb-4 px-1'>
                    Biological Identity
                  </label>
                  <div className='grid grid-cols-3 gap-4'>
                    <label
                      className={`relative flex items-center justify-center p-4 rounded-xl cursor-pointer border ${
                        dataProfile.gender === 'MALE'
                          ? 'border-[#005ab7]/20 bg-[#005ab7]/5 text-[#005ab7]'
                          : 'border-[#c1c6d7]/10 bg-[#f2f4f6] hover:bg-[#eceef0] text-[#414754]'
                      } transition-all`}
                    >
                      <input
                        type='radio'
                        name='gender'
                        value='MALE'
                        defaultChecked={dataProfile.gender === 'MALE'}
                        className='hidden'
                      />
                      <div className='flex flex-col items-center gap-1'>
                        <span
                          className='material-symbols-outlined'
                          style={{ fontVariationSettings: dataProfile.gender === 'MALE' ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          male
                        </span>
                        <span className='text-[10px] font-bold tracking-widest uppercase'>MALE</span>
                      </div>
                    </label>
                    <label
                      className={`relative flex items-center justify-center p-4 rounded-xl cursor-pointer border ${
                        dataProfile.gender === 'FEMALE'
                          ? 'border-[#005ab7]/20 bg-[#005ab7]/5 text-[#005ab7]'
                          : 'border-[#c1c6d7]/10 bg-[#f2f4f6] hover:bg-[#eceef0] text-[#414754]'
                      } transition-all`}
                    >
                      <input
                        type='radio'
                        name='gender'
                        value='FEMALE'
                        defaultChecked={dataProfile.gender === 'FEMALE'}
                        className='hidden'
                      />
                      <div className='flex flex-col items-center gap-1'>
                        <span className='material-symbols-outlined'>female</span>
                        <span className='text-[10px] font-bold tracking-widest uppercase'>FEMALE</span>
                      </div>
                    </label>
                    <label
                      className={`relative flex items-center justify-center p-4 rounded-xl cursor-pointer border ${
                        dataProfile.gender === 'OTHER'
                          ? 'border-[#005ab7]/20 bg-[#005ab7]/5 text-[#005ab7]'
                          : 'border-[#c1c6d7]/10 bg-[#f2f4f6] hover:bg-[#eceef0] text-[#414754]'
                      } transition-all`}
                    >
                      <input
                        type='radio'
                        name='gender'
                        value='OTHER'
                        defaultChecked={dataProfile.gender === 'OTHER'}
                        className='hidden'
                      />
                      <div className='flex flex-col items-center gap-1'>
                        <span className='material-symbols-outlined'>transgender</span>
                        <span className='text-[10px] font-bold tracking-widest uppercase'>OTHER</span>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className='px-10 py-10 bg-[#f2f4f6]/50 flex items-center justify-between mt-6'>
              <button
                onClick={() => setIsModalOpen(false)}
                className='px-8 py-3.5 text-[#414754] font-bold text-[10px] tracking-widest uppercase hover:text-[#191c1e] transition-colors'
              >
                Cancel
              </button>
              <div className='flex gap-4'>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className='bg-gradient-to-br from-[#005ab7] to-[#0072e5] text-white px-10 py-3.5 rounded-full font-bold text-[10px] tracking-widest uppercase shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-[0.98] transition-all'
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đổi mật khẩu */}
      {isChangePasswordModalOpen && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-6'>
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-black/20 backdrop-blur-sm'
            onClick={() => setIsChangePasswordModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className='relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden'>
            {/* Modal Header */}
            <div className='px-6 pt-6 pb-4 border-b border-gray-100'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='material-symbols-outlined text-[#005ab7]'>lock</span>
                    <p className='uppercase tracking-[0.2em] text-[#005ab7] text-[10px] font-extrabold'>Bảo mật</p>
                  </div>
                  <h2 className='text-2xl font-extrabold text-[#191c1e] tracking-tight'>Đổi mật khẩu</h2>
                </div>
                <button
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className='w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors'
                >
                  <span className='material-symbols-outlined text-[#717786] text-xl'>close</span>
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <div className='px-6 py-6'>
              <form className='space-y-5'>
                <div>
                  <label className='block text-xs font-bold text-[#717786] tracking-widest uppercase mb-2'>
                    Mật khẩu hiện tại
                  </label>
                  <div className='relative'>
                    <input
                      type='password'
                      className='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#005ab7] focus:bg-white transition-all'
                      placeholder='Nhập mật khẩu hiện tại'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-bold text-[#717786] tracking-widest uppercase mb-2'>
                    Mật khẩu mới
                  </label>
                  <div className='relative'>
                    <input
                      type='password'
                      className='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#005ab7] focus:bg-white transition-all'
                      placeholder='Nhập mật khẩu mới'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-bold text-[#717786] tracking-widest uppercase mb-2'>
                    Xác nhận mật khẩu mới
                  </label>
                  <div className='relative'>
                    <input
                      type='password'
                      className='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#005ab7] focus:bg-white transition-all'
                      placeholder='Nhập lại mật khẩu mới'
                    />
                  </div>
                </div>

                {/* Gợi ý độ mạnh mật khẩu */}
                <div className='bg-blue-50/50 rounded-xl p-3'>
                  <p className='text-[10px] font-bold text-[#2f486a] uppercase tracking-wider mb-2'>Yêu cầu mật khẩu</p>
                  <div className='space-y-1 text-[11px] text-[#414754]'>
                    <p className='flex items-center gap-1'>• Ít nhất 8 ký tự</p>
                    <p className='flex items-center gap-1'>• Có ít nhất 1 chữ hoa</p>
                    <p className='flex items-center gap-1'>• Có ít nhất 1 số</p>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className='px-6 py-5 bg-gray-50/50 flex items-center justify-end gap-3'>
              <button
                onClick={() => setIsChangePasswordModalOpen(false)}
                className='px-5 py-2.5 text-[#414754] font-bold text-[11px] tracking-widest uppercase hover:text-[#191c1e] transition-colors rounded-full'
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  // Xử lý đổi mật khẩu ở đây
                  setIsChangePasswordModalOpen(false)
                }}
                className='bg-gradient-to-br from-[#005ab7] to-[#0072e5] text-white px-6 py-2.5 rounded-full font-bold text-[11px] tracking-widest uppercase shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-[0.98] transition-all'
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Đổi mật khẩu */}
      {isChangePasswordModalOpen && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-6'>
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-black/20 backdrop-blur-sm'
            onClick={() => setIsChangePasswordModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className='relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden'>
            {/* Modal Header */}
            <div className='px-6 pt-6 pb-4 border-b border-gray-100'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='material-symbols-outlined text-[#005ab7]'>lock</span>
                    <p className='uppercase tracking-[0.2em] text-[#005ab7] text-[10px] font-extrabold'>Bảo mật</p>
                  </div>
                  <h2 className='text-2xl font-extrabold text-[#191c1e] tracking-tight'>Đổi mật khẩu</h2>
                </div>
                <button
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className='w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors'
                >
                  <span className='material-symbols-outlined text-[#717786] text-xl'>close</span>
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <div className='px-6 py-6'>
              <form className='space-y-5'>
                <div>
                  <label className='block text-xs font-bold text-[#717786] tracking-widest uppercase mb-2'>
                    Mật khẩu hiện tại
                  </label>
                  <div className='relative'>
                    <input
                      type='password'
                      className='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#005ab7] focus:bg-white transition-all'
                      placeholder='Nhập mật khẩu hiện tại'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-bold text-[#717786] tracking-widest uppercase mb-2'>
                    Mật khẩu mới
                  </label>
                  <div className='relative'>
                    <input
                      type='password'
                      className='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#005ab7] focus:bg-white transition-all'
                      placeholder='Nhập mật khẩu mới'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs font-bold text-[#717786] tracking-widest uppercase mb-2'>
                    Xác nhận mật khẩu mới
                  </label>
                  <div className='relative'>
                    <input
                      type='password'
                      className='w-full bg-[#f2f4f6] border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#005ab7] focus:bg-white transition-all'
                      placeholder='Nhập lại mật khẩu mới'
                    />
                  </div>
                </div>

                {/* Gợi ý độ mạnh mật khẩu */}
                <div className='bg-blue-50/50 rounded-xl p-3'>
                  <p className='text-[10px] font-bold text-[#2f486a] uppercase tracking-wider mb-2'>Yêu cầu mật khẩu</p>
                  <div className='space-y-1 text-[11px] text-[#414754]'>
                    <p className='flex items-center gap-1'>• Ít nhất 8 ký tự</p>
                    <p className='flex items-center gap-1'>• Có ít nhất 1 chữ hoa</p>
                    <p className='flex items-center gap-1'>• Có ít nhất 1 số</p>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className='px-6 py-5 bg-gray-50/50 flex items-center justify-end gap-3'>
              <button
                onClick={() => setIsChangePasswordModalOpen(false)}
                className='px-5 py-2.5 text-[#414754] font-bold text-[11px] tracking-widest uppercase hover:text-[#191c1e] transition-colors rounded-full'
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  // Xử lý đổi mật khẩu ở đây
                  setIsChangePasswordModalOpen(false)
                }}
                className='bg-gradient-to-br from-[#005ab7] to-[#0072e5] text-white px-6 py-2.5 rounded-full font-bold text-[11px] tracking-widest uppercase shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-[0.98] transition-all'
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
