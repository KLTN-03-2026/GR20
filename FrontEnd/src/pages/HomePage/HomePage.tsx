import 'material-symbols'
import SidebarUser from 'src/components/SidebarUser'

export default function HomePage() {
  return (
    <div className='bg-surface text-on-surface min-h-screen flex'>
      {/* Side Navigation Bar */}
      <SidebarUser />

      {/* Main Content Area */}
      {/* <main className='flex-1 lg:ml-64 w-full pb-24 lg:pb-8'> */}
      <div className='px-6 py-4 max-w-screen-2xl mx-auto space-y-8'>
        {/* Hero Banner */}
        <section className='relative h-64 lg:h-80 rounded-[2rem] overflow-hidden group'>
          <img
            alt='Luxury Interior'
            className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
            src='https://daithanhhome.com/upload/elfinder/NewFolder%201/hinh51.jpg'
          />
          <div className='absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/20 to-transparent flex flex-col justify-center px-8 lg:px-12 text-white'>
            <h3 className='text-3xl lg:text-5xl font-extrabold tracking-tighter mb-2'>
              Trải nghiệm sống
              <br />
              thông minh
            </h3>
            <p className='text-primary-fixed-dim text-lg font-medium opacity-90'>
              An tâm tận hưởng, mọi việc để AI lo.
            </p>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <button className='flex flex-col items-start p-5 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 text-left group'>
            <div className='w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary mb-4 group-hover:bg-secondary group-hover:text-white transition-colors'>
              <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
                qr_code_2
              </span>
            </div>
            <span className='font-manrope font-bold text-sm text-primary'>Mã QR Khách</span>
            <span className='text-[10px] text-slate-500 mt-1 uppercase tracking-wider'>An ninh vào cổng</span>
          </button>
          <button className='flex flex-col items-start p-5 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 text-left group'>
            <div className='w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary mb-4 group-hover:bg-secondary group-hover:text-white transition-colors'>
              <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
                engineering
              </span>
            </div>
            <span className='font-manrope font-bold text-sm text-primary'>Gửi Yêu Cầu</span>
            <span className='text-[10px] text-slate-500 mt-1 uppercase tracking-wider'>Bảo trì &amp; Sửa chữa</span>
          </button>
          <button className='flex flex-col items-start p-5 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 text-left group'>
            <div className='w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary mb-4 group-hover:bg-secondary group-hover:text-white transition-colors'>
              <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
                pool
              </span>
            </div>
            <span className='font-manrope font-bold text-sm text-primary'>Đặt Tiện Ích</span>
            <span className='text-[10px] text-slate-500 mt-1 uppercase tracking-wider'>Hồ bơi, Gym, BBQ</span>
          </button>
          <button className='flex flex-col items-start p-5 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 text-left group'>
            <div className='w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary mb-4 group-hover:bg-secondary group-hover:text-white transition-colors'>
              <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
                local_shipping
              </span>
            </div>
            <span className='font-manrope font-bold text-sm text-primary'>Nhận Bưu Kiện</span>
            <span className='text-[10px] text-slate-500 mt-1 uppercase tracking-wider'>2 kiện đang chờ</span>
          </button>
        </section>

        {/* Main Bento Grid */}
        <section className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Notifications & Events */}
          <div className='lg:col-span-2 space-y-6'>
            <div className='bg-surface-container-lowest rounded-3xl p-6 shadow-sm'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='text-xl font-bold text-primary flex items-center'>
                  <span className='material-symbols-outlined mr-2 text-secondary'>campaign</span>
                  Thông báo &amp; Sự kiện
                </h3>
                <button className='text-sm font-semibold text-secondary hover:underline'>Xem tất cả</button>
              </div>
              <div className='space-y-4'>
                <div className='flex items-start p-4 rounded-2xl hover:bg-surface-container-low transition-colors group'>
                  <div className='w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-4 shrink-0'>
                    <span className='material-symbols-outlined'>elevator</span>
                  </div>
                  <div className='flex-1'>
                    <div className='flex justify-between'>
                      <h4 className='font-bold text-slate-800'>Bảo trì thang máy Block B</h4>
                      <span className='text-[10px] font-bold text-slate-400 uppercase'>Hôm nay</span>
                    </div>
                    <p className='text-sm text-slate-600 mt-1 line-clamp-1'>
                      Thang máy số 3 sẽ tạm dừng hoạt động từ 09:00 đến 16:00 để bảo trì định kỳ.
                    </p>
                  </div>
                </div>
                <div className='flex items-start p-4 rounded-2xl hover:bg-surface-container-low transition-colors group'>
                  <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 shrink-0'>
                    <span className='material-symbols-outlined'>celebration</span>
                  </div>
                  <div className='flex-1'>
                    <div className='flex justify-between'>
                      <h4 className='font-bold text-slate-800'>Tiệc Trung Thu Cư Dân</h4>
                      <span className='text-[10px] font-bold text-slate-400 uppercase'>15 Thg 09</span>
                    </div>
                    <p className='text-sm text-slate-600 mt-1 line-clamp-1'>
                      Mời các bé và gia đình tham gia rước đèn tại công viên trung tâm tầng G.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Status */}
            <div className='bg-surface-container-lowest rounded-3xl p-6 shadow-sm'>
              <h3 className='text-xl font-bold text-primary mb-6 flex items-center'>
                <span className='material-symbols-outlined mr-2 text-secondary'>history_edu</span>
                Tiến độ yêu cầu
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-4 rounded-2xl bg-surface-container-low border-l-4 border-secondary'>
                  <div className='flex justify-between items-start mb-2'>
                    <span className='text-xs font-bold text-secondary uppercase tracking-wider'>Đang xử lý</span>
                    <span className='text-[10px] text-slate-500'>Mã: #REQ882</span>
                  </div>
                  <h4 className='font-bold text-slate-800'>Sửa điện phòng khách</h4>
                  <div className='mt-3 w-full bg-slate-200 rounded-full h-1.5'>
                    <div className='bg-secondary h-1.5 rounded-full w-[65%]'></div>
                  </div>
                  <p className='text-[10px] text-slate-500 mt-2'>Kỹ thuật viên dự kiến đến: 14:30</p>
                </div>
                <div className='p-4 rounded-2xl bg-surface-container-low border-l-4 border-slate-300'>
                  <div className='flex justify-between items-start mb-2'>
                    <span className='text-xs font-bold text-slate-400 uppercase tracking-wider'>Chờ xác nhận</span>
                    <span className='text-[10px] text-slate-500'>Mã: #REQ901</span>
                  </div>
                  <h4 className='font-bold text-slate-800'>Thông vòi nước bồn rửa</h4>
                  <div className='mt-3 w-full bg-slate-200 rounded-full h-1.5'>
                    <div className='bg-slate-300 h-1.5 rounded-full w-[20%]'></div>
                  </div>
                  <p className='text-[10px] text-slate-500 mt-2'>Yêu cầu được gửi lúc 08:15</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Payments & Info */}
          <div className='space-y-6'>
            {/* Quick Payment */}
            <div className='bg-primary text-white rounded-3xl p-6 shadow-lg relative overflow-hidden'>
              <div className='relative z-10'>
                <p className='text-primary-fixed-dim text-xs font-bold uppercase tracking-widest mb-1'>
                  Dư nợ hiện tại
                </p>
                <h3 className='text-4xl font-extrabold tracking-tight mb-6'>
                  4.250.000 <span className='text-lg font-normal'>đ</span>
                </h3>
                <div className='space-y-2 mb-6'>
                  <div className='flex justify-between text-xs opacity-80'>
                    <span>Phí quản lý:</span>
                    <span>2.100.000 đ</span>
                  </div>
                  <div className='flex justify-between text-xs opacity-80'>
                    <span>Điện &amp; Nước:</span>
                    <span>2.150.000 đ</span>
                  </div>
                </div>
                <button className='w-full py-4 bg-secondary-container text-primary font-bold rounded-2xl hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-black/20'>
                  Thanh Toán Ngay
                </button>
              </div>
              <div className='absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-3xl'></div>
              <div className='absolute -left-12 -bottom-12 w-40 h-40 bg-secondary/20 rounded-full blur-3xl'></div>
            </div>

            {/* Apartment Info */}
            <div className='bg-surface-container-lowest rounded-3xl p-6 shadow-sm'>
              <h3 className='text-lg font-bold text-primary mb-4'>Thông tin căn hộ</h3>
              <div className='space-y-4'>
                <div className='flex items-center space-x-4 p-3 rounded-xl bg-surface-container-low'>
                  <span className='material-symbols-outlined text-secondary'>square_foot</span>
                  <div className='flex-1'>
                    <p className='text-[10px] text-slate-500 uppercase font-bold'>Diện tích</p>
                    <p className='text-sm font-bold text-slate-800'>85.5 m² (2BR + 2WC)</p>
                  </div>
                </div>
                <div className='flex items-center space-x-4 p-3 rounded-xl bg-surface-container-low'>
                  <span className='material-symbols-outlined text-secondary'>groups</span>
                  <div className='flex-1'>
                    <p className='text-[10px] text-slate-500 uppercase font-bold'>Thành viên</p>
                    <p className='text-sm font-bold text-slate-800'>04 Cư dân</p>
                  </div>
                </div>
                <div className='flex items-center space-x-4 p-3 rounded-xl bg-surface-container-low'>
                  <span className='material-symbols-outlined text-secondary'>directions_car</span>
                  <div className='flex-1'>
                    <p className='text-[10px] text-slate-500 uppercase font-bold'>Phương tiện</p>
                    <p className='text-sm font-bold text-slate-800'>1 Ô tô, 2 Xe máy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* </main> */}

      {/* Floating AI Assistant */}
      <button className='fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-gradient-to-tr from-primary to-secondary text-white rounded-full shadow-2xl flex items-center justify-center ai-glow hover:scale-110 active:scale-95 transition-all z-50 group'>
        <span className='material-symbols-outlined text-3xl' style={{ fontVariationSettings: "'FILL' 1" }}>
          smart_toy
        </span>
        <div className='absolute -top-12 right-0 bg-white text-primary text-xs font-bold px-4 py-2 rounded-xl shadow-xl border border-secondary-container opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
          Hỏi trợ lý AI Homelink
        </div>
      </button>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className='lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-white/60 backdrop-blur-xl shadow-[0_-12px_40px_0_rgba(7,30,39,0.06)] rounded-t-3xl'>
        <a
          className='flex flex-col items-center justify-center bg-secondary-container/20 text-primary rounded-2xl px-5 py-2'
          href='#'
        >
          <span className='material-symbols-outlined'>home</span>
          <span className='text-[10px] uppercase tracking-wider font-semibold mt-1'>Home</span>
        </a>
        <a className='flex flex-col items-center justify-center text-slate-400' href='#'>
          <span className='material-symbols-outlined'>engineering</span>
          <span className='text-[10px] uppercase tracking-wider font-semibold mt-1'>Requests</span>
        </a>
        <a className='flex flex-col items-center justify-center text-slate-400' href='#'>
          <span className='material-symbols-outlined'>qr_code</span>
          <span className='text-[10px] uppercase tracking-wider font-semibold mt-1'>Access</span>
        </a>
        <a className='flex flex-col items-center justify-center text-slate-400' href='#'>
          <span className='material-symbols-outlined'>person</span>
          <span className='text-[10px] uppercase tracking-wider font-semibold mt-1'>Profile</span>
        </a>
      </nav>
    </div>
  )
}
