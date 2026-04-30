import React from 'react'

export default function HomePageAdmin() {
  return (
    <div className='bg-surface text-on-surface min-h-screen'>
      {/* Main Content - Bỏ header và sidebar, chỉ giữ phần nội dung chính */}
      <div className='p-8 space-y-8 max-w-[1600px] mx-auto w-full'>
        {/* Dashboard Title Section */}
        <section className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
          <div>
            <h2 className='text-3xl font-extrabold tracking-tight text-on-surface'>Tổng quan chủ sở hữu</h2>
            <p className='text-on-surface-variant font-medium mt-1'>
              Hiệu suất danh mục đầu tư cho <span className='text-primary font-bold'>Azure Plaza &amp; Parkview</span>
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <span className='text-xs font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-full'>
              Kỳ: 30 ngày qua
            </span>
          </div>
        </section>

        {/* 1. Stats Grid (Overview) */}
        <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
          <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm shadow-blue-900/5 flex flex-col justify-between'>
            <span className='material-symbols-outlined text-primary mb-4'>apartment</span>
            <div>
              <p className='text-label-md uppercase tracking-widest text-on-surface-variant text-[10px] font-bold'>
                Tổng số tòa nhà
              </p>
              <h3 className='text-2xl font-extrabold mt-1'>4</h3>
            </div>
          </div>
          <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm shadow-blue-900/5 flex flex-col justify-between'>
            <span className='material-symbols-outlined text-primary mb-4'>home</span>
            <div>
              <p className='text-label-md uppercase tracking-widest text-on-surface-variant text-[10px] font-bold'>
                Tổng số căn hộ
              </p>
              <h3 className='text-2xl font-extrabold mt-1'>284</h3>
            </div>
          </div>
          <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm shadow-blue-900/5 flex flex-col justify-between'>
            <span className='material-symbols-outlined text-primary mb-4'>group</span>
            <div>
              <p className='text-label-md uppercase tracking-widest text-on-surface-variant text-[10px] font-bold'>
                Tổng cư dân
              </p>
              <h3 className='text-2xl font-extrabold mt-1'>1.120</h3>
            </div>
          </div>
          <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm shadow-blue-900/5 flex flex-col justify-between'>
            <span className='material-symbols-outlined text-primary mb-4'>analytics</span>
            <div>
              <p className='text-label-md uppercase tracking-widest text-on-surface-variant text-[10px] font-bold'>
                Tỷ lệ lấp đầy
              </p>
              <h3 className='text-2xl font-extrabold mt-1'>94%</h3>
            </div>
          </div>
          <div className='bg-gradient-to-br from-primary to-primary-container p-6 rounded-xl shadow-lg shadow-blue-900/10 flex flex-col justify-between text-white'>
            <span className='material-symbols-outlined mb-4'>payments</span>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-widest opacity-80'>Doanh thu tháng này</p>
              <h3 className='text-2xl font-extrabold mt-1'>$4.2M</h3>
              <p className='text-[10px] font-bold text-blue-100 mt-1 flex items-center gap-1'>
                <span className='material-symbols-outlined text-[14px]'>trending_up</span> +12,4% so với tháng trước
              </p>
            </div>
          </div>
        </section>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          {/* 2. Charts Section (Bento Grid) */}
          <div className='lg:col-span-8 space-y-8'>
            {/* Main Revenue Chart */}
            <div className='bg-surface-container-lowest p-8 rounded-xl shadow-sm'>
              <div className='flex justify-between items-center mb-10'>
                <h4 className='font-bold text-lg tracking-tight'>Doanh thu 12 tháng</h4>
                <div className='flex gap-4'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full bg-primary'></div>
                    <span className='text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                      Doanh thu
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full bg-secondary-container'></div>
                    <span className='text-xs font-bold text-on-surface-variant uppercase tracking-wider'>
                      Tăng trưởng
                    </span>
                  </div>
                </div>
              </div>
              <div className='h-64 flex items-end justify-between gap-2 px-2'>
                {/* Dummy Chart Bars */}
                <div className='w-full bg-surface-container-low rounded-t-lg h-[40%] hover:bg-primary transition-colors'></div>
                <div className='w-full bg-surface-container-low rounded-t-lg h-[55%] hover:bg-primary transition-colors'></div>
                <div className='w-full bg-surface-container-low rounded-t-lg h-[45%] hover:bg-primary transition-colors'></div>
                <div className='w-full bg-surface-container-low rounded-t-lg h-[70%] hover:bg-primary transition-colors'></div>
                <div className='w-full bg-surface-container-low rounded-t-lg h-[65%] hover:bg-primary transition-colors'></div>
                <div className='w-full bg-primary rounded-t-lg h-[95%]'></div>
                <div className='w-full bg-surface-container-low rounded-t-lg h-[85%] hover:bg-primary transition-colors'></div>
                <div className='w-full bg-surface-container-low rounded-t-lg h-[75%] hover:bg-primary transition-colors'></div>
                <div className='w-full bg-surface-container-low rounded-t-lg h-[60%] hover:bg-primary transition-colors'></div>
                <div className='w-full bg-surface-container-low rounded-t-lg h-[50%] hover:bg-primary transition-colors'></div>
                <div className='w-full bg-surface-container-low rounded-t-lg h-[80%] hover:bg-primary transition-colors'></div>
                <div className='w-full bg-surface-container-low rounded-t-lg h-[90%] hover:bg-primary transition-colors'></div>
              </div>
              <div className='flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-2'>
                <span>Th1</span>
                <span>Th2</span>
                <span>Th3</span>
                <span>Th4</span>
                <span>Th5</span>
                <span>Th6</span>
                <span>Th7</span>
                <span>Th8</span>
                <span>Th9</span>
                <span>Th10</span>
                <span>Th11</span>
                <span>Th12</span>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              {/* Revenue Structure Pie */}
              <div className='bg-surface-container-lowest p-8 rounded-xl shadow-sm'>
                <h4 className='font-bold text-lg tracking-tight mb-6'>Cơ cấu nguồn thu</h4>
                <div className='flex items-center justify-center relative py-4'>
                  <div className='w-32 h-32 rounded-full border-[16px] border-primary border-r-secondary border-b-secondary-container border-l-primary-fixed'></div>
                  <div className='absolute inset-0 flex flex-col items-center justify-center'>
                    <span className='text-xs font-bold text-on-surface-variant uppercase'>Tổng</span>
                    <span className='text-lg font-black'>$4.2M</span>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4 mt-8'>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-primary'></div>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-on-surface-variant'>
                      Phí dịch vụ
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-secondary'></div>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-on-surface-variant'>
                      Điện nước
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-secondary-container'></div>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-on-surface-variant'>
                      Giữ xe
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-primary-fixed'></div>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-on-surface-variant'>Khác</span>
                  </div>
                </div>
              </div>

              {/* Debts by Building */}
              <div className='bg-surface-container-lowest p-8 rounded-xl shadow-sm'>
                <h4 className='font-bold text-lg tracking-tight mb-6'>Công nợ theo tòa nhà</h4>
                <div className='space-y-6'>
                  <div>
                    <div className='flex justify-between mb-2'>
                      <span className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
                        Azure Plaza
                      </span>
                      <span className='text-xs font-bold'>$120k</span>
                    </div>
                    <div className='w-full h-2 bg-surface-container-low rounded-full overflow-hidden'>
                      <div className='bg-primary h-full w-[45%]'></div>
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-between mb-2'>
                      <span className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
                        Parkview Lofts
                      </span>
                      <span className='text-xs font-bold'>$85k</span>
                    </div>
                    <div className='w-full h-2 bg-surface-container-low rounded-full overflow-hidden'>
                      <div className='bg-primary h-full w-[30%]'></div>
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-between mb-2'>
                      <span className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
                        Tòa nhà C
                      </span>
                      <span className='text-xs font-bold'>$142k</span>
                    </div>
                    <div className='w-full h-2 bg-surface-container-low rounded-full overflow-hidden'>
                      <div className='bg-primary h-full w-[55%]'></div>
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-between mb-2'>
                      <span className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
                        Tòa nhà B
                      </span>
                      <span className='text-xs font-bold'>$210k</span>
                    </div>
                    <div className='w-full h-2 bg-surface-container-low rounded-full overflow-hidden'>
                      <div className='bg-error h-full w-[85%]'></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Sidebar Sections (Alerts & Insights) */}
          <div className='lg:col-span-4 space-y-8'>
            {/* AI Intelligence Insights */}
            <div
              className='glass-insight p-8 rounded-2xl border border-white/40'
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 32px 64px -12px rgba(68, 93, 128, 0.08)'
              }}
            >
              <div className='flex items-center gap-3 mb-6'>
                <span
                  className='material-symbols-outlined text-primary p-2 bg-primary-fixed rounded-xl'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  psychology
                </span>
                <h4 className='font-extrabold text-lg tracking-tight'>Thông tin từ AI</h4>
              </div>
              <div className='space-y-6'>
                <div className='bg-secondary-fixed/50 p-4 rounded-xl'>
                  <p className='text-sm font-medium text-on-secondary-fixed-variant leading-relaxed'>
                    "Dự báo quý tới doanh thu tăng 12% nếu duy trì tỷ lệ lấp đầy hiện tại"
                  </p>
                </div>
                <div className='bg-error-container/30 p-4 rounded-xl'>
                  <p className='text-sm font-medium text-on-error-container leading-relaxed'>
                    "Tòa nhà B có tỷ lệ nợ cao bất thường, nên kiểm tra quản lý thu phí"
                  </p>
                </div>
                <div className='bg-secondary-fixed/50 p-4 rounded-xl'>
                  <p className='text-sm font-medium text-on-secondary-fixed-variant leading-relaxed'>
                    "Phát hiện 8 hợp đồng sắp hết hạn trong tháng này, cần chủ động gia hạn"
                  </p>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className='bg-surface-container-lowest p-8 rounded-xl shadow-sm space-y-4'>
              <h4 className='font-bold text-lg tracking-tight mb-2'>Cảnh báo &amp; Bất thường</h4>
              <div className='flex items-start gap-4 p-4 rounded-xl bg-error-container/20 border-l-4 border-error'>
                <span className='material-symbols-outlined text-error mt-0.5'>warning</span>
                <div>
                  <p className='text-sm font-bold text-on-error-container'>Công nợ quá hạn: 32%</p>
                  <p className='text-xs text-on-error-container/70 mt-1'>Vượt ngưỡng an toàn 30%</p>
                </div>
              </div>
              <div className='flex items-start gap-4 p-4 rounded-xl bg-error-container/20 border-l-4 border-error'>
                <span className='material-symbols-outlined text-error mt-0.5'>report</span>
                <div>
                  <p className='text-sm font-bold text-on-error-container'>Tòa nhà B: Thanh toán thấp</p>
                  <p className='text-xs text-on-error-container/70 mt-1'>Hiện đạt 68%, thấp nhất chuỗi</p>
                </div>
              </div>
              <div className='flex items-start gap-4 p-4 rounded-xl bg-tertiary-fixed/30 border-l-4 border-tertiary'>
                <span className='material-symbols-outlined text-tertiary mt-0.5'>notifications_active</span>
                <div>
                  <p className='text-sm font-bold text-on-tertiary-fixed-variant'>24 yêu cầu bảo trì</p>
                  <p className='text-xs text-on-tertiary-fixed-variant/70 mt-1'>Chưa xử lý trong hơn 3 ngày</p>
                </div>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-surface-container-low p-5 rounded-xl'>
                <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant'>
                  Doanh thu cao nhất
                </p>
                <p className='text-sm font-bold mt-1'>Azure Plaza</p>
              </div>
              <div className='bg-surface-container-low p-5 rounded-xl'>
                <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant'>
                  Mã QR đang hoạt động
                </p>
                <p className='text-sm font-bold mt-1'>2.410</p>
              </div>
              <div className='bg-surface-container-low p-5 rounded-xl'>
                <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant'>
                  Nhân viên đang hoạt động
                </p>
                <p className='text-sm font-bold mt-1'>42 Chuyên gia</p>
              </div>
              <div className='bg-surface-container-low p-5 rounded-xl'>
                <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant'>Trạng thái</p>
                <div className='flex items-center gap-2 mt-1'>
                  <div className='w-2 h-2 rounded-full bg-emerald-500'></div>
                  <p className='text-sm font-bold'>Ổn định</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Recent Lists & Asymmetric Content */}
        <section className='grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12'>
          {/* Recent Transactions (List) */}
          <div className='lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm'>
            <h4 className='font-bold text-lg tracking-tight mb-8'>Danh sách gần đây</h4>
            <div className='overflow-x-auto'>
              <table className='w-full text-left'>
                <thead>
                  <tr className='border-b border-outline-variant/10'>
                    <th className='pb-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant'>
                      Hạng mục
                    </th>
                    <th className='pb-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant'>
                      Chi tiết
                    </th>
                    <th className='pb-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant'>
                      Giá trị
                    </th>
                    <th className='pb-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant'>
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-outline-variant/5'>
                  <tr>
                    <td className='py-5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center'>
                          <span className='material-symbols-outlined text-primary text-sm'>apartment</span>
                        </div>
                        <span className='text-sm font-bold'>Tòa nhà mới</span>
                      </div>
                    </td>
                    <td className='py-5 text-sm'>Azure Plaza, Parkview Lofts</td>
                    <td className='py-5 text-sm font-bold'>$12.4M Port.</td>
                    <td className='py-5'>
                      <span className='text-[10px] font-bold uppercase tracking-widest bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full'>
                        Đang triển khai
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className='py-5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center'>
                          <span className='material-symbols-outlined text-secondary text-sm'>paid</span>
                        </div>
                        <span className='text-sm font-bold'>Giao dịch lớn nhất</span>
                      </div>
                    </td>
                    <td className='py-5 text-sm'>Phí quản lý năm - Unit 1204</td>
                    <td className='py-5 text-sm font-bold text-primary'>$12,400</td>
                    <td className='py-5'>
                      <span className='text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full'>
                        Thành công
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className='py-5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-lg bg-error-container/40 flex items-center justify-center'>
                          <span className='material-symbols-outlined text-error text-sm'>history_edu</span>
                        </div>
                        <span className='text-sm font-bold'>Hợp đồng hết hạn</span>
                      </div>
                    </td>
                    <td className='py-5 text-sm'>8 cư dân (Azure Plaza)</td>
                    <td className='py-5 text-sm font-bold'>Trong 30 ngày</td>
                    <td className='py-5'>
                      <span className='text-[10px] font-bold uppercase tracking-widest bg-error-container text-on-error-container px-3 py-1 rounded-full'>
                        Khẩn cấp
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Featured Image / Property Card */}
          <div className='relative rounded-2xl overflow-hidden group'>
            <img
              alt='Azure Plaza Building'
              className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuD1HPTYFWwhUfv3fYbeXM-f8yanOVPLqiRRdXJhKqWxpByTYdF4sRrd60DbYtHk9yCdHqdM4INCAeMNcsug9pQ7Rab4QIyeJ1UT4QODQ5ofAhsfmgVcLZP1NVP9_eHQ4wz7lCbUq9FzhFh3R5QXn6Z44to37lqfhHOVbn94_9oODE0QCgETlJPrWSzqjy6CndeHzqFYnDpshbJrVn5X7i67Pm9hKQjeO0POppcbiaSlLbUhQWkJ8vig5QKHfetiItjUpZEe81_iQPfx'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent'></div>
            <div className='absolute bottom-0 left-0 right-0 p-8'>
              <span className='text-[10px] font-bold uppercase tracking-widest text-white/70'>Hoạt động tốt nhất</span>
              <h5 className='text-2xl font-black text-white mt-1'>Azure Plaza</h5>
              <p className='text-white/80 text-sm mt-2 font-medium'>98,5% lấp đầy • $1.2M Doanh thu</p>
              <button className='mt-6 text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 group/btn'>
                Xem hồ sơ tòa nhà
                <span className='material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform'>
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
