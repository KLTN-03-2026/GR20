import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { parseSystemOverviewEnvelope, statisticsApi } from 'src/apis/statistics.api'
import { formatVnd } from 'src/utils/billing-ui'

const fmtNum = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n))

const toneIconBg: Record<string, string> = {
  primary: 'bg-primary-fixed',
  secondary: 'bg-secondary-fixed',
  error: 'bg-error-container/40'
}

const toneIconColor: Record<string, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  error: 'text-error'
}

const statusBadge: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-tertiary-fixed/50 text-on-tertiary-fixed-variant',
  error: 'bg-error-container text-on-error-container',
  info: 'bg-secondary-fixed text-on-secondary-fixed-variant'
}

const PIE_COLORS = ['border-primary', 'border-secondary', 'border-secondary-container', 'border-primary-fixed']

export default function HomePageAdmin() {
  const year = new Date().getFullYear()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-system-overview', year],
    queryFn: async () => {
      const res = await statisticsApi.getSystemOverview(year)
      const parsed = parseSystemOverviewEnvelope(res.data)
      if (!parsed.ok) throw new Error(parsed.reason)
      return parsed.data
    }
  })

  const maxRevenue = Math.max(...(data?.revenueByMonth.map((m) => m.amountVnd) ?? [1]), 1)
  const structure = data?.revenueStructure ?? []

  if (isLoading) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center bg-surface text-on-surface'>
        <span className='material-symbols-outlined animate-spin text-3xl text-primary'>sync</span>
        <span className='ml-3 text-sm font-medium text-on-surface-variant'>Đang tải tổng quan…</span>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className='mx-auto max-w-lg p-8 text-center'>
        <p className='text-sm text-red-600'>{(error as Error)?.message || 'Tải tổng quan thất bại'}</p>
        <button
          type='button'
          onClick={() => refetch()}
          className='mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white'
        >
          Thử lại
        </button>
      </div>
    )
  }

  const growth = data.kpis.revenueGrowthPercent
  const growthLabel =
    growth == null
      ? '—'
      : `${growth >= 0 ? '+' : ''}${growth}% so với tháng trước`

  return (
    <div className='min-h-screen bg-surface text-on-surface'>
      <div className='mx-auto w-full max-w-[1600px] space-y-8 p-8'>
        <section className='flex flex-col justify-between gap-4 md:flex-row md:items-end'>
          <div>
            <h2 className='text-3xl font-extrabold tracking-tight text-on-surface'>Tổng quan chủ sở hữu</h2>
            <p className='mt-1 font-medium text-on-surface-variant'>
              Hiệu suất danh mục đầu tư cho{' '}
              <span className='font-bold text-primary'>{data.buildingNamesSummary}</span>
            </p>
          </div>
          <span className='rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
            Năm {data.year}
          </span>
        </section>

        <section className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5'>
          {[
            { icon: 'apartment', label: 'Tổng số tòa nhà', value: fmtNum(data.kpis.buildingCount) },
            { icon: 'home', label: 'Tổng số căn hộ', value: fmtNum(data.kpis.apartmentCount) },
            { icon: 'group', label: 'Tổng cư dân', value: fmtNum(data.kpis.residentCount) },
            { icon: 'analytics', label: 'Tỷ lệ lấp đầy', value: `${data.kpis.occupancyPercent}%` }
          ].map((card) => (
            <div
              key={card.label}
              className='flex flex-col justify-between rounded-xl bg-surface-container-lowest p-6 shadow-sm shadow-blue-900/5'
            >
              <span className='material-symbols-outlined mb-4 text-primary'>{card.icon}</span>
              <div>
                <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant'>{card.label}</p>
                <h3 className='mt-1 text-2xl font-extrabold'>{card.value}</h3>
              </div>
            </div>
          ))}
          <div className='flex flex-col justify-between rounded-xl bg-gradient-to-br from-primary to-primary-container p-6 text-white shadow-lg shadow-blue-900/10'>
            <span className='material-symbols-outlined mb-4'>payments</span>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-widest opacity-80'>Doanh thu tháng này</p>
              <h3 className='mt-1 text-2xl font-extrabold'>{formatVnd(data.kpis.revenueThisMonthVnd)}</h3>
              <p className='mt-1 flex items-center gap-1 text-[10px] font-bold text-blue-100'>
                <span className='material-symbols-outlined text-[14px]'>
                  {growth != null && growth < 0 ? 'trending_down' : 'trending_up'}
                </span>
                {growthLabel}
              </p>
            </div>
          </div>
        </section>

        <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12'>
          <div className='space-y-8 lg:col-span-8'>
            <div className='rounded-xl bg-surface-container-lowest p-8 shadow-sm'>
              <div className='mb-10 flex items-center justify-between'>
                <h4 className='text-lg font-bold tracking-tight'>Doanh thu 12 tháng</h4>
                <div className='flex gap-4'>
                  <div className='flex items-center gap-2'>
                    <div className='h-3 w-3 rounded-full bg-primary' />
                    <span className='text-xs font-bold uppercase tracking-wider text-on-surface-variant'>Doanh thu</span>
                  </div>
                </div>
              </div>
              <div className='flex h-64 items-end justify-between gap-2 px-2'>
                {data.revenueByMonth.map((m, idx) => {
                  const h = maxRevenue > 0 ? Math.max(8, Math.round((100 * m.amountVnd) / maxRevenue)) : 8
                  const isCurrent = idx === new Date().getMonth()
                  return (
                    <div
                      key={m.month}
                      title={`${m.month}: ${formatVnd(m.amountVnd)}`}
                      className={`w-full rounded-t-lg transition-colors ${
                        isCurrent ? 'bg-primary' : 'bg-surface-container-low hover:bg-primary'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  )
                })}
              </div>
              <div className='mt-4 flex justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant'>
                {data.revenueByMonth.map((m) => (
                  <span key={m.month}>{m.month}</span>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
              <div className='rounded-xl bg-surface-container-lowest p-8 shadow-sm'>
                <h4 className='mb-6 text-lg font-bold tracking-tight'>Cơ cấu nguồn thu</h4>
                <div className='relative flex items-center justify-center py-4'>
                  <div
                    className={`h-32 w-32 rounded-full border-[16px] ${PIE_COLORS.map((c, i) => (i < structure.length ? c : 'border-transparent')).join(' ')}`}
                  />
                  <div className='absolute inset-0 flex flex-col items-center justify-center'>
                    <span className='text-xs font-bold uppercase text-on-surface-variant'>Tổng</span>
                    <span className='text-lg font-black'>{formatVnd(data.revenueStructureTotalVnd)}</span>
                  </div>
                </div>
                <div className='mt-8 grid grid-cols-2 gap-4'>
                  {structure.map((s, i) => (
                    <div key={s.name} className='flex items-center gap-2'>
                      <div className={`h-2 w-2 rounded-full bg-primary opacity-${100 - i * 15}`} />
                      <span className='text-[10px] font-bold uppercase tracking-wider text-on-surface-variant'>
                        {s.name} ({s.percent}%)
                      </span>
                    </div>
                  ))}
                  {structure.length === 0 && (
                    <p className='col-span-2 text-sm text-on-surface-variant'>Chưa có dữ liệu khoản thu trong năm.</p>
                  )}
                </div>
              </div>

              <div className='rounded-xl bg-surface-container-lowest p-8 shadow-sm'>
                <h4 className='mb-6 text-lg font-bold tracking-tight'>Công nợ theo tòa nhà</h4>
                <div className='space-y-6'>
                  {data.debtByBuilding.length === 0 && (
                    <p className='text-sm text-on-surface-variant'>Không có công nợ đang mở.</p>
                  )}
                  {data.debtByBuilding.map((row) => (
                    <div key={row.buildingId}>
                      <div className='mb-2 flex justify-between'>
                        <span className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
                          {row.buildingName}
                        </span>
                        <span className='text-xs font-bold'>{formatVnd(row.debtVnd)}</span>
                      </div>
                      <div className='h-2 w-full overflow-hidden rounded-full bg-surface-container-low'>
                        <div
                          className={`h-full ${row.barPercent >= 80 ? 'bg-error' : 'bg-primary'}`}
                          style={{ width: `${row.barPercent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-8 lg:col-span-4'>
            <div
              className='rounded-2xl border border-white/40 p-8'
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 32px 64px -12px rgba(68, 93, 128, 0.08)'
              }}
            >
              <div className='mb-6 flex items-center gap-3'>
                <span
                  className='material-symbols-outlined rounded-xl bg-primary-fixed p-2 text-primary'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  psychology
                </span>
                <h4 className='text-lg font-extrabold tracking-tight'>Thông tin từ AI</h4>
              </div>
              <div className='space-y-4'>
                {data.aiInsights.map((text, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-4 ${
                      i === 1 ? 'bg-error-container/30' : 'bg-secondary-fixed/50'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium leading-relaxed ${
                        i === 1 ? 'text-on-error-container' : 'text-on-secondary-fixed-variant'
                      }`}
                    >
                      &ldquo;{text}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className='space-y-4 rounded-xl bg-surface-container-lowest p-8 shadow-sm'>
              <h4 className='mb-2 text-lg font-bold tracking-tight'>Cảnh báo &amp; Bất thường</h4>
              {data.alerts.length === 0 && (
                <p className='text-sm text-on-surface-variant'>Không có cảnh báo nổi bật.</p>
              )}
              {data.alerts.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 rounded-xl border-l-4 p-4 ${
                    a.type === 'warning'
                      ? 'border-tertiary bg-tertiary-fixed/30'
                      : 'border-error bg-error-container/20'
                  }`}
                >
                  <span className={`material-symbols-outlined mt-0.5 ${a.type === 'warning' ? 'text-tertiary' : 'text-error'}`}>
                    {a.type === 'warning' ? 'notifications_active' : 'warning'}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${a.type === 'warning' ? 'text-on-tertiary-fixed-variant' : 'text-on-error-container'}`}>
                      {a.title}
                    </p>
                    <p className={`mt-1 text-xs ${a.type === 'warning' ? 'text-on-tertiary-fixed-variant/70' : 'text-on-error-container/70'}`}>
                      {a.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='rounded-xl bg-surface-container-low p-5'>
                <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant'>Doanh thu cao nhất</p>
                <p className='mt-1 text-sm font-bold'>{data.quickStats.topRevenueBuilding}</p>
              </div>
              <div className='rounded-xl bg-surface-container-low p-5'>
                <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant'>Mã QR hoạt động</p>
                <p className='mt-1 text-sm font-bold'>{fmtNum(data.quickStats.activeQrCount)}</p>
              </div>
              <div className='rounded-xl bg-surface-container-low p-5'>
                <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant'>Nhân viên hoạt động</p>
                <p className='mt-1 text-sm font-bold'>{fmtNum(data.quickStats.activeStaffCount)}</p>
              </div>
              <div className='rounded-xl bg-surface-container-low p-5'>
                <p className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant'>Trạng thái</p>
                <div className='mt-1 flex items-center gap-2'>
                  <div
                    className={`h-2 w-2 rounded-full ${
                      data.quickStats.systemStatus === 'stable' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <p className='text-sm font-bold'>
                    {data.quickStats.systemStatus === 'stable' ? 'Ổn định' : 'Cần chú ý'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className='grid grid-cols-1 gap-8 pb-12 lg:grid-cols-3'>
          <div className='rounded-xl bg-surface-container-lowest p-8 shadow-sm lg:col-span-2'>
            <h4 className='mb-8 text-lg font-bold tracking-tight'>Danh sách gần đây</h4>
            <div className='overflow-x-auto'>
              <table className='w-full text-left'>
                <thead>
                  <tr className='border-b border-outline-variant/10'>
                    {['Hạng mục', 'Chi tiết', 'Giá trị', 'Trạng thái'].map((h) => (
                      <th
                        key={h}
                        className='pb-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant'
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-outline-variant/5'>
                  {data.recentActivities.length === 0 && (
                    <tr>
                      <td colSpan={4} className='py-8 text-center text-sm text-on-surface-variant'>
                        Chưa có hoạt động gần đây.
                      </td>
                    </tr>
                  )}
                  {data.recentActivities.map((row, i) => (
                    <tr key={i}>
                      <td className='py-5'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneIconBg[row.categoryTone] || toneIconBg.primary}`}
                          >
                            <span
                              className={`material-symbols-outlined text-sm ${toneIconColor[row.categoryTone] || toneIconColor.primary}`}
                            >
                              {row.categoryIcon}
                            </span>
                          </div>
                          <span className='text-sm font-bold'>{row.category}</span>
                        </div>
                      </td>
                      <td className='py-5 text-sm'>{row.detail}</td>
                      <td className='py-5 text-sm font-bold'>
                        {row.valueFormatted ?? (row.value != null ? formatVnd(row.value) : '—')}
                      </td>
                      <td className='py-5'>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                            statusBadge[row.statusTone] || statusBadge.info
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.featuredBuilding ? (
            <div className='group relative overflow-hidden rounded-2xl'>
              <img
                alt={data.featuredBuilding.buildingName}
                className='absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuD1HPTYFWwhUfv3fYbeXM-f8yanOVPLqiRRdXJhKqWxpByTYdF4sRrd60DbYtHk9yCdHqdM4INCAeMNcsug9pQ7Rab4QIyeJ1UT4QODQ5ofAhsfmgVcLZP1NVP9_eHQ4wz7lCbUq9FzhFh3R5QXn6Z44to37lqfhHOVbn94_9oODE0QCgETlJPrWSzqjy6CndeHzqFYnDpshbJrVn5X7i67Pm9hKQjeO0POppcbiaSlLbUhQWkJ8vig5QKHfetiItjUpZEe81_iQPfx'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent' />
              <div className='absolute bottom-0 left-0 right-0 p-8'>
                <span className='text-[10px] font-bold uppercase tracking-widest text-white/70'>Hoạt động tốt nhất</span>
                <h5 className='mt-1 text-2xl font-black text-white'>{data.featuredBuilding.buildingName}</h5>
                <p className='mt-2 text-sm font-medium text-white/80'>
                  {data.featuredBuilding.occupancyPercent}% lấp đầy • {formatVnd(data.featuredBuilding.revenueVnd)} doanh thu
                </p>
                <Link
                  to='/owner/management/apartments'
                  className='mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white group/btn'
                >
                  Xem hồ sơ tòa nhà
                  <span className='material-symbols-outlined text-sm transition-transform group-hover/btn:translate-x-1'>
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-center rounded-2xl bg-surface-container-low p-8 text-sm text-on-surface-variant'>
              Chưa có dữ liệu tòa nhà nổi bật.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
