import React from 'react'

export default function HomePageSecurity() {
  return (
    <div className='text-on-surface'>
      {/* Main Content */}
      <main className='p-8 min-h-screen'>
        <div className='max-w-7xl mx-auto space-y-8'>
          {/* Overview Statistics */}
          <section className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-transparent hover:border-blue-100 transition-all'>
              <p className='text-label-md uppercase tracking-widest text-slate-500 text-[10px] font-bold'>
                Tổng số lượt quét hôm nay
              </p>
              <div className='mt-2 flex items-baseline justify-between'>
                <h2 className='text-3xl font-black text-slate-900'>1.248</h2>
                <span className='text-xs font-bold text-emerald-600 flex items-center'>
                  <span className='material-symbols-outlined text-sm mr-1'>arrow_upward</span> 12,4%
                </span>
              </div>
            </div>
            <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm'>
              <p className='text-label-md uppercase tracking-widest text-slate-500 text-[10px] font-bold'>
                Tỷ lệ thành công
              </p>
              <div className='mt-2 flex items-baseline justify-between'>
                <h2 className='text-3xl font-black text-slate-900'>98,2%</h2>
                <span className='text-[10px] text-slate-400'>1.226 tổng số</span>
              </div>
              <div className='mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden'>
                <div className='h-full bg-blue-600' style={{ width: '98.2%' }}></div>
              </div>
            </div>
            <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm'>
              <p className='text-label-md uppercase tracking-widest text-slate-500 text-[10px] font-bold'>
                Từ chối truy cập
              </p>
              <div className='mt-2 flex items-baseline justify-between'>
                <h2 className='text-3xl font-black text-slate-900'>22</h2>
                <span className='text-xs font-bold text-rose-600 flex items-center'>
                  <span className='material-symbols-outlined text-sm mr-1'>warning</span> +3 hôm nay
                </span>
              </div>
            </div>
            <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm'>
              <p className='text-label-md uppercase tracking-widest text-slate-500 text-[10px] font-bold'>
                Giờ cao điểm
              </p>
              <div className='mt-2'>
                <h2 className='text-xl font-bold text-slate-900'>08:00 - 09:00</h2>
                <p className='text-xs text-slate-500 font-medium'>45 lượt quét được ghi nhận</p>
              </div>
            </div>
          </section>

          {/* Activity Charts Section (Asymmetric Bento) */}
          <section className='grid grid-cols-12 gap-6 h-[400px]'>
            <div className='col-span-8 bg-white p-8 rounded-2xl shadow-sm relative overflow-hidden group'>
              <div className='flex justify-between items-start mb-8'>
                <div>
                  <h3 className='text-lg font-bold text-slate-900'>Lưu lượng quét theo giờ</h3>
                  <p className='text-xs text-slate-400'>Phân phối hoạt động qua các cổng</p>
                </div>
                <div className='flex space-x-2'>
                  <span className='w-2.5 h-2.5 rounded-full bg-blue-600'></span>
                  <span className='w-2.5 h-2.5 rounded-full bg-slate-200'></span>
                </div>
              </div>
              {/* Custom Chart Visual */}
              <div className='flex items-end justify-between h-48 px-4 gap-2'>
                <div className='w-full bg-slate-50 rounded-t-lg h-[20%] hover:bg-blue-100 transition-colors'></div>
                <div className='w-full bg-slate-50 rounded-t-lg h-[35%] hover:bg-blue-100 transition-colors'></div>
                <div className='w-full bg-slate-50 rounded-t-lg h-[45%] hover:bg-blue-100 transition-colors'></div>
                <div className='w-full bg-slate-50 rounded-t-lg h-[60%] hover:bg-blue-100 transition-colors'></div>
                <div className='w-full bg-blue-600 rounded-t-lg h-[90%] shadow-lg'></div>
                <div className='w-full bg-slate-50 rounded-t-lg h-[75%] hover:bg-blue-100 transition-colors'></div>
                <div className='w-full bg-slate-50 rounded-t-lg h-[50%] hover:bg-blue-100 transition-colors'></div>
                <div className='w-full bg-slate-50 rounded-t-lg h-[40%] hover:bg-blue-100 transition-colors'></div>
                <div className='w-full bg-slate-50 rounded-t-lg h-[30%] hover:bg-blue-100 transition-colors'></div>
                <div className='w-full bg-slate-50 rounded-t-lg h-[25%] hover:bg-blue-100 transition-colors'></div>
                <div className='w-full bg-slate-50 rounded-t-lg h-[15%] hover:bg-blue-100 transition-colors'></div>
                <div className='w-full bg-slate-50 rounded-t-lg h-[10%] hover:bg-blue-100 transition-colors'></div>
              </div>
              <div className='flex justify-between mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2'>
                <span>06:00</span>
                <span>08:00</span>
                <span>10:00</span>
                <span>12:00</span>
                <span>14:00</span>
                <span>16:00</span>
                <span>18:00</span>
              </div>
            </div>
            <div className='col-span-4 bg-slate-900 text-white p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between'>
              <div className='absolute top-0 right-0 p-8 opacity-20'>
                <span className='material-symbols-outlined text-8xl' data-icon='apartment'>
                  apartment
                </span>
              </div>
              <div>
                <h3 className='text-lg font-bold'>Phân bổ theo tòa nhà</h3>
                <p className='text-xs text-slate-400 mt-1'>So sánh khối lượng tương đối</p>
              </div>
              <div className='space-y-6'>
                <div>
                  <div className='flex justify-between text-xs mb-2'>
                    <span>Tòa A (Dân cư)</span>
                    <span>68%</span>
                  </div>
                  <div className='h-1 w-full bg-white/10 rounded-full'>
                    <div className='h-full bg-blue-400 w-[68%]'></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between text-xs mb-2'>
                    <span>Tòa B (Thương mại)</span>
                    <span>32%</span>
                  </div>
                  <div className='h-1 w-full bg-white/10 rounded-full'>
                    <div className='h-full bg-slate-400 w-[32%]'></div>
                  </div>
                </div>
              </div>
              <button className='w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors'>
                Xem chi tiết tòa nhà
              </button>
            </div>
          </section>

          {/* Alerts & Recent Logs */}
          <section className='grid grid-cols-12 gap-6'>
            {/* Alerts & Anomalies */}
            <div className='col-span-4 space-y-6'>
              <div className='bg-rose-50/50 p-6 rounded-2xl border border-rose-100'>
                <div className='flex items-center space-x-2 text-rose-600 mb-4'>
                  <span className='material-symbols-outlined' data-icon='error'>
                    error
                  </span>
                  <h3 className='text-sm font-bold uppercase tracking-wider'>Mã QR bị từ chối nhiều</h3>
                </div>
                <ul className='space-y-4'>
                  <li className='flex justify-between items-center text-xs'>
                    <div>
                      <p className='font-bold text-slate-900'>QR-7729 (Hết hạn)</p>
                      <p className='text-slate-500'>Thử 5 lần tại Cổng 02</p>
                    </div>
                    <span className='bg-rose-100 text-rose-700 px-2 py-1 rounded font-bold'>Đã gắn cờ</span>
                  </li>
                  <li className='flex justify-between items-center text-xs'>
                    <div>
                      <p className='font-bold text-slate-900'>QR-1092 (Bị chặn)</p>
                      <p className='text-slate-500'>Quản trị viên chặn thủ công</p>
                    </div>
                    <span className='bg-rose-100 text-rose-700 px-2 py-1 rounded font-bold'>Đã gắn cờ</span>
                  </li>
                </ul>
              </div>
              <div className='bg-surface-container-low p-6 rounded-2xl'>
                <div className='flex items-center space-x-2 text-on-surface mb-4'>
                  <span className='material-symbols-outlined' data-icon='radar'>
                    radar
                  </span>
                  <h3 className='text-sm font-bold uppercase tracking-wider'>Hoạt động bất thường</h3>
                </div>
                <div className='space-y-4'>
                  <div className='p-3 bg-white rounded-lg shadow-sm border-l-4 border-amber-400'>
                    <p className='text-xs font-bold text-slate-900'>Quét khách lúc nửa đêm</p>
                    <p className='text-[10px] text-slate-500 mt-1'>Cổng 04 • 03:14 • Căn 402B</p>
                  </div>
                  <div className='p-3 bg-white rounded-lg shadow-sm border-l-4 border-amber-400'>
                    <p className='text-xs font-bold text-slate-900'>Quét nhanh nhiều lần</p>
                    <p className='text-[10px] text-slate-500 mt-1'>Cổng 01 • 4 lần trong 2 phút</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Scans Table */}
            <div className='col-span-8 bg-white rounded-2xl shadow-sm p-8'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='text-lg font-bold text-slate-900'>Nhật ký quét gần đây</h3>
                <button className='text-blue-600 text-xs font-bold hover:underline'>Xem tất cả</button>
              </div>
              <table className='w-full text-left'>
                <thead>
                  <tr className='border-b border-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black'>
                    <th className='pb-4 px-2'>Thời gian</th>
                    <th className='pb-4 px-2'>Người dùng / Tên</th>
                    <th className='pb-4 px-2'>Căn hộ</th>
                    <th className='pb-4 px-2'>Kết quả</th>
                    <th className='pb-4 px-2'>Cổng</th>
                  </tr>
                </thead>
                <tbody className='text-sm'>
                  <tr className='border-b border-slate-50/50 hover:bg-slate-50/50 transition-colors'>
                    <td className='py-4 px-2 font-medium'>14:22:01</td>
                    <td className='py-4 px-2'>
                      <div className='flex items-center'>
                        <div className='w-6 h-6 bg-blue-100 rounded-full mr-2 flex items-center justify-center text-[10px] font-bold text-blue-700'>
                          JS
                        </div>
                        James Stevenson
                      </div>
                    </td>
                    <td className='py-4 px-2 text-slate-500'>202A</td>
                    <td className='py-4 px-2'>
                      <span className='inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1'></span>
                      <span className='text-emerald-700 font-bold text-xs'>Thành công</span>
                    </td>
                    <td className='py-4 px-2 text-slate-500'>Cổng 01</td>
                  </tr>
                  <tr className='border-b border-slate-50/50 hover:bg-slate-50/50 transition-colors'>
                    <td className='py-4 px-2 font-medium'>14:18:45</td>
                    <td className='py-4 px-2'>
                      <div className='flex items-center'>
                        <div className='w-6 h-6 bg-slate-100 rounded-full mr-2 flex items-center justify-center text-[10px] font-bold text-slate-700'>
                          GK
                        </div>
                        Khách: Kyle R.
                      </div>
                    </td>
                    <td className='py-4 px-2 text-slate-500'>505C</td>
                    <td className='py-4 px-2'>
                      <span className='inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1'></span>
                      <span className='text-emerald-700 font-bold text-xs'>Thành công</span>
                    </td>
                    <td className='py-4 px-2 text-slate-500'>Cổng 02</td>
                  </tr>
                  <tr className='border-b border-slate-50/50 hover:bg-slate-50/50 transition-colors'>
                    <td className='py-4 px-2 font-medium'>14:15:20</td>
                    <td className='py-4 px-2'>
                      <div className='flex items-center'>
                        <div className='w-6 h-6 bg-rose-100 rounded-full mr-2 flex items-center justify-center text-[10px] font-bold text-rose-700'>
                          UK
                        </div>
                        Không xác định
                      </div>
                    </td>
                    <td className='py-4 px-2 text-slate-500'>---</td>
                    <td className='py-4 px-2'>
                      <span className='inline-block w-2 h-2 rounded-full bg-rose-500 mr-1'></span>
                      <span className='text-rose-700 font-bold text-xs'>Từ chối</span>
                    </td>
                    <td className='py-4 px-2 text-slate-500'>Cổng 01</td>
                  </tr>
                  <tr className='border-b border-slate-50/50 hover:bg-slate-50/50 transition-colors'>
                    <td className='py-4 px-2 font-medium'>14:12:11</td>
                    <td className='py-4 px-2'>
                      <div className='flex items-center'>
                        <div className='w-6 h-6 bg-blue-100 rounded-full mr-2 flex items-center justify-center text-[10px] font-bold text-blue-700'>
                          MS
                        </div>
                        Maria Santos
                      </div>
                    </td>
                    <td className='py-4 px-2 text-slate-500'>101A</td>
                    <td className='py-4 px-2'>
                      <span className='inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1'></span>
                      <span className='text-emerald-700 font-bold text-xs'>Thành công</span>
                    </td>
                    <td className='py-4 px-2 text-slate-500'>Cổng chính</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Intelligence Modules */}
          <section className='grid grid-cols-12 gap-6'>
            {/* AI Smart Insights */}
            <div className='col-span-7 bg-white p-8 rounded-2xl relative overflow-hidden'>
              <div className='absolute -right-12 -top-12 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50'></div>
              <div className='flex items-center space-x-3 mb-6 relative'>
                <span
                  className='material-symbols-outlined text-blue-600'
                  data-icon='auto_awesome'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <h3 className='text-lg font-bold text-slate-900'>Thông tin chi tiết từ AI</h3>
              </div>
              <div className='space-y-6 relative'>
                <div className='flex gap-4'>
                  <div className='w-1 bg-blue-600 rounded-full'></div>
                  <div>
                    <p className='text-sm font-bold text-slate-900'>Phát hiện mẫu bất thường tại Tòa B.</p>
                    <p className='text-xs text-on-surface-variant mt-1 leading-relaxed'>
                      Lượng khách vào đã tăng 40% so với trung bình các ngày thứ Ba trước đây. Đề xuất giám sát Cổng 04
                      để phát hiện xe giao hàng trái phép.
                    </p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='w-1 bg-slate-200 rounded-full'></div>
                  <div>
                    <p className='text-sm font-bold text-slate-900'>Dự đoán giờ cao điểm</p>
                    <p className='text-xs text-on-surface-variant mt-1 leading-relaxed'>
                      Dựa trên lịch sự kiện địa phương, lưu lượng cao điểm ngày mai dự kiến vào{' '}
                      <span className='text-blue-600 font-bold'>17:30 - 19:00</span> với ước tính hơn 85 lượt quét.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fast Info Grid */}
            <div className='col-span-5 grid grid-cols-2 gap-4'>
              <div className='bg-secondary-fixed p-6 rounded-2xl flex flex-col justify-between'>
                <p className='text-[10px] font-black uppercase tracking-widest text-on-secondary-fixed-variant'>
                  Cư dân đang hoạt động
                </p>
                <div>
                  <h4 className='text-3xl font-black text-on-secondary-fixed'>2.410</h4>
                  <p className='text-[10px] text-on-secondary-fixed-variant mt-1'>Đã xác minh trong hệ thống</p>
                </div>
              </div>
              <div className='bg-surface-container-highest p-6 rounded-2xl flex flex-col justify-between'>
                <p className='text-[10px] font-black uppercase tracking-widest text-on-surface-variant'>
                  Mã QR đang hoạt động
                </p>
                <div>
                  <div className='flex justify-between text-xs font-bold mb-1'>
                    <span>Cá nhân</span>
                    <span>1.822</span>
                  </div>
                  <div className='flex justify-between text-xs font-bold'>
                    <span>Khách</span>
                    <span>588</span>
                  </div>
                </div>
              </div>
              <div className='col-span-2 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600'>
                    <span className='material-symbols-outlined'>health_and_safety</span>
                  </div>
                  <div>
                    <p className='text-sm font-bold text-slate-900'>Điểm toàn vẹn cổng</p>
                    <p className='text-xs text-slate-500'>Tất cả phần cứng hoạt động (100%)</p>
                  </div>
                </div>
                <span className='text-2xl font-black text-slate-900'>99,9</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
