import React, { useState, useEffect } from 'react'
import { dashboardApi } from 'src/apis/dashboard_api/dashboard.api'
import type { DashboardStats } from 'src/types/dashboard.type'

export default function HomePageStaff() {
  const [data, setData] = useState<DashboardStats>({
    overviewCards: { pending: 0, inProgress: 0, doneToday: 0, overdue: 0, myTasks: 0 },
    charts: { byPriority: [], byApartment: [] },
    alerts: { highPriorityOverdue: 0, overloadedTechs: 0 },
    performance: {}
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true)
        const response = await dashboardApi.getDashboardStats()
        const result = response.data
        if (result.status === 'success' || result.data) {
          setData(result.data)
        }
      } catch (error) {
        console.error('Lỗi khi kéo dữ liệu thống kê:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardStats()
  }, [])

  const getPriorityHeight = (level: string) => {
    if (!data.charts?.byPriority || data.charts.byPriority.length === 0) return '10%'
    const total = data.charts.byPriority.reduce((sum, item) => sum + Number(item.count), 0) || 1
    const found = data.charts.byPriority.find((p: any) => p.priority === level)
    const count = found ? Number(found.count) : 0
    return `${Math.max((count / total) * 100, 15)}%`
  }

  const getPriorityCount = (level: string) => {
    const found = data.charts?.byPriority?.find((p: any) => p.priority === level)
    return found ? found.count : 0
  }

  return (
    <div className='bg-surface text-on-surface antialiased overflow-x-hidden'>
      <main className='pt-10 p-8 min-h-screen'>
        {/* Banner AI */}
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
                <p className='text-on-surface-variant max-w-2xl mt-1'>
                  Hôm nay có{' '}
                  <span className='font-bold text-primary'>{data.overviewCards.pending} yêu cầu chờ xử lý</span>. Bạn
                  đang có <span className='font-bold text-error'>{data.overviewCards.overdue} yêu cầu quá hạn</span> —
                  hãy ưu tiên giải quyết ngay nhé!
                </p>
              </div>
            </div>
            <div className='absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl'></div>
          </div>
        </section>

        {/* 5 Thẻ Overview */}
        <section className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-10'>
          <div className='bg-white p-6 rounded-3xl transition-transform hover:scale-[1.02] cursor-default shadow-sm border border-gray-50'>
            <p className='text-label-md text-on-surface-variant font-bold uppercase tracking-widest text-[10px] mb-2'>
              Chờ xử lý
            </p>
            <div className='flex items-baseline gap-2'>
              <span className='text-4xl font-extrabold text-on-surface'>
                {isLoading ? '...' : data.overviewCards.pending}
              </span>
              <span className='text-primary material-symbols-outlined text-sm'>schedule</span>
            </div>
            <div className='mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden'>
              <div className='bg-primary h-full w-2/3'></div>
            </div>
          </div>
          <div className='bg-white p-6 rounded-3xl transition-transform hover:scale-[1.02] cursor-default shadow-sm border border-gray-50'>
            <p className='text-label-md text-on-surface-variant font-bold uppercase tracking-widest text-[10px] mb-2'>
              Đang xử lý
            </p>
            <div className='flex items-baseline gap-2'>
              <span className='text-4xl font-extrabold text-on-surface'>
                {isLoading ? '...' : data.overviewCards.inProgress}
              </span>
              <span className='text-secondary material-symbols-outlined text-sm'>sync</span>
            </div>
            <div className='mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden'>
              <div className='bg-secondary h-full w-1/2'></div>
            </div>
          </div>
          <div className='bg-white p-6 rounded-3xl transition-transform hover:scale-[1.02] cursor-default shadow-sm border border-gray-50'>
            <p className='text-label-md text-on-surface-variant font-bold uppercase tracking-widest text-[10px] mb-2'>
              Hoàn thành hôm nay
            </p>
            <div className='flex items-baseline gap-2'>
              <span className='text-4xl font-extrabold text-on-surface'>
                {isLoading ? '...' : data.overviewCards.doneToday}
              </span>
              <span className='text-green-500 material-symbols-outlined text-sm'>check_circle</span>
            </div>
            <div className='mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden'>
              <div className='bg-green-500 h-full w-1/3'></div>
            </div>
          </div>
          <div className='bg-white p-6 rounded-3xl transition-transform hover:scale-[1.02] cursor-default border border-error/10 shadow-sm'>
            <p className='text-label-md text-error font-bold uppercase tracking-widest text-[10px] mb-2'>Quá hạn</p>
            <div className='flex items-baseline gap-2'>
              <span className='text-4xl font-extrabold text-error'>
                {isLoading ? '...' : data.overviewCards.overdue}
              </span>
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
              <span className='text-4xl font-extrabold'>{isLoading ? '...' : data.overviewCards.myTasks}</span>
              <span className='material-symbols-outlined text-sm'>assignment_ind</span>
            </div>
            <p className='mt-4 text-[10px] font-medium opacity-80'>Cập nhật realtime</p>
          </div>
        </section>

        <div className='grid grid-cols-12 gap-8'>
          {/* CỘT TRÁI */}
          <div className='col-span-12 lg:col-span-4 space-y-8'>
            {/* Cảnh báo (Dynamic) */}
            <div className='bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50'>
              <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-on-surface-variant mb-6'>
                Cảnh báo quan trọng
              </h4>
              <div className='space-y-4'>
                <div className='flex items-start gap-4 group cursor-pointer'>
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${data.alerts?.highPriorityOverdue > 0 ? 'bg-error animate-pulse' : 'bg-green-500'}`}
                  ></div>
                  <div>
                    <p className='text-sm font-bold text-on-surface group-hover:text-primary transition-colors'>
                      Ưu tiên CAO chưa xử lý &gt; 2h
                    </p>
                    <p className='text-xs text-on-surface-variant'>
                      {data.alerts?.highPriorityOverdue > 0
                        ? `Đang có ${data.alerts.highPriorityOverdue} yêu cầu khẩn cấp bị trễ!`
                        : 'Không có yêu cầu khẩn cấp bị trễ.'}
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-4 group cursor-pointer'>
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${data.alerts?.overloadedTechs > 0 ? 'bg-orange-500' : 'bg-green-500'}`}
                  ></div>
                  <div>
                    <p className='text-sm font-bold text-on-surface group-hover:text-primary transition-colors'>
                      Kỹ thuật viên quá tải
                    </p>
                    <p className='text-xs text-on-surface-variant'>
                      {data.alerts?.overloadedTechs > 0
                        ? `Có ${data.alerts.overloadedTechs} nhân viên đang ôm > 3 việc.`
                        : 'Khối lượng công việc phân bổ đều.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hiệu suất nhanh (Static UI cho đẹp) */}
            <div className='bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50'>
              <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-on-surface-variant mb-6'>
                Hiệu suất nhanh
              </h4>
              <div className='space-y-6'>
                <div className='pt-2 border-surface-container'>
                  <div className='flex justify-between items-end mb-1'>
                    <p className='text-xs text-on-surface-variant'>Thời gian phản hồi TB</p>
                    <p className='text-lg font-extrabold text-on-surface'>15p</p>
                  </div>
                  <p className='text-[10px] text-green-600 font-bold'>↓ 4p so với tuần trước</p>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT GIỮA */}
          <div className='col-span-12 lg:col-span-4 space-y-8'>
            {/* Top Căn hộ (Dynamic) */}
            <div className='bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50'>
              <div className='flex items-center justify-between mb-8'>
                <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-on-surface-variant'>
                  Top Căn hộ báo sự cố
                </h4>
              </div>
              <div className='space-y-6'>
                {data.charts?.byApartment?.length > 0 ? (
                  data.charts.byApartment.map((apt: any, index: number) => (
                    <div key={index} className='flex items-center justify-between group cursor-pointer'>
                      <div className='flex items-center gap-4'>
                        <div className='w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-on-surface-variant'>
                          <span className='material-symbols-outlined'>apartment</span>
                        </div>
                        <div>
                          <p className='text-sm font-bold'>Căn hộ {apt.apartmentCode}</p>
                        </div>
                      </div>
                      <span className='px-2 py-1 bg-error/10 text-error text-[10px] font-bold rounded uppercase'>
                        {apt.count} yêu cầu
                      </span>
                    </div>
                  ))
                ) : (
                  <p className='text-xs text-on-surface-variant'>Chưa có thống kê.</p>
                )}
              </div>
            </div>

            {/* Yêu cầu mới nhất (Static UI) */}
            <div className='bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50'>
              <div className='flex items-center justify-between mb-8'>
                <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-on-surface-variant'>
                  Yêu cầu mới nhất
                </h4>
              </div>
              <div className='space-y-6'>
                <div className='flex items-center justify-between group cursor-pointer'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all'>
                      <span className='material-symbols-outlined'>lightbulb</span>
                    </div>
                    <div>
                      <p className='text-sm font-bold'>Đèn chiếu sáng hành lang</p>
                      <p className='text-[10px] text-on-surface-variant'>Căn 1104 - 12 phút trước</p>
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
                      <p className='text-sm font-bold'>Rò rỉ nước ống dẫn</p>
                      <p className='text-[10px] text-error font-bold italic'>Căn 405 - Sắp đến hạn</p>
                    </div>
                  </div>
                  <span className='px-2 py-1 bg-error text-white text-[9px] font-bold rounded uppercase'>Cao</span>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className='col-span-12 lg:col-span-4 space-y-8'>
            {/* Biểu đồ Ưu tiên (Dynamic & Đã fix CSS) */}
            <div className='bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50'>
              <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-gray-500 mb-8'>
                Phân bố ưu tiên
              </h4>
              <div className='flex items-end justify-center h-40 gap-8'>
                <div className='flex flex-col items-center justify-end gap-2 h-full group'>
                  <span className='text-[12px] font-bold text-error opacity-0 group-hover:opacity-100 transition-opacity mb-1'>
                    {getPriorityCount('HIGH')}
                  </span>
                  <div
                    className='w-12 bg-error rounded-t-xl transition-all duration-500 shadow-sm group-hover:brightness-110'
                    style={{ height: getPriorityHeight('HIGH') }}
                  ></div>
                  <span className='text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2'>Cao</span>
                </div>
                <div className='flex flex-col items-center justify-end gap-2 h-full group'>
                  <span className='text-[12px] font-bold text-secondary opacity-0 group-hover:opacity-100 transition-opacity mb-1'>
                    {getPriorityCount('MEDIUM')}
                  </span>
                  <div
                    className='w-12 bg-secondary rounded-t-xl transition-all duration-500 shadow-sm group-hover:brightness-110'
                    style={{ height: getPriorityHeight('MEDIUM') }}
                  ></div>
                  <span className='text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2'>Thường</span>
                </div>
                <div className='flex flex-col items-center justify-end gap-2 h-full group'>
                  <span className='text-[12px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity mb-1'>
                    {getPriorityCount('LOW')}
                  </span>
                  <div
                    className='w-12 bg-primary/60 rounded-t-xl transition-all duration-500 shadow-sm group-hover:brightness-110'
                    style={{ height: getPriorityHeight('LOW') }}
                  ></div>
                  <span className='text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2'>Thấp</span>
                </div>
              </div>
            </div>

            {/* Thời gian xử lý TB (Static SVG) */}
            <div className='bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 relative overflow-hidden'>
              <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-on-surface-variant mb-4'>
                Thời gian xử lý TB
              </h4>
              <p className='text-3xl font-extrabold text-on-surface mb-6'>
                2.4<span className='text-sm font-normal text-on-surface-variant ml-1'>giờ</span>
              </p>
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
            </div>
          </div>
        </div>

        {/* Biểu đồ tuần (Static) */}
        <section className='mt-8'>
          <div className='bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50'>
            <div className='flex items-center justify-between mb-8'>
              <h4 className='text-label-md font-extrabold uppercase tracking-widest text-[11px] text-on-surface-variant'>
                Khối lượng yêu cầu theo tuần
              </h4>
            </div>
            <div className='flex items-end justify-between h-48 gap-8 px-4'>
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => (
                <div key={day} className='flex-1 flex flex-col items-center gap-3'>
                  <div className='w-full flex flex-col justify-end gap-1 h-32'>
                    <div
                      className='w-full bg-primary-fixed-dim rounded-lg'
                      style={{ height: `${30 + Math.random() * 20}%` }}
                    ></div>
                    <div
                      className='w-full bg-primary rounded-lg'
                      style={{ height: `${40 + Math.random() * 40}%` }}
                    ></div>
                  </div>
                  <span className='text-[10px] font-bold text-on-surface-variant'>{day}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
