import React from 'react'

export default function Profile() {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen font-['Manrope',sans-serif]">
      {/* SideNavBar - Hidden on Mobile */}
      <aside className='h-screen w-64 fixed left-0 top-0 bg-slate-100 flex flex-col p-4 gap-2 z-40 hidden md:flex'>
        <div className='mb-8 px-2'>
          <h1 className='text-lg font-black text-blue-700 tracking-tighter'>Azure Serenity</h1>
          <p className='text-xs text-slate-500 font-medium'>Quản lý cư dân</p>
        </div>
        <nav className='flex-1 space-y-1'>
          <a
            className='flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-transform hover:translate-x-1 text-sm font-medium'
            href='#'
          >
            <span className='material-symbols-outlined'>dashboard</span> Tổng quan
          </a>
          <a
            className='flex items-center gap-3 px-3 py-2 text-blue-600 bg-white shadow-sm rounded-lg text-sm font-semibold'
            href='#'
          >
            <span className='material-symbols-outlined'>person</span> Hồ sơ cá nhân
          </a>
          <a
            className='flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-transform hover:translate-x-1 text-sm font-medium'
            href='#'
          >
            <span className='material-symbols-outlined'>apartment</span> Căn hộ của tôi
          </a>
          <a
            className='flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-transform hover:translate-x-1 text-sm font-medium'
            href='#'
          >
            <span className='material-symbols-outlined'>receipt_long</span> Hóa đơn
          </a>
          <a
            className='flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-transform hover:translate-x-1 text-sm font-medium'
            href='#'
          >
            <span className='material-symbols-outlined'>contact_support</span> Hỗ trợ
          </a>
        </nav>
        <div className='mt-auto border-t border-slate-200 pt-4'>
          <a
            className='flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-transform hover:translate-x-1 text-sm font-medium'
            href='#'
          >
            <span className='material-symbols-outlined'>logout</span> Đăng xuất
          </a>
        </div>
      </aside>

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
                <img
                  alt='Cư dân Profile'
                  className='h-full w-full object-cover'
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuBN-L2q9Wo6FfbFB0maVqdJXU2GnglDXadV3OujtPtouWurl2QyYJ4ThRBOJOiG2ND9VQp1RreGCMbJ1OjXolV4SJxqu5O2xKKUGvf8qzCBwgAR8865qDQeSZvEgKval2EsI2bx0V2h9dmWvCOL56xl1Ou91ZLyjnPP_Ys0PGNfmGloczjbVxPWraIL9kEOmRRLl0vaNyBsNLpofwo4aJNfN_GkK5vlJrc4onxSw1y0S9AU1N5_fyHzahhOv1uUdCCV4_7qK2B14xTJ'
                />
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
                  src='https://lh3.googleusercontent.com/aida-public/AB6AXuAKbTc4JrFMc0p0KgpceMsYbA9NhnIMmY06VAjPr8KDOISRKmK88hYeylOhx8_QsakDgD4ql0HRK3o-A3w02c_iuK-A1prCYiMcs0KwFfsDvcOSp9Nz6-F-ozkohN7oUZEQwGIPSL-tDUcUC0sG6S6QRNShAnq4sgrNDCAKZ4lAsHvZkMaFQtiz6YrE5iNw8ug-f0hkbte8sg_p8SXohrWC6JxVwUNEBOSwxFb-vHxrJOlaJKc2Ku4ZNzlqQQwfAkOBNDOj0jMOUpRU'
                />
              </div>
              <button className='absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg border border-slate-100 hover:scale-105 transition-transform'>
                <span className='material-symbols-outlined text-[#005ab7] text-xl'>photo_camera</span>
              </button>
            </div>
            <div className='text-center md:text-left flex-1'>
              <div className='flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2'>
                <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight text-[#191c1e]'>Nguyễn Văn A</h2>
                <span className='px-3 py-1 bg-[#d4e3ff] text-[#2f486a] text-xs font-bold rounded-full tracking-wider uppercase'>
                  ACTIVE
                </span>
              </div>
              <p className='text-[#414754] font-medium text-lg flex items-center justify-center md:justify-start gap-2'>
                <span className='material-symbols-outlined text-[#005ab7]'>verified</span>
                Cư dân Azure Serenity
              </p>
              <p className='text-sm text-[#717786] mt-1 italic'>Tham gia từ 21 tháng 02, 2026</p>
            </div>
            <div className='flex gap-4'>
              <button className='px-8 py-3 bg-gradient-to-tr from-[#005ab7] to-[#0072e5] text-white rounded-full font-semibold shadow-lg shadow-blue-900/10 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2'>
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
                  <p className='text-[#191c1e] font-semibold text-lg'>Nguyễn Văn A</p>
                </div>
                <div>
                  <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Giới tính</p>
                  <div className='flex items-center gap-2 text-[#191c1e] font-semibold text-lg'>
                    <span className='material-symbols-outlined text-blue-500'>male</span>
                    Nam
                  </div>
                </div>
                <div>
                  <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Ngày sinh</p>
                  <p className='text-[#191c1e] font-semibold text-lg'>01 tháng 01, 2000</p>
                </div>
                <div>
                  <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Mã cư dân</p>
                  <p className='text-[#191c1e] font-semibold text-lg'>AS-2026-0042</p>
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
                  <div className='inline-flex items-center gap-2 px-3 py-1 bg-[#d3e5f1] text-[#384953] rounded-lg font-bold text-sm'>
                    <span className='material-symbols-outlined text-sm'>home</span>
                    Cư dân
                  </div>
                </div>
                <div>
                  <p className='text-xs font-bold text-[#717786] tracking-widest uppercase mb-1'>Bảo mật</p>
                  <button className='mt-2 w-full py-3 bg-[#f2f4f6] text-[#005ab7] rounded-full font-bold text-sm hover:bg-[#e6e8ea] transition-colors flex items-center justify-center gap-2 border border-[#c1c6d7]/15'>
                    <span className='material-symbols-outlined text-sm'>lock_reset</span>
                    Đổi mật khẩu
                  </button>
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
                    <p className='text-[#191c1e] font-semibold text-lg'>nguyenvana@example.com</p>
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
                    <p className='text-[#191c1e] font-semibold text-lg'>0901234567</p>
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
    </div>
  )
}
