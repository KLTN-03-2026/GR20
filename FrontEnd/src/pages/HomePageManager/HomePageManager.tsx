export default function HomePageManager() {
  return (
    <div className='bg-surface text-on-surface min-h-screen'>
      {/* Main Content Canvas - Bỏ sidebar và header, chỉ giữ phần nội dung chính */}
      <main className='pt-10 px-10 pb-12 min-h-screen'>
        {/* Hero Header */}
        <div className='flex justify-between items-end mb-10'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.1em] text-primary mb-2'>Bảng điều khiển quản trị</p>
            <h2 className='text-4xl font-extrabold text-on-surface tracking-tight'>Chào buổi sáng, Quản lý</h2>
          </div>
          <div className='flex gap-3'>
            <button className='px-6 py-2.5 bg-surface-container-lowest text-on-surface text-sm font-bold rounded-full border border-outline-variant/15 hover:bg-surface-container-low transition-colors'>
              Tải báo cáo
            </button>
            <button className='px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold rounded-full hover:brightness-110 transition-all'>
              Thu phí đồng loạt
            </button>
          </div>
        </div>

        {/* 1. Overview Cards (Bento Grid Style) */}
        <div className='grid grid-cols-5 gap-6 mb-10'>
          <div className='col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5'>
            <div className='flex justify-between items-start mb-4'>
              <span className='p-2 bg-blue-50 text-blue-600 rounded-lg material-symbols-outlined'>apartment</span>
              <span className='text-xs font-bold text-green-600 flex items-center'>↑ 2%</span>
            </div>
            <p className='text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1'>Tỷ lệ lấp đầy</p>
            <h3 className='text-2xl font-black text-on-surface'>94%</h3>
          </div>
          <div className='col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5'>
            <div className='flex justify-between items-start mb-4'>
              <span className='p-2 bg-purple-50 text-purple-600 rounded-lg material-symbols-outlined'>groups</span>
            </div>
            <p className='text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1'>Cư dân</p>
            <h3 className='text-2xl font-black text-on-surface'>1.120</h3>
          </div>
          <div className='col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5'>
            <div className='flex justify-between items-start mb-4'>
              <span className='p-2 bg-green-50 text-green-600 rounded-lg material-symbols-outlined'>payments</span>
            </div>
            <p className='text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1'>Thu tháng này</p>
            <h3 className='text-2xl font-black text-on-surface'>$4.2M</h3>
          </div>
          <div className='col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5'>
            <div className='flex justify-between items-start mb-4'>
              <span className='p-2 bg-orange-50 text-orange-600 rounded-lg material-symbols-outlined'>
                pending_actions
              </span>
            </div>
            <p className='text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1'>Hóa đơn treo</p>
            <h3 className='text-2xl font-black text-on-surface'>$120k</h3>
          </div>
          <div className='col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5'>
            <div className='flex justify-between items-start mb-4'>
              <span className='p-2 bg-red-50 text-red-600 rounded-lg material-symbols-outlined'>build</span>
            </div>
            <p className='text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1'>Bảo trì mở</p>
            <h3 className='text-2xl font-black text-on-surface'>12</h3>
          </div>
        </div>

        <div className='grid grid-cols-12 gap-8 mb-10'>
          {/* 2. Charts & Analytics */}
          <div className='col-span-8 space-y-8'>
            {/* Utility Comparison */}
            <div className='bg-surface-container-lowest p-8 rounded-2xl'>
              <div className='flex justify-between items-center mb-8'>
                <div>
                  <h4 className='text-lg font-bold text-on-surface'>Tiêu thụ Điện &amp; Nước</h4>
                  <p className='text-sm text-on-surface-variant'>So sánh giữa năm nay và năm trước</p>
                </div>
                <div className='flex gap-4'>
                  <div className='flex items-center gap-2'>
                    <span className='w-3 h-3 rounded-full bg-primary'></span>
                    <span className='text-xs font-bold'>2024</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='w-3 h-3 rounded-full bg-slate-200'></span>
                    <span className='text-xs font-bold text-slate-400'>2023</span>
                  </div>
                </div>
              </div>
              {/* Mock Line Chart */}
              <div className='h-64 flex items-end justify-between gap-4 px-2'>
                <div className='flex-1 bg-surface-container-low h-full rounded-lg relative overflow-hidden flex items-end'>
                  <div className='w-full bg-slate-100 h-1/2 absolute bottom-0 opacity-50'></div>
                  <div className='w-full bg-primary/20 h-3/4 absolute bottom-0 border-t-2 border-primary'></div>
                </div>
                <div className='flex-1 bg-surface-container-low h-full rounded-lg relative overflow-hidden flex items-end'>
                  <div className='w-full bg-slate-100 h-[60%] absolute bottom-0 opacity-50'></div>
                  <div className='w-full bg-primary/20 h-1/2 absolute bottom-0 border-t-2 border-primary'></div>
                </div>
                <div className='flex-1 bg-surface-container-low h-full rounded-lg relative overflow-hidden flex items-end'>
                  <div className='w-full bg-slate-100 h-[45%] absolute bottom-0 opacity-50'></div>
                  <div className='w-full bg-primary/20 h-[55%] absolute bottom-0 border-t-2 border-primary'></div>
                </div>
                <div className='flex-1 bg-surface-container-low h-full rounded-lg relative overflow-hidden flex items-end'>
                  <div className='w-full bg-slate-100 h-[70%] absolute bottom-0 opacity-50'></div>
                  <div className='w-full bg-primary/20 h-[85%] absolute bottom-0 border-t-2 border-primary'></div>
                </div>
                <div className='flex-1 bg-surface-container-low h-full rounded-lg relative overflow-hidden flex items-end'>
                  <div className='w-full bg-slate-100 h-[80%] absolute bottom-0 opacity-50'></div>
                  <div className='w-full bg-primary/20 h-[90%] absolute bottom-0 border-t-2 border-primary'></div>
                </div>
                <div className='flex-1 bg-surface-container-low h-full rounded-lg relative overflow-hidden flex items-end'>
                  <div className='w-full bg-slate-100 h-[90%] absolute bottom-0 opacity-50'></div>
                  <div className='w-full bg-primary/20 h-[95%] absolute bottom-0 border-t-2 border-primary'></div>
                </div>
              </div>
              <div className='flex justify-between mt-4 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest'>
                <span>Th1</span>
                <span>Th2</span>
                <span>Th3</span>
                <span>Th4</span>
                <span>Th5</span>
                <span>Th6</span>
              </div>
            </div>

            {/* Debt & Maintenance Breakdown */}
            <div className='grid grid-cols-2 gap-8'>
              {/* Debt by Apartment Bar */}
              <div className='bg-surface-container-lowest p-6 rounded-2xl'>
                <h4 className='text-sm font-bold text-on-surface mb-6 uppercase tracking-wider'>Top 5 Căn hộ nợ phí</h4>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between text-xs font-bold mb-1'>
                      <span>A1201</span>
                      <span>$12,400</span>
                    </div>
                    <div className='w-full h-2 bg-surface-container-low rounded-full overflow-hidden'>
                      <div className='h-full bg-red-400 w-[90%]'></div>
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-between text-xs font-bold mb-1'>
                      <span>B0402</span>
                      <span>$9,200</span>
                    </div>
                    <div className='w-full h-2 bg-surface-container-low rounded-full overflow-hidden'>
                      <div className='h-full bg-red-400 w-[75%]'></div>
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-between text-xs font-bold mb-1'>
                      <span>C1105</span>
                      <span>$6,100</span>
                    </div>
                    <div className='w-full h-2 bg-surface-container-low rounded-full overflow-hidden'>
                      <div className='h-full bg-red-400 w-[50%]'></div>
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-between text-xs font-bold mb-1'>
                      <span>D0808</span>
                      <span>$4,500</span>
                    </div>
                    <div className='w-full h-2 bg-surface-container-low rounded-full overflow-hidden'>
                      <div className='h-full bg-red-400 w-[35%]'></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance Pie (Simulated) */}
              <div className='bg-surface-container-lowest p-6 rounded-2xl flex flex-col'>
                <h4 className='text-sm font-bold text-on-surface mb-6 uppercase tracking-wider'>
                  Loại yêu cầu bảo trì
                </h4>
                <div className='flex-1 flex items-center justify-around'>
                  <div className='relative w-32 h-32 rounded-full border-[12px] border-slate-100'>
                    <div
                      className='absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent border-l-transparent'
                      style={{ transform: 'rotate(45deg)' }}
                    ></div>
                    <div className='absolute inset-0 flex items-center justify-center font-bold text-lg'>12</div>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-[10px] font-bold'>
                      <span className='w-2 h-2 rounded-full bg-primary'></span> Điện (40%)
                    </div>
                    <div className='flex items-center gap-2 text-[10px] font-bold'>
                      <span className='w-2 h-2 rounded-full bg-secondary'></span> Nước (30%)
                    </div>
                    <div className='flex items-center gap-2 text-[10px] font-bold'>
                      <span className='w-2 h-2 rounded-full bg-tertiary'></span> HVAC (20%)
                    </div>
                    <div className='flex items-center gap-2 text-[10px] font-bold'>
                      <span className='w-2 h-2 rounded-full bg-slate-300'></span> Khác (10%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Alerts & Recent Activity */}
          <div className='col-span-4 space-y-8'>
            {/* Alerts (Glass Style) */}
            <section className='space-y-4'>
              <h5 className='text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2'>
                <span className='material-symbols-outlined text-sm'>emergency</span> Cảnh báo &amp; Bất thường
              </h5>
              <div className='bg-red-50/50 p-4 rounded-xl flex gap-4 items-start border border-red-100/20'>
                <span className='material-symbols-outlined text-red-600'>warning</span>
                <div>
                  <p className='text-sm font-bold text-red-900'>Căn hộ nợ quá 3 tháng</p>
                  <p className='text-xs text-red-700/80 mt-1'>A1201, B0402 - Đã gửi thông báo lần 3.</p>
                </div>
              </div>
              <div className='bg-amber-50/50 p-4 rounded-xl flex gap-4 items-start border border-amber-100/20'>
                <span className='material-symbols-outlined text-amber-600'>water_drop</span>
                <div>
                  <p className='text-sm font-bold text-amber-900'>Chỉ số nước đột biến</p>
                  <p className='text-xs text-amber-700/80 mt-1'>C1105 - Tăng 215%. Đề xuất kiểm tra rò rỉ.</p>
                </div>
              </div>
              <div className='bg-slate-100/50 p-4 rounded-xl flex gap-4 items-start border border-slate-200/20'>
                <span className='material-symbols-outlined text-slate-600'>trending_down</span>
                <div>
                  <p className='text-sm font-bold text-slate-900'>Phàn nàn thang máy</p>
                  <p className='text-xs text-slate-700/80 mt-1'>Ghi nhận 5 ý kiến từ cư dân Block A.</p>
                </div>
              </div>
            </section>

            {/* Activity Feed */}
            <section className='bg-surface-container-lowest p-6 rounded-2xl'>
              <h5 className='text-xs font-black uppercase tracking-widest text-on-surface-variant mb-6'>
                Hoạt động gần đây
              </h5>
              <div className='space-y-6'>
                <div className='flex gap-4'>
                  <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0'>
                    <span className='material-symbols-outlined text-sm'>person_add</span>
                  </div>
                  <div>
                    <p className='text-xs font-bold text-on-surface'>Cư dân mới: Nguyễn Hoàn Bão</p>
                    <p className='text-[10px] text-on-surface-variant'>Căn hộ A201 • Vừa xong</p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0'>
                    <span className='material-symbols-outlined text-sm'>plumbing</span>
                  </div>
                  <div>
                    <p className='text-xs font-bold text-on-surface'>Yêu cầu bảo trì: Rò rỉ lớn</p>
                    <p className='text-[10px] text-on-surface-variant'>Căn hộ 402 • 15 phút trước</p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0'>
                    <span className='material-symbols-outlined text-sm'>receipt_long</span>
                  </div>
                  <div>
                    <p className='text-xs font-bold text-on-surface'>Thanh toán mới: $2,450</p>
                    <p className='text-[10px] text-on-surface-variant'>Căn hộ 1204 • 1 giờ trước</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* 4. Bottom Grid: Quick Stats & AI Suggestions */}
        <div className='grid grid-cols-12 gap-8'>
          {/* Quick Stats Bento */}
          <div className='col-span-5 grid grid-cols-2 gap-4'>
            <div className='bg-primary/5 p-6 rounded-2xl flex flex-col justify-between border border-primary/10'>
              <span className='material-symbols-outlined text-primary text-3xl'>directions_car</span>
              <div>
                <p className='text-3xl font-black text-primary'>840</p>
                <p className='text-xs font-bold uppercase tracking-widest text-primary/70'>Phương tiện đăng ký</p>
              </div>
            </div>
            <div className='bg-secondary-fixed p-6 rounded-2xl flex flex-col justify-between'>
              <span className='material-symbols-outlined text-on-secondary-fixed text-3xl'>qr_code_2</span>
              <div>
                <p className='text-3xl font-black text-on-secondary-fixed'>1.120</p>
                <p className='text-xs font-bold uppercase tracking-widest text-on-secondary-fixed-variant'>
                  Mã QR cá nhân
                </p>
              </div>
            </div>
            <div className='col-span-2 bg-surface-container-high p-6 rounded-2xl flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-white rounded-full flex items-center justify-center text-on-surface shadow-sm'>
                  <span className='material-symbols-outlined'>person_search</span>
                </div>
                <div>
                  <p className='text-xl font-black text-on-surface'>15 Khách</p>
                  <p className='text-xs font-medium text-on-surface-variant'>Đang trong tòa nhà hiện tại</p>
                </div>
              </div>
              <button className='material-symbols-outlined p-2 hover:bg-white rounded-full transition-colors'>
                arrow_forward
              </button>
            </div>
          </div>

          {/* AI Suggestions (Signature Glass Insight) */}
          <div className='col-span-7 bg-white/60 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-[0_32px_64px_-12px_rgba(68,93,128,0.08)] relative overflow-hidden'>
            <div className='absolute top-0 right-0 p-8 opacity-10 pointer-events-none'>
              <span
                className='material-symbols-outlined text-9xl text-primary'
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <div className='flex items-center gap-3 mb-8'>
              <span className='bg-primary text-white p-1.5 rounded-lg material-symbols-outlined text-sm'>
                auto_awesome
              </span>
              <h5 className='text-sm font-black uppercase tracking-[0.2em] text-on-surface'>Homelink AI Gợi ý</h5>
            </div>
            <div className='grid grid-cols-1 gap-6'>
              <div className='flex items-center gap-4 group cursor-pointer'>
                <div className='w-1 h-12 bg-primary rounded-full group-hover:scale-y-110 transition-transform'></div>
                <div>
                  <p className='text-sm font-bold text-on-surface'>Nhắc nhở công nợ</p>
                  <p className='text-sm text-on-surface-variant leading-relaxed'>
                    Căn hộ 12A đã nợ 3 tháng, đề xuất gửi thông báo nhắc nhở tự động qua app.
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-4 group cursor-pointer'>
                <div className='w-1 h-12 bg-amber-400 rounded-full group-hover:scale-y-110 transition-transform'></div>
                <div>
                  <p className='text-sm font-bold text-on-surface'>Dự báo tiêu thụ</p>
                  <p className='text-sm text-on-surface-variant leading-relaxed'>
                    Dự báo tháng sau phí điện tăng 15% do mùa nóng, đề xuất gửi mẹo tiết kiệm điện.
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-4 group cursor-pointer'>
                <div className='w-1 h-12 bg-red-400 rounded-full group-hover:scale-y-110 transition-transform'></div>
                <div>
                  <p className='text-sm font-bold text-on-surface'>Tối ưu nhân sự</p>
                  <p className='text-sm text-on-surface-variant leading-relaxed'>
                    Kỹ thuật viên Nguyễn Văn A đang quá tải (8 việc), đề xuất tái phân bổ cho Trần B.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
