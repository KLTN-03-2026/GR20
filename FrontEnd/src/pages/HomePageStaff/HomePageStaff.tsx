import React from 'react'

export default function HomePageStaff() {
  return (
    <div className='bg-surface text-on-surface antialiased overflow-x-hidden'>
      {/* Main Content - Bỏ sidebar và header, chỉ giữ phần nội dung chính */}
      <main className='pt-10 p-8 min-h-screen'>
        {/* AI Insight Banner */}
        <section className='mb-10'>
          <div
            className='glass-insight p-6 rounded-3xl border-l-4 border-primary flex items-center justify-between relative overflow-hidden'
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 32px 64px rgba(68, 93, 128, 0.06)'
            }}
          >
            <div className='relative z-10 flex items-center gap-6'>
              <div className='w-14 h-14 bg-primary-container/10 rounded-2xl flex items-center justify-center text-primary'>
                <span className='material-symbols-outlined text-3xl' style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
              </div>
              <div>
                <h3 className='text-lg font-bold text-on-surface'>Báo cáo thông minh Homelink</h3>
                <p className='text-on-surface-variant max-w-2xl'>
                  AI dự đoán <span className='font-bold text-primary'>12 yêu cầu mới</span> hôm nay. Căn hộ 8B có vấn đề
                  điều hòa tái diễn, có thể là lỗi hệ thống. Bạn có 3 yêu cầu quá hạn — ưu tiên xử lý trước 15h.
                </p>
              </div>
            </div>
            <div className='flex gap-2 relative z-10'>
              <span className='px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold uppercase tracking-wider rounded-full'>
                Cảnh báo 8B
              </span>
              <span className='px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold uppercase tracking-wider rounded-full'>
                Dự đoán hệ thống
              </span>
            </div>
            {/* Decorative background shapes */}
            <div className='absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl'></div>
          </div>
        </section>

        {/* Statistics Grid */}
        <section className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-10'>
          <div className='bg-surface-container-lowest p-6 rounded-3xl transition-transform hover:scale-[1.02] cursor-default'>
            <p className='text-label-md text-on-surface-variant font-bold uppercase tracking-widest text-[10px] mb-2'>
              Chờ xử lý
            </p>
            <div className='flex items-baseline gap-2'>
              <span className='text-4xl font-extrabold text-on-surface'>12</span>
              <span className='text-primary material-symbols-outlined text-sm'>schedule</span>
            </div>
            <div className='mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden'>
              <div className='bg-primary h-full w-2/3'></div>
            </div>
          </div>
          <div className='bg-surface-container-lowest p-6 rounded-3xl transition-transform hover:scale-[1.02] cursor-default'>
            <p className='text-label-md text-on-surface-variant font-bold uppercase tracking-widest text-[10px] mb-2'>
              Đang xử lý
            </p>
            <div className='flex items-baseline gap-2'>
              <span className='text-4xl font-extrabold text-on-surface'>08</span>
              <span className='text-secondary material-symbols-outlined text-sm'>sync</span>
            </div>
            <div className='mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden'>
              <div className='bg-secondary h-full w-1/2'></div>
            </div>
          </div>
          <div className='bg-surface-container-lowest p-6 rounded-3xl transition-transform hover:scale-[1.02] cursor-default'>
            <p className='text-label-md text-on-surface-variant font-bold uppercase tracking-widest text-[10px] mb-2'>
              Hoàn thành hôm nay
            </p>
            <div className='flex items-baseline gap-2'>
              <span className='text-4xl font-extrabold text-on-surface'>05</span>
              <span className='text-green-500 material-symbols-outlined text-sm'>check_circle</span>
            </div>
            <div className='mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden'>
              <div className='bg-green-500 h-full w-1/3'></div>
            </div>
          </div>
          <div className='bg-surface-container-lowest p-6 rounded-3xl transition-transform hover:scale-[1.02] cursor-default border border-error/5'>
            <p className='text-label-md text-error font-bold uppercase tracking-widest text-[10px] mb-2'>Quá hạn</p>
            <div className='flex items-baseline gap-2'>
              <span className='text-4xl font-extrabold text-error'>03</span>
              <span className='text-error material-symbols-outlined text-sm'>priority_high</span>
            </div>
            <div className='mt-4 h-1 w-full bg-error-container rounded-full overflow-hidden'>
              <div className='bg-error h-full w-1/4'></div>
            </div>
          </div>
          <div className='bg-primary text-on-primary p-6 rounded-3xl transition-transform hover:scale-[1.02] cursor-default shadow-xl shadow-primary/20'>
            <p className='text-label-md text-on-primary/70 font-bold uppercase tracking-widest text-[10px] mb-2'>
              Việc của tôi
            </p>
            <div className='flex items-baseline gap-2'>
              <span className='text-4xl font-extrabold'>06</span>
              <span className='material-symbols-outlined text-sm'>assignment_ind</span>
            </div>
            <p className='mt-4 text-[10px] font-medium opacity-80'>Tiếp theo: Căn hộ 402</p>
          </div>
        </section>

        <div className='grid grid-cols-12 gap-8'>
          {/* Left Column: Alerts & Performance */}
          <div className='col-span-12 lg:col-span-4 space-y-8'>
            {/* Alerts Section */}
            <div className='bg-surface-container-low p-8 rounded-[2rem]'>
              <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-on-surface-variant mb-6'>
                Cảnh báo quan trọng
              </h4>
              <div className='space-y-4'>
                <div className='flex items-start gap-4 group cursor-pointer'>
                  <div className='w-2 h-2 rounded-full bg-error mt-1.5 animate-pulse'></div>
                  <div>
                    <p className='text-sm font-bold text-on-surface group-hover:text-primary transition-colors'>
                      Ưu tiên cao chưa xử lý &gt; 2h
                    </p>
                    <p className='text-xs text-on-surface-variant'>Cần xử lý ngay 3 yêu cầu.</p>
                  </div>
                </div>
                <div className='flex items-start gap-4 group cursor-pointer'>
                  <div className='w-2 h-2 rounded-full bg-error mt-1.5'></div>
                  <div>
                    <p className='text-sm font-bold text-on-surface group-hover:text-primary transition-colors'>
                      Báo cáo lặp lại (A1201)
                    </p>
                    <p className='text-xs text-on-surface-variant'>Lần thứ 3 gặp sự cố đường ống trong tuần.</p>
                  </div>
                </div>
                <div className='flex items-start gap-4 group cursor-pointer'>
                  <div className='w-2 h-2 rounded-full bg-on-secondary-fixed mt-1.5'></div>
                  <div>
                    <p className='text-sm font-bold text-on-surface group-hover:text-primary transition-colors'>
                      Không cập nhật trạng thái &gt; 24h
                    </p>
                    <p className='text-xs text-on-surface-variant'>Kiểm tra nhà thầu căn hộ 505.</p>
                  </div>
                </div>
                <div className='flex items-start gap-4 group cursor-pointer'>
                  <div className='w-2 h-2 rounded-full bg-on-secondary-fixed mt-1.5'></div>
                  <div>
                    <p className='text-sm font-bold text-on-surface group-hover:text-primary transition-colors'>
                      Kỹ thuật viên quá tải: Nguyễn Văn A
                    </p>
                    <p className='text-xs text-on-surface-variant'>Được giao 8 việc hôm nay. Phân bổ lại?</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info/Performance */}
            <div className='bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm'>
              <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-on-surface-variant mb-6'>
                Hiệu suất nhanh
              </h4>
              <div className='space-y-6'>
                <div className='flex items-center gap-4'>
                  <img
                    alt='Nhân viên xuất sắc'
                    className='w-12 h-12 rounded-full object-cover border-2 border-primary-fixed'
                    src='https://lh3.googleusercontent.com/aida-public/AB6AXuD7o7vbgalSGB6o9kTFrzII2MWseqPMyVcvbbCs90MRfLd3NM0TPo4F99bhqbq7yxTcLC1Doy3e8LaVRDFY2JrcObukdxEk_VAMmFV5nDbQVoe2SPnN3ioB3Lu2tZY2lmUqknPlsXoW3oB2SvqpIPAxJjQwN_QVCd-e3NPFO-IDyHdD_zDtrvT9_82IHE-GqHUpdvEG_DlZ1bX5zqGT1bxiKodi4P0hRiJwIjaUQseVpN2soFL9tmRdbBZ6zT11zLkU5J-W4JbbNVjx'
                  />
                  <div>
                    <p className='text-xs font-bold text-primary uppercase'>Nhân viên xuất sắc</p>
                    <p className='text-md font-extrabold text-on-surface'>Trần Thị B</p>
                  </div>
                </div>
                <div className='pt-6 border-t border-surface-container'>
                  <div className='flex justify-between items-end mb-1'>
                    <p className='text-xs text-on-surface-variant'>Thời gian phản hồi TB</p>
                    <p className='text-lg font-extrabold text-on-surface'>15p</p>
                  </div>
                  <p className='text-[10px] text-green-600 font-bold'>↓ 4p so với tuần trước</p>
                </div>
                <div className='p-4 bg-secondary-fixed/30 rounded-2xl flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-on-secondary-fixed uppercase tracking-wider'>
                      Cần xử lý tiếp
                    </p>
                    <p className='text-sm font-bold text-on-surface'>Căn hộ 402 - Rò rỉ</p>
                  </div>
                  <span className='material-symbols-outlined text-primary'>arrow_forward_ios</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: Lists */}
          <div className='col-span-12 lg:col-span-4 space-y-8'>
            {/* Lists */}
            <div className='bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm'>
              <div className='flex items-center justify-between mb-8'>
                <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-on-surface-variant'>
                  Yêu cầu mới nhất
                </h4>
                <button className='text-[10px] font-bold text-primary hover:underline uppercase tracking-widest'>
                  Xem tất cả
                </button>
              </div>
              <div className='space-y-6'>
                <div className='flex items-center justify-between group cursor-pointer'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all'>
                      <span className='material-symbols-outlined'>lightbulb</span>
                    </div>
                    <div>
                      <p className='text-sm font-bold'>Căn hộ 1104 - Đèn chiếu sáng</p>
                      <p className='text-[10px] text-on-surface-variant'>Gửi 12 phút trước</p>
                    </div>
                  </div>
                  <span className='px-2 py-1 bg-surface-container text-[9px] font-bold rounded uppercase'>Thấp</span>
                </div>
                <div className='flex items-center justify-between group cursor-pointer'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 bg-error-container text-error rounded-xl flex items-center justify-center'>
                      <span className='material-symbols-outlined'>water_drop</span>
                    </div>
                    <div>
                      <p className='text-sm font-bold'>Yêu cầu #405</p>
                      <p className='text-[10px] text-error font-bold italic'>Sắp đến hạn (14:00)</p>
                    </div>
                  </div>
                  <span className='px-2 py-1 bg-error text-white text-[9px] font-bold rounded uppercase'>Cao</span>
                </div>
                <div className='flex items-center justify-between group cursor-pointer'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all'>
                      <span className='material-symbols-outlined'>ac_unit</span>
                    </div>
                    <div>
                      <p className='text-sm font-bold'>Căn hộ 8B - Kiểm tra điều hòa</p>
                      <p className='text-[10px] text-on-surface-variant'>Đã giao cho tôi</p>
                    </div>
                  </div>
                  <span className='px-2 py-1 bg-secondary text-white text-[9px] font-bold rounded uppercase'>
                    Trung bình
                  </span>
                </div>
                <div className='flex items-center justify-between group cursor-pointer'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all'>
                      <span className='material-symbols-outlined'>lock</span>
                    </div>
                    <div>
                      <p className='text-sm font-bold'>Reset khóa thông minh</p>
                      <p className='text-[10px] text-on-surface-variant'>Căn hộ 1402</p>
                    </div>
                  </div>
                  <span className='px-2 py-1 bg-surface-container text-[9px] font-bold rounded uppercase'>Thấp</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Charts */}
          <div className='col-span-12 lg:col-span-4 space-y-8'>
            {/* Bar Chart Priority */}
            <div className='bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm'>
              <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-on-surface-variant mb-8'>
                Phân bố ưu tiên
              </h4>
              <div className='flex items-end justify-around h-32 gap-4'>
                <div className='flex flex-col items-center gap-2 flex-1'>
                  <div className='w-full bg-error rounded-t-lg' style={{ height: '40%' }}></div>
                  <span className='text-[9px] font-bold uppercase tracking-tighter'>Cao</span>
                </div>
                <div className='flex flex-col items-center gap-2 flex-1'>
                  <div className='w-full bg-secondary rounded-t-lg' style={{ height: '75%' }}></div>
                  <span className='text-[9px] font-bold uppercase tracking-tighter'>Trung bình</span>
                </div>
                <div className='flex flex-col items-center gap-2 flex-1'>
                  <div className='w-full bg-primary-fixed-dim rounded-t-lg' style={{ height: '55%' }}></div>
                  <span className='text-[9px] font-bold uppercase tracking-tighter'>Thấp</span>
                </div>
              </div>
            </div>

            {/* Line Chart: Processing Time */}
            <div className='bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm relative overflow-hidden'>
              <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-on-surface-variant mb-4'>
                Thời gian xử lý TB
              </h4>
              <p className='text-3xl font-extrabold text-on-surface mb-6'>
                2.4<span className='text-sm font-normal text-on-surface-variant ml-1'>giờ</span>
              </p>
              {/* Pseudo-chart using SVG */}
              <svg className='w-full h-20' preserveAspectRatio='none' viewBox='0 0 100 20'>
                <path
                  d='M0 15 Q 10 12, 20 16 T 40 10 T 60 14 T 80 8 T 100 12'
                  fill='none'
                  stroke='#005ab7'
                  strokeWidth='2'
                />
                <path
                  d='M0 15 Q 10 12, 20 16 T 40 10 T 60 14 T 80 8 T 100 12 L 100 20 L 0 20 Z'
                  fill='rgba(0, 90, 183, 0.05)'
                />
              </svg>
              <div className='flex justify-between mt-2'>
                <span className='text-[8px] font-bold text-on-surface-variant uppercase'>08:00</span>
                <span className='text-[8px] font-bold text-on-surface-variant uppercase'>12:00</span>
                <span className='text-[8px] font-bold text-on-surface-variant uppercase'>16:00</span>
                <span className='text-[8px] font-bold text-on-surface-variant uppercase'>20:00</span>
              </div>
            </div>

            {/* Pie/Circle Chart: Requests by Apt */}
            <div className='bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm'>
              <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-on-surface-variant mb-6'>
                Yêu cầu theo khu vực
              </h4>
              <div className='flex items-center gap-6'>
                <div className='relative w-24 h-24'>
                  <svg className='w-full h-full -rotate-90' viewBox='0 0 36 36'>
                    <circle cx='18' cy='18' fill='none' r='16' stroke='#e0e3e5' strokeWidth='4'></circle>
                    <circle
                      cx='18'
                      cy='18'
                      fill='none'
                      r='16'
                      stroke='#005ab7'
                      strokeDasharray='60, 100'
                      strokeWidth='4'
                    ></circle>
                    <circle
                      cx='18'
                      cy='18'
                      fill='none'
                      r='16'
                      stroke='#476083'
                      strokeDasharray='20, 100'
                      strokeDashoffset='-60'
                      strokeWidth='4'
                    ></circle>
                  </svg>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-primary'></div>
                    <span className='text-[10px] font-bold'>Khu Bắc (60%)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-secondary'></div>
                    <span className='text-[10px] font-bold'>Khu Nam (20%)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-surface-container-highest'></div>
                    <span className='text-[10px] font-bold'>Tầng thượng (20%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Performance Chart (Bottom Span) */}
        <section className='mt-8'>
          <div className='bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm'>
            <div className='flex items-center justify-between mb-8'>
              <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-on-surface-variant'>
                Khối lượng yêu cầu theo tuần
              </h4>
              <div className='flex gap-4'>
                <span className='flex items-center gap-2 text-[10px] font-bold'>
                  <div className='w-2 h-2 bg-primary rounded-full'></div> Tổng yêu cầu
                </span>
                <span className='flex items-center gap-2 text-[10px] font-bold'>
                  <div className='w-2 h-2 bg-primary-fixed-dim rounded-full'></div> Đường cơ sở AI
                </span>
              </div>
            </div>
            <div className='flex items-end justify-between h-48 gap-8 px-4'>
              {/* Mon */}
              <div className='flex-1 flex flex-col items-center gap-3'>
                <div className='w-full flex flex-col justify-end gap-1 h-32'>
                  <div className='w-full bg-primary-fixed-dim rounded-lg' style={{ height: '40%' }}></div>
                  <div className='w-full bg-primary rounded-lg' style={{ height: '50%' }}></div>
                </div>
                <span className='text-[10px] font-bold text-on-surface-variant'>T2</span>
              </div>
              {/* Tue */}
              <div className='flex-1 flex flex-col items-center gap-3'>
                <div className='w-full flex flex-col justify-end gap-1 h-32'>
                  <div className='w-full bg-primary-fixed-dim rounded-lg' style={{ height: '45%' }}></div>
                  <div className='w-full bg-primary rounded-lg' style={{ height: '65%' }}></div>
                </div>
                <span className='text-[10px] font-bold text-on-surface-variant'>T3</span>
              </div>
              {/* Wed */}
              <div className='flex-1 flex flex-col items-center gap-3'>
                <div className='w-full flex flex-col justify-end gap-1 h-32'>
                  <div className='w-full bg-primary-fixed-dim rounded-lg' style={{ height: '40%' }}></div>
                  <div className='w-full bg-primary rounded-lg' style={{ height: '80%' }}></div>
                </div>
                <span className='text-[10px] font-bold text-on-surface-variant'>T4</span>
              </div>
              {/* Thu */}
              <div className='flex-1 flex flex-col items-center gap-3'>
                <div className='w-full flex flex-col justify-end gap-1 h-32'>
                  <div className='w-full bg-primary-fixed-dim rounded-lg' style={{ height: '50%' }}></div>
                  <div className='w-full bg-primary rounded-lg' style={{ height: '40%' }}></div>
                </div>
                <span className='text-[10px] font-bold text-on-surface-variant'>T5</span>
              </div>
              {/* Fri */}
              <div className='flex-1 flex flex-col items-center gap-3'>
                <div className='w-full flex flex-col justify-end gap-1 h-32'>
                  <div className='w-full bg-primary-fixed-dim rounded-lg' style={{ height: '35%' }}></div>
                  <div className='w-full bg-primary rounded-lg' style={{ height: '90%' }}></div>
                </div>
                <span className='text-[10px] font-bold text-on-surface-variant'>T6</span>
              </div>
              {/* Sat */}
              <div className='flex-1 flex flex-col items-center gap-3'>
                <div className='w-full flex flex-col justify-end gap-1 h-32'>
                  <div className='w-full bg-primary-fixed-dim rounded-lg' style={{ height: '20%' }}></div>
                  <div className='w-full bg-primary rounded-lg' style={{ height: '30%' }}></div>
                </div>
                <span className='text-[10px] font-bold text-on-surface-variant'>T7</span>
              </div>
              {/* Sun */}
              <div className='flex-1 flex flex-col items-center gap-3'>
                <div className='w-full flex flex-col justify-end gap-1 h-32'>
                  <div className='w-full bg-primary-fixed-dim rounded-lg' style={{ height: '15%' }}></div>
                  <div className='w-full bg-primary rounded-lg' style={{ height: '20%' }}></div>
                </div>
                <span className='text-[10px] font-bold text-on-surface-variant'>CN</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
