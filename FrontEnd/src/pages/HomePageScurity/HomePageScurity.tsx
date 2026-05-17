import { useQuery } from '@tanstack/react-query'
import { DashboardApi } from 'src/apis/TongQuanProtection/TongQuanProtection.api'
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function HomePageSecurity() {
  const [hoveredHour, setHoveredHour] = useState<{ hour: number; count: number; x: number; y: number } | null>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const {
    data: dashboardResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => DashboardApi.getStats(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000
  })

  const dashboardData = dashboardResponse?.data?.data
  const totalScansToday = dashboardData?.overview?.totalScansToday ?? 0
  const successRate = dashboardData?.overview?.successRate ?? 0
  const deniedCount = dashboardData?.overview?.deniedCount ?? 0
  const peakHour = dashboardData?.overview?.peakHour ?? '14:00 - 15:00'
  const peakHourCount = dashboardData?.overview?.peakHourCount ?? 56
  const hourlyStats = dashboardData?.charts?.hourlyStats ?? Array(24).fill(0)
  const buildingDistribution = dashboardData?.charts?.buildingDistribution ?? []
  const recentLogs = dashboardData?.recentLogs ?? []

  const maxHourlyValue = Math.max(...hourlyStats, 1)

  // Debug dữ liệu
  // useEffect(() => {
  //   if (dashboardData?.charts?.hourlyStats) {
  //     console.log('Hourly stats data:', dashboardData.charts.hourlyStats)
  //     dashboardData.charts.hourlyStats.forEach((count: number, hour: number) => {
  //       if (count > 0) {
  //         console.log(`Hour ${hour}:00 -> ${count} scans`)
  //       }
  //     })
  //   }
  // }, [dashboardData])

  // Xử lý hover trên các điểm
  const handlePointHover = (hour: number, count: number, event: React.MouseEvent<SVGCircleElement>) => {
    if (!svgRef.current) return
    const svgRect = svgRef.current.getBoundingClientRect()
    const x = svgRect.left + (hour / 23) * svgRect.width
    const y = svgRect.top + (svgRect.height - (count / maxHourlyValue) * (svgRect.height - 20))

    setHoveredHour({ hour, count, x, y })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-surface'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-on-surface-variant'>Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-surface'>
        <div className='text-center'>
          <span className='material-symbols-outlined text-6xl text-error mb-4'>error</span>
          <p className='text-on-surface-variant'>Có lỗi xảy ra khi tải dữ liệu</p>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl font-bold'
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-surface text-on-surface min-h-screen'>
      <main className='flex-1 px-6 lg:px-10 py-10 max-w-[1600px] mx-auto w-full'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12'>
          <div className='flex flex-col gap-3'>
            <h1 className='text-on-surface text-4xl font-extrabold tracking-tight'>Trung tâm Kiểm soát An ninh</h1>
            <p className='text-on-surface-variant text-lg flex items-center gap-2'>
              <span className='inline-block size-2 rounded-full bg-primary animate-pulse'></span>
              Báo cáo hoạt động mã QR thời gian thực
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
          <div className='bg-white/45 backdrop-blur-md p-6 rounded-2xl border border-white/50 hover:-translate-y-1 transition-transform'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-on-surface-variant text-[11px] font-bold tracking-widest uppercase'>
                  Tổng lượt quét
                </p>
                <h4 className='text-3xl font-black text-on-surface'>{Number(totalScansToday).toLocaleString()}</h4>
              </div>
              <div className='p-2 rounded-lg bg-primary/10 text-primary'>
                <span className='material-symbols-outlined'>qr_code_2</span>
              </div>
            </div>
          </div>

          <div className='bg-white/45 backdrop-blur-md p-6 rounded-2xl border border-white/50 hover:-translate-y-1 transition-transform'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-on-surface-variant text-[11px] font-bold tracking-widest uppercase'>
                  Tỉ lệ thành công
                </p>
                <h4 className='text-3xl font-black text-on-surface'>{Number(successRate).toLocaleString()}%</h4>
              </div>
              <div className='p-2 rounded-lg bg-green-500/10 text-green-600'>
                <span className='material-symbols-outlined'>check_circle</span>
              </div>
            </div>
          </div>

          <div className='bg-white/45 backdrop-blur-md p-6 rounded-2xl border border-white/50 hover:-translate-y-1 transition-transform'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-on-surface-variant text-[11px] font-bold tracking-widest uppercase'>
                  Lượt bị từ chối
                </p>
                <h4 className='text-3xl font-black text-error'>{Number(deniedCount).toLocaleString()}</h4>
              </div>
              <div className='p-2 rounded-lg bg-error/10 text-error'>
                <span className='material-symbols-outlined'>block</span>
              </div>
            </div>
          </div>

          <div className='bg-white/45 backdrop-blur-md p-6 rounded-2xl border border-white/50 hover:-translate-y-1 transition-transform'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-on-surface-variant text-[11px] font-bold tracking-widest uppercase'>Giờ cao điểm</p>
                <h4 className='text-xl font-black text-on-surface'>{peakHour}</h4>
              </div>
              <div className='p-2 rounded-lg bg-secondary/10 text-secondary'>
                <span className='material-symbols-outlined'>schedule</span>
              </div>
            </div>
            <div className='mt-2'>
              <span className='text-on-surface-variant text-xs'>
                {Number(peakHourCount).toLocaleString()} lượt ghi nhận
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12'>
          {/* Hourly Stats Line Chart */}
          <div className='lg:col-span-8 bg-surface-container-lowest rounded-[2rem] p-10 border border-outline-variant/10 shadow-sm'>
            <div className='flex justify-between items-center mb-8'>
              <div>
                <h3 className='text-2xl font-black text-on-surface'>Thống kê Truy cập Theo Giờ</h3>
                <p className='text-sm text-on-surface-variant mt-1'>Xu hướng lượt quét trong vòng 24 giờ qua</p>
              </div>
              <div className='flex gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='size-3 rounded-full bg-primary'></span>
                  <span className='text-xs font-bold'>Lượt quét</span>
                </div>
              </div>
            </div>

            {/* Line Chart SVG with Tooltip */}
            <div ref={chartContainerRef} className='relative h-[320px] w-full'>
              {/* Tooltip */}
              {hoveredHour && (
                <div
                  className='fixed z-50 bg-gray-800 text-white rounded-lg py-2 px-3 shadow-lg whitespace-nowrap pointer-events-none'
                  style={{
                    left: hoveredHour.x + 15,
                    top: hoveredHour.y - 40,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <div className='text-center'>
                    <p className='font-semibold text-blue-300 text-xs'>
                      {hoveredHour.hour.toString().padStart(2, '0')}:00
                    </p>
                    <p className='text-base font-bold text-white'>{hoveredHour.count.toLocaleString()} lượt</p>
                    {hoveredHour.count === maxHourlyValue && maxHourlyValue > 0 && (
                      <p className='text-yellow-400 text-[10px] mt-0.5'>🏆 Giờ cao điểm</p>
                    )}
                  </div>
                  <div className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45'></div>
                </div>
              )}

              <svg ref={svgRef} className='w-full h-full' viewBox='0 0 1000 300' preserveAspectRatio='none'>
                {/* Grid lines */}
                <line stroke='rgba(0,0,0,0.05)' strokeDasharray='4' strokeWidth='1' x1='0' x2='1000' y1='75' y2='75' />
                <line
                  stroke='rgba(0,0,0,0.05)'
                  strokeDasharray='4'
                  strokeWidth='1'
                  x1='0'
                  x2='1000'
                  y1='150'
                  y2='150'
                />
                <line
                  stroke='rgba(0,0,0,0.05)'
                  strokeDasharray='4'
                  strokeWidth='1'
                  x1='0'
                  x2='1000'
                  y1='225'
                  y2='225'
                />

                {/* Y-Axis Labels */}
                <text x='-10' y='300' fill='#717786' fontSize='10' fontWeight='bold' textAnchor='end'>
                  0
                </text>
                <text x='-10' y='225' fill='#717786' fontSize='10' fontWeight='bold' textAnchor='end'>
                  {Math.round(maxHourlyValue * 0.25)}
                </text>
                <text x='-10' y='150' fill='#717786' fontSize='10' fontWeight='bold' textAnchor='end'>
                  {Math.round(maxHourlyValue * 0.5)}
                </text>
                <text x='-10' y='75' fill='#717786' fontSize='10' fontWeight='bold' textAnchor='end'>
                  {Math.round(maxHourlyValue * 0.75)}
                </text>
                <text x='-10' y='0' fill='#717786' fontSize='10' fontWeight='bold' textAnchor='end'>
                  {maxHourlyValue}
                </text>

                {/* Area gradient */}
                <defs>
                  <linearGradient id='areaGradient' x1='0' x2='0' y1='0' y2='1'>
                    <stop offset='0%' stopColor='#005ab7' stopOpacity='0.25' />
                    <stop offset='100%' stopColor='#005ab7' stopOpacity='0' />
                  </linearGradient>
                </defs>

                {/* Area fill */}
                <path
                  d={`M0,300 L0,${300 - (hourlyStats[0] / maxHourlyValue) * 250} ${hourlyStats
                    .map((count: number, i: number) => {
                      const x = (i / 23) * 1000
                      const y = 300 - (count / maxHourlyValue) * 250
                      return `L${x},${y}`
                    })
                    .join(' ')} L1000,300 Z`}
                  fill='url(#areaGradient)'
                />

                {/* Line */}
                <path
                  d={`M0,${300 - (hourlyStats[0] / maxHourlyValue) * 250} ${hourlyStats
                    .map((count: number, i: number) => {
                      const x = (i / 23) * 1000
                      const y = 300 - (count / maxHourlyValue) * 250
                      return `L${x},${y}`
                    })
                    .join(' ')}`}
                  fill='none'
                  stroke='#005ab7'
                  strokeWidth='3'
                  strokeLinecap='round'
                />

                {/* Data points */}
                {hourlyStats.map((count: number, i: number) => {
                  const x = (i / 23) * 1000
                  const y = 300 - (count / maxHourlyValue) * 250
                  const isPeak = count === maxHourlyValue && maxHourlyValue > 0
                  const hour = i

                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r='12'
                        fill='transparent'
                        className='cursor-pointer'
                        onMouseEnter={(e) => handlePointHover(hour, count, e)}
                        onMouseLeave={() => setHoveredHour(null)}
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={isPeak ? '6' : '3'}
                        fill='white'
                        stroke='#005ab7'
                        strokeWidth={isPeak ? '3' : '2'}
                        className='cursor-pointer transition-all duration-200'
                        onMouseEnter={(e) => handlePointHover(hour, count, e)}
                        onMouseLeave={() => setHoveredHour(null)}
                      />
                      {isPeak && (
                        <text x={x} y={y - 12} fill='#005ab7' fontSize='11' fontWeight='bold' textAnchor='middle'>
                          {count}
                        </text>
                      )}
                    </g>
                  )
                })}
              </svg>

              {/* X-Axis Labels */}
              <div className='flex justify-between mt-2 text-[11px] font-bold text-on-surface-variant/60'>
                <span>00:00</span>
                <span>02:00</span>
                <span>04:00</span>
                <span>06:00</span>
                <span>08:00</span>
                <span>10:00</span>
                <span>12:00</span>
                <span>14:00</span>
                <span>16:00</span>
                <span>18:00</span>
                <span>20:00</span>
                <span>22:00</span>
                <span>23:59</span>
              </div>
            </div>
          </div>

          {/* Building Distribution */}
          <div className='lg:col-span-4 bg-surface-container-lowest rounded-[2rem] p-10 border border-outline-variant/10 shadow-sm'>
            <h3 className='text-2xl font-black text-on-surface mb-2'>Phân bổ Vị trí</h3>
            <p className='text-sm text-on-surface-variant mb-8'>Theo tòa nhà và các cổng chính</p>

            <div className='flex flex-col items-center'>
              <div className='relative size-48 mb-6'>
                <svg className='size-full -rotate-90' viewBox='0 0 100 100'>
                  <circle cx='50' cy='50' fill='none' r='44' stroke='#e0e3e5' strokeWidth='8' />
                  {buildingDistribution.map((item: any, idx: number) => {
                    const colors = ['#005ab7', '#476083', '#667781']
                    let cumulativeOffset = 0
                    for (let i = 0; i < idx; i++) {
                      // cumulativeOffset += parseFloat(buildingDistribution[i]?.percentage || 0)
                      const percentageValue = buildingDistribution[i]?.percentage
                      const parsedPercentage =
                        typeof percentageValue === 'string' ? parseFloat(percentageValue) : Number(percentageValue) || 0
                      cumulativeOffset += parsedPercentage
                    }
                    const circumference = 2 * Math.PI * 44
                    const dashArray = (parseFloat(item.percentage) / 100) * circumference
                    return (
                      <circle
                        key={idx}
                        cx='50'
                        cy='50'
                        fill='none'
                        r='44'
                        stroke={colors[idx % colors.length]}
                        strokeWidth='9'
                        strokeDasharray={`${dashArray} ${circumference}`}
                        strokeDashoffset={-((cumulativeOffset / 100) * circumference)}
                        strokeLinecap='round'
                      />
                    )
                  })}
                </svg>
                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                  <span className='text-4xl font-black text-on-surface'>
                    {Number(totalScansToday).toLocaleString()}
                  </span>
                  <span className='text-[10px] font-black uppercase tracking-wide text-on-surface-variant'>
                    Tổng lượt
                  </span>
                </div>
              </div>

              <div className='w-full space-y-4 mt-4'>
                {buildingDistribution.map((building: any, idx: number) => {
                  const colors = ['#005ab7', '#476083', '#667781']
                  return (
                    <div key={idx} className='flex justify-between items-center'>
                      <div className='flex items-center gap-3'>
                        <div className='size-4 rounded-md' style={{ backgroundColor: colors[idx % colors.length] }} />
                        <span className='text-sm font-bold text-on-surface'>{building.name}</span>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-black' style={{ color: colors[idx % colors.length] }}>
                          {building.percentage}%
                        </div>
                        <div className='text-[10px] text-on-surface-variant'>
                          {building.count?.toLocaleString() || (idx === 0 ? '96' : idx === 1 ? '42' : '33')} lần
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Logs Table */}
        <div className='bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-xl border border-outline-variant/10'>
          <div className='p-8 border-b border-outline-variant/10 flex justify-between items-center'>
            <div>
              <h3 className='text-2xl font-black text-on-surface'>Nhật ký Truy cập Gần đây</h3>
              <p className='text-sm text-on-surface-variant mt-1'>Dữ liệu cập nhật 5 giây trước</p>
            </div>
            <Link
              to={'/history/qrcode'}
              className='px-6 py-2.5 rounded-xl text-primary font-bold text-sm bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-2'
            >
              Xem tất cả <span className='material-symbols-outlined text-lg'>arrow_forward</span>
            </Link>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead>
                <tr className='bg-surface-container-low/50'>
                  <th className='px-8 py-5 text-xs font-black uppercase tracking-wide text-on-surface-variant'>
                    Thời gian
                  </th>
                  <th className='px-8 py-5 text-xs font-black uppercase tracking-wide text-on-surface-variant'>
                    Danh tính
                  </th>
                  <th className='px-8 py-5 text-xs font-black uppercase tracking-wide text-on-surface-variant'>
                    Căn hộ
                  </th>
                  <th className='px-8 py-5 text-xs font-black uppercase tracking-wide text-on-surface-variant'>
                    Kết quả
                  </th>
                  <th className='px-8 py-5 text-xs font-black uppercase tracking-wide text-on-surface-variant'>Cổng</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.slice(0, 5).map((log) => (
                  <tr key={log.id} className='border-b border-outline-variant/5 hover:bg-primary/5 transition-colors'>
                    <td className='px-8 py-5 text-sm font-bold'>
                      {new Date(log.time).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })}
                    </td>
                    <td className='px-8 py-5'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                            log.result === 'SUCCESS' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                          }`}
                        >
                          {log.visitorName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className='text-sm font-bold'>{log.visitorName}</span>
                      </div>
                    </td>
                    <td className='px-8 py-5 text-sm text-on-surface-variant'>{log.apartmentCode}</td>
                    <td className='px-8 py-5'>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                          log.result === 'SUCCESS'
                            ? 'bg-green-500/10 text-green-700 border-green-200'
                            : 'bg-error/10 text-error border-error/20'
                        }`}
                      >
                        {log.result === 'SUCCESS' ? 'THÀNH CÔNG' : 'TỪ CHỐI'}
                      </span>
                    </td>
                    <td className='px-8 py-5 text-sm text-on-surface-variant'>{log.gate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
