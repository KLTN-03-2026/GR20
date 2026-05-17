/**
 * Báo cáo thống kê — 4 khối: dân cư, trạng thái phòng, tài chính, yêu cầu dịch vụ (GET /api/statistics/dashboard).
 */
import { useMemo, useState, type ReactNode } from 'react'
import { isAxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  parseStatisticsDashboardHttpResponse,
  statisticsApi,
  type StatisticsDashboard,
} from 'src/apis/statistics.api'

const COLORS = {
  primary: '#2563eb',
  green: '#22c55e',
  amber: '#f59e0b',
  violet: '#8b5cf6',
  slate: '#64748b',
  rose: '#f43f5e',
}

const PIE_PALETTE = [COLORS.primary, COLORS.green, COLORS.violet, COLORS.amber, COLORS.rose, COLORS.slate]

const ROOM_COLOR: Record<string, string> = {
  OCCUPIED: COLORS.primary,
  AVAILABLE: COLORS.green,
  MAINTENANCE: COLORS.amber,
}

const MAINT_COLOR: Record<string, string> = {
  OPEN: COLORS.rose,
  IN_PROGRESS: COLORS.amber,
  DONE: COLORS.green,
  CANCELLED: COLORS.slate,
}

function tooltipNum(value: unknown) {
  if (typeof value === 'number') return value
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function fmtVndCompact(vnd: number): string {
  const n = Math.abs(Number(vnd) || 0)
  if (n >= 1e9) return `${(n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`
  if (n >= 1e6) return `${Math.round(n / 1e6).toLocaleString('vi-VN')} tr`
  return `${Math.round(n).toLocaleString('vi-VN')} ₫`
}

function formatAvgResidentsPerUnit(v: number): string {
  return Number(v || 0).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

/** Chiều cao pixel cố định cho vùng chart — tránh Recharts width/height -1 khi % trong flex/grid. */
function StatChartBlock({
  title,
  chartHeightPx,
  children,
}: {
  title: string
  chartHeightPx: number
  children: React.ReactNode
}) {
  return (
    <div className='flex min-w-0 flex-col gap-2'>
      <p className='shrink-0 text-sm font-bold text-slate-800'>{title}</p>
      <div className='w-full min-w-0' style={{ height: chartHeightPx, minHeight: chartHeightPx }}>
        <ResponsiveContainer width='100%' height='100%' debounce={48}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function dashboardFetchErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const body = err.response?.data as { message?: string } | undefined
    if (typeof body?.message === 'string' && body.message.trim()) return body.message.trim()
    const st = err.response?.status
    if (typeof st === 'number') return `Máy chủ trả HTTP ${st}`
  }
  if (err instanceof Error && err.message.trim()) return err.message.trim()
  return 'Không tải được báo cáo.'
}

function ReportSection({ title, icon, children }: { title: string; icon: string; children: ReactNode }) {
  return (
    <section className='rounded-2xl border border-sky-200/80 bg-white shadow-sm shadow-sky-900/5 overflow-x-auto overflow-y-visible min-w-0'>
      <div className='flex items-center gap-3 px-5 py-3.5 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white'>
        <span className='material-symbols-outlined text-sky-700 text-[26px]'>{icon}</span>
        <h2 className='text-base sm:text-lg font-extrabold text-slate-900 tracking-tight'>{title}</h2>
      </div>
      <div className='p-5 space-y-5'>{children}</div>
    </section>
  )
}

function KpiStrip({ items }: { items: { label: string; value: string; hint: string; icon: string }[] }) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
      {items.map((k) => (
        <div
          key={k.label}
          className='flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3'
        >
          <span className='material-symbols-outlined text-sky-600 text-[22px] shrink-0'>{k.icon}</span>
          <div>
            <p className='text-[11px] font-bold uppercase tracking-wide text-slate-500'>{k.label}</p>
            <p className='text-xl font-extrabold text-slate-900 tabular-nums'>{k.value}</p>
            <p className='text-xs text-slate-500 mt-0.5'>{k.hint}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function dashboardFromPayload(d?: StatisticsDashboard) {
  if (!d) {
    return {
      residentKpis: [] as { label: string; value: string; hint: string; icon: string }[],
      residentMonth: [],
      residentRel: [],
      roomStatus: [],
      roomsByBuilding: [],
      financeKpis: [],
      financeByQ: [],
      feeShare: [],
      serviceKpis: [],
      serviceByMonth: [],
      serviceByStatus: [],
      year: new Date().getFullYear(),
      totalUnits: 0,
    }
  }
  const year = d.year

  const residentKpis = [
    {
      label: 'Cư dân đang cư trú',
      value: d.residents.activeCount.toLocaleString('vi-VN'),
      hint: 'Hồ sơ ACTIVE',
      icon: 'groups',
    },
    {
      label: `Mới ghép năm ${year}`,
      value: `+${d.residents.newInYear.toLocaleString('vi-VN')}`,
      hint: `So với +${d.residents.newPrevYear.toLocaleString('vi-VN')} năm ${year - 1}`,
      icon: 'person_add',
    },
    {
      label: 'Trung bình / căn',
      value: formatAvgResidentsPerUnit(d.residents.avgPerOccupiedUnit),
      hint: 'Người / căn đang ở',
      icon: 'counter_1',
    },
  ]

  const residentRel = (d.residents.relationship || []).map((r, i) => ({
    name: r.name,
    value: r.count,
    color: PIE_PALETTE[i % PIE_PALETTE.length],
  }))

  const roomStatus = (d.apartments.byStatus || []).map((x) => ({
    name: x.name,
    key: x.key,
    count: x.count,
    color: ROOM_COLOR[x.key] || PIE_PALETTE[0],
  }))

  const roomsByBuilding = (d.apartments.byBuilding || []).map((b) => ({
    building: b.buildingName,
    occupied: b.occupied,
    available: b.available,
    maintenance: b.maintenance,
  }))

  const financeKpis = [
    {
      label: 'Đã thu (năm)',
      value: fmtVndCompact(d.finance.paidYearVnd),
      hint: 'Thanh toán SUCCESS trong năm',
      icon: 'payments',
    },
    {
      label: 'Công nợ phí',
      value: fmtVndCompact(d.finance.outstandingVnd),
      hint: 'Hóa đơn PENDING / OVERDUE (tạo trong năm)',
      icon: 'account_balance_wallet',
    },
    {
      label: 'Tỷ lệ đã hoàn thành HĐ (PAID)',
      value: `${d.finance.paidOnTimePercent.toLocaleString('vi-VN')}%`,
      hint: `Giá trị đã PAID / tổng giá trị HĐ năm ${year}`,
      icon: 'percent',
    },
  ]

  const financeByQ = (d.finance.byQuarter || []).map((q) => ({
    q: q.q.replace(/^Q/, 'Q'),
    thu: q.collectedMillions,
    no: q.debtMillions,
  }))

  const feeShare = (d.finance.feeStructurePercent || []).map((x, i) => ({
    name: x.name,
    value: x.percent,
    color: PIE_PALETTE[i % PIE_PALETTE.length],
  }))

  const serviceKpis = [
    {
      label: 'Tổng yêu cầu năm',
      value: String(d.maintenance.totalYear),
      hint: `Ghi nhận trong năm ${year}`,
      icon: 'build',
    },
    {
      label: 'Đang xử lý',
      value: String(d.maintenance.openInProgress),
      hint: 'OPEN + IN_PROGRESS',
      icon: 'pending_actions',
    },
    {
      label: 'Hoàn thành',
      value: String(d.maintenance.done),
      hint: 'Trạng thái DONE',
      icon: 'task_alt',
    },
  ]

  const serviceByStatus = (d.maintenance.byStatus || []).map((s) => ({
    name: s.name,
    value: s.count,
    color: MAINT_COLOR[s.status] || PIE_PALETTE[0],
  }))

  return {
    residentKpis,
    residentMonth: d.residents.byMonth || [],
    residentRel,
    roomStatus,
    roomsByBuilding,
    financeKpis,
    financeByQ,
    feeShare,
    serviceKpis,
    serviceByMonth: d.maintenance.byMonth || [],
    serviceByStatus,
    year,
    totalUnits: d.apartments.totalUnits,
  }
}

export default function StatisticsReportPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  const dashboardQuery = useQuery({
    queryKey: ['statistics-dashboard', year],
    queryFn: async () => {
      const label = '[Statistics/dashboard]'
      try {
        const res = await statisticsApi.getDashboard(year)
        const parsed = parseStatisticsDashboardHttpResponse(res)

        if (!parsed.ok) {
          console.error(label, 'ERROR', {
            source: 'body',
            year,
            status: res.status,
            beCode: parsed.envelope?.code,
            beOperationType: parsed.envelope?.operationType,
            beMessage: parsed.envelope?.message,
            reason: parsed.reason,
          })
          throw new Error(parsed.reason)
        }

        const { envelope } = parsed
        console.log(label, 'SUCCESS', {
          source: 'be',
          year,
          status: res.status,
          code: envelope.code,
          operationType: envelope.operationType,
          message: envelope.message,
          timestamp: envelope.timestamp,
        })

        return envelope.data
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          const body = err.response?.data as { message?: string } | undefined
          console.error(label, 'ERROR', {
            source: 'http',
            year,
            status: err.response?.status,
            beMessage: typeof body?.message === 'string' ? body.message : undefined,
            body: err.response?.data,
          })
        }

        throw err
      }
    },
  })

  const view = useMemo(() => dashboardFromPayload(dashboardQuery.data), [dashboardQuery.data])

  const yearOptions = useMemo(() => {
    const end = currentYear + 1
    const start = Math.max(2020, currentYear - 6)
    const opts: number[] = []
    for (let y = start; y <= end; y++) opts.push(y)
    return opts
  }, [currentYear])

  const subtitle =
    'Khu căn hộ Azure Plaza & Parkview — số liệu theo phạm vi tòa được gán (Quản lý) hoặc toàn hệ thống (ADMIN)'

  if (dashboardQuery.isError) {
    return (
      <div className='min-h-full bg-gradient-to-b from-sky-50/80 to-slate-50 pb-10 -mx-6 px-4 sm:px-6'>
        <div className='max-w-[1600px] mx-auto pt-8'>
          <p className='text-red-600 font-semibold'>
            {dashboardFetchErrorMessage(dashboardQuery.error)}
          </p>
          <p className='mt-2 text-sm text-slate-600'>
            Kiểm tra quyền (ADMIN / Quản lý) và máy chủ backend. Xem chi tiết trong Console (ERROR).
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-full bg-gradient-to-b from-sky-50/80 to-slate-50 pb-10 -mx-6 px-4 sm:px-6'>
      <div className='max-w-[1600px] mx-auto space-y-8 pt-2'>
        <header className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-sky-200/60 pb-6'>
          <div>
            <p className='text-xs font-bold uppercase tracking-widest text-sky-700 mb-1'>Homelink · Báo cáo</p>
            <h1 className='text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900'>
              Báo cáo thống kê tổng hợp
            </h1>
            <p className='mt-1 text-slate-600 font-medium max-w-2xl'>{subtitle}</p>
          </div>
          <div className='flex flex-wrap items-center gap-3 rounded-xl border border-sky-200 bg-white/90 px-4 py-2.5 shadow-sm'>
            <span className='material-symbols-outlined text-sky-600 text-[22px]'>calendar_month</span>
            <label className='text-sm font-semibold text-slate-700 flex items-center gap-2'>
              Năm báo cáo
              <select
                className='rounded-lg border border-sky-200 bg-white px-2 py-1 text-sm font-bold text-slate-900'
                value={year}
                disabled={dashboardQuery.isLoading}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <span className='text-sm text-slate-500'>
              01/01/{year} — 31/12/{year}
            </span>
          </div>
        </header>

        {dashboardQuery.isLoading ? (
          <div className='flex items-center justify-center py-24 text-slate-600 font-medium'>
            <span className='material-symbols-outlined animate-spin mr-2 text-sky-600'>progress_activity</span>
            Đang tải số liệu…
          </div>
        ) : (
          <div className='space-y-8'>
            <ReportSection title='Thống kê số lượng dân cư' icon='groups'>
              <KpiStrip items={view.residentKpis} />
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                <div className='min-w-0 lg:col-span-2'>
                  <StatChartBlock title={`Cư dân mới ghép theo tháng (${view.year})`} chartHeightPx={240}>
                    <BarChart data={view.residentMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                      <XAxis dataKey='month' tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip formatter={(v) => [`${tooltipNum(v)} người`, 'Mới ghép']} />
                      <Bar dataKey='count' name='Số người' fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </StatChartBlock>
                </div>
                <div className='min-w-0'>
                  <StatChartBlock title='Theo quan hệ với căn hộ' chartHeightPx={240}>
                    <PieChart>
                      <Pie
                        data={view.residentRel}
                        dataKey='value'
                        nameKey='name'
                        cx='50%'
                        cy='50%'
                        innerRadius={48}
                        outerRadius={78}
                        paddingAngle={2}
                      >
                        {view.residentRel.map((c) => (
                          <Cell key={c.name} fill={c.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`${tooltipNum(v)} người`, '']} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </StatChartBlock>
                </div>
              </div>
            </ReportSection>

            <ReportSection title='Thống kê trạng thái phòng' icon='meeting_room'>
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                <div className='min-w-0'>
                  <StatChartBlock
                    title={`Tỷ lệ theo trạng thái căn (${view.totalUnits.toLocaleString('vi-VN')} căn)`}
                    chartHeightPx={260}
                  >
                    <PieChart>
                      <Pie
                        data={view.roomStatus}
                        dataKey='count'
                        nameKey='name'
                        cx='50%'
                        cy='50%'
                        innerRadius={54}
                        outerRadius={88}
                        paddingAngle={2}
                        label={(p) => `${String(p.name ?? '')} ${((p.percent ?? 0) * 100).toFixed(1)}%`}
                      >
                        {view.roomStatus.map((c) => (
                          <Cell key={c.key} fill={c.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, item) => {
                          const lab = (item?.payload as { key?: string })?.key
                          return [`${tooltipNum(value)} căn${lab ? ` (${lab})` : ''}`, String(name)]
                        }}
                      />
                    </PieChart>
                  </StatChartBlock>
                </div>
                <div className='min-w-0'>
                  <StatChartBlock title='Theo tòa — số căn theo trạng thái' chartHeightPx={260}>
                    <BarChart data={view.roomsByBuilding} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                      <XAxis dataKey='building' tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey='occupied' name='Đang ở' stackId='a' fill={COLORS.primary} radius={[0, 0, 0, 0]} />
                      <Bar dataKey='available' name='Trống' stackId='a' fill={COLORS.green} />
                      <Bar dataKey='maintenance' name='Bảo trì' stackId='a' fill={COLORS.amber} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </StatChartBlock>
                </div>
              </div>
            </ReportSection>

            <ReportSection title='Thống kê tài chính' icon='account_balance'>
              <KpiStrip items={view.financeKpis} />
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                <div className='min-w-0'>
                  <StatChartBlock title='Thu phí & nợ theo quý (triệu VNĐ)' chartHeightPx={240}>
                    <BarChart data={view.financeByQ} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                      <XAxis dataKey='q' />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value, name) => [
                          `${tooltipNum(value).toLocaleString('vi-VN')} triệu VNĐ`,
                          String(name),
                        ]}
                      />
                      <Legend />
                      <Bar dataKey='thu' name='Đã thu' fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                      <Bar dataKey='no' name='Công nợ kỳ' fill={COLORS.rose} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </StatChartBlock>
                </div>
                <div className='grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='min-w-0'>
                    <StatChartBlock title='Cơ cấu item hóa đơn (%)' chartHeightPx={248}>
                      <PieChart>
                        <Pie
                          data={view.feeShare}
                          dataKey='value'
                          nameKey='name'
                          cx='50%'
                          cy='50%'
                          innerRadius={42}
                          outerRadius={68}
                        >
                          {view.feeShare.map((c) => (
                            <Cell key={c.name} fill={c.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [`${tooltipNum(v)}%`, 'Tỷ trọng']} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                      </PieChart>
                    </StatChartBlock>
                  </div>
                  <div className='rounded-xl border border-sky-100 bg-sky-50/60 p-4 flex flex-col justify-center'>
                    <span className='material-symbols-outlined text-sky-700 mb-2'>info</span>
                    <p className='text-sm font-bold text-slate-900'>Ghi chú</p>
                    <p className='text-xs text-slate-600 leading-relaxed mt-1'>
                      Thu phí là tổng <code className='text-[10px] bg-white/80 px-1 rounded'>payments</code> thành
                      công; nợ theo quý là tổng tiền hóa đơn{' '}
                      <code className='text-[10px] bg-white/80 px-1 rounded'>PENDING/OVERDUE</code> tạo trong quý đó.
                    </p>
                  </div>
                </div>
              </div>
            </ReportSection>

            <ReportSection title='Thống kê số lượng yêu cầu dịch vụ' icon='handyman'>
              <KpiStrip items={view.serviceKpis} />
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                <div className='min-w-0'>
                  <StatChartBlock title='Số yêu cầu ghi nhận theo tháng' chartHeightPx={260}>
                    <ComposedChart data={view.serviceByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                      <XAxis dataKey='month' tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip formatter={(v) => [`${tooltipNum(v)} yêu cầu`, '']} />
                      <Legend />
                      <Bar dataKey='total' name='Tổng' fill={COLORS.violet} radius={[6, 6, 0, 0]} />
                      <Line
                        type='monotone'
                        dataKey='total'
                        name='Xu hướng'
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </ComposedChart>
                  </StatChartBlock>
                </div>
                <div className='min-w-0'>
                  <StatChartBlock title='Phân bổ theo trạng thái xử lý' chartHeightPx={260}>
                    <PieChart>
                      <Pie
                        data={view.serviceByStatus}
                        dataKey='value'
                        nameKey='name'
                        cx='50%'
                        cy='50%'
                        innerRadius={50}
                        outerRadius={82}
                        paddingAngle={2}
                      >
                        {view.serviceByStatus.map((c) => (
                          <Cell key={c.name} fill={c.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`${tooltipNum(v)} phiếu`, '']} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </StatChartBlock>
                </div>
              </div>
            </ReportSection>
          </div>
        )}

        <p className='text-xs text-slate-500 px-1'>
          Nguồn dữ liệu: resident_profiles, apartments, invoices / invoice_items, payments, maintenance_requests.
        </p>
      </div>
    </div>
  )
}
