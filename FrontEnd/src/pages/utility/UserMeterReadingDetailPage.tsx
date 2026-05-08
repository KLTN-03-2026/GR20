import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from 'src/contexts/app.context'
import { meterReadingsApi } from 'src/apis/utility_api/meter-readings.api'
import { utilityMetersApi } from 'src/apis/utility_api/utility-meters.api'

function meterTypeLabel(t: string) {
  if (t === 'ELECTRIC') return 'Điện'
  if (t === 'WATER') return 'Nước'
  if (t === 'GAS') return 'Gas'
  return t
}

export default function UserMeterReadingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useContext(AppContext)
  const userId = String((user as any)?.id || (user as any)?._id || '')

  const readingQuery = useQuery({
    queryKey: ['meter-reading-detail', id],
    queryFn: () => meterReadingsApi.getById(String(id)),
    enabled: Boolean(id && userId)
  })

  const reading = readingQuery.data?.data?.data ?? null
  const meterId = reading?.meterId

  const meterQuery = useQuery({
    queryKey: ['meter-for-reading', userId, meterId],
    queryFn: () => utilityMetersApi.getByUserIdAndMeterId(userId, String(meterId)),
    enabled: Boolean(userId && meterId != null)
  })

  const meter = meterQuery.data?.data?.data ?? null

  const fmtDate = (s: string) => {
    if (!s) return '---'
    return new Date(s).toLocaleDateString('vi-VN')
  }

  const fmtNum = (n: number | undefined | null) => {
    if (n === undefined || n === null || Number.isNaN(Number(n))) return '---'
    return new Intl.NumberFormat('vi-VN').format(Number(n))
  }

  const iconForType = meter?.meterType === 'WATER' ? 'water_drop' : meter?.meterType === 'GAS' ? 'local_fire_department' : 'bolt'

  if (!userId) {
    return (
      <div className='pb-8'>
        <p className='text-center text-slate-500'>Vui lòng đăng nhập để xem chỉ số.</p>
      </div>
    )
  }

  if (readingQuery.isLoading) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center text-slate-400'>
        <span className='material-symbols-outlined animate-spin'>sync</span>
        <span className='ml-2 text-sm'>Đang tải dữ liệu...</span>
      </div>
    )
  }

  if (!reading) {
    return (
      <div className='pb-8'>
        <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
          <Link to='/' className='hover:text-blue-500'>
            Trang chủ
          </Link>
          <span className='material-symbols-outlined text-xs'>chevron_right</span>
          <Link to='/my-meter-readings' className='hover:text-blue-500'>
            Chỉ số của tôi
          </Link>
          <span className='material-symbols-outlined text-xs'>chevron_right</span>
          <span className='font-semibold text-blue-600'>Chi tiết</span>
        </nav>
        <div className='rounded-2xl border border-slate-100 bg-white py-16 text-center'>
          <span className='material-symbols-outlined mb-4 block text-5xl text-slate-200'>electric_meter</span>
          <p className='font-semibold text-slate-600'>Không tìm thấy chỉ số</p>
          <button type='button' className='mt-4 text-sm font-bold text-blue-600 hover:underline' onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  const consumptionOk = typeof reading.consumption === 'number' && reading.consumption >= 0

  return (
    <div className='pb-10'>
      <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
        <Link to='/' className='hover:text-blue-500'>
          Trang chủ
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <Link to='/my-meter-readings' className='hover:text-blue-500'>
          Chỉ số của tôi
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <span className='font-semibold text-blue-600'>Chi tiết chỉ số</span>
      </nav>

      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-extrabold text-slate-900'>Chi tiết chỉ số đồng hồ</h1>
        <div className='h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-700' />
        <p className='mt-2 text-sm text-slate-500'>
          Mã bản ghi #{reading.id}
          {meter?.meterCode ? ` — Đồng hồ ${meter.meterCode}` : reading.meterId ? ` — Đồng hồ #${reading.meterId}` : ''}
        </p>
      </div>

      <div className='relative mb-8 flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8'>
        <div className='flex items-center gap-6'>
          <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50'>
            <span className='material-symbols-outlined text-3xl text-blue-600' style={{ fontVariationSettings: "'FILL' 1" }}>
              {iconForType}
            </span>
          </div>
          <div className='min-w-0'>
            <h2 className='text-xl font-bold text-slate-900 md:text-2xl'>Kỳ ghi chỉ số</h2>
            <p className='text-slate-500'>
              Ngày ghi:{' '}
              <span className='font-semibold text-slate-700'>{fmtDate(reading.readingDate)}</span>
              {meter ? (
                <>
                  {' '}
                  · {meterTypeLabel(meter.meterType)}
                  {meter.apartmentId != null ? ` · Căn hộ ${meter.apartmentId}` : ''}
                </>
              ) : (
                meterQuery.isFetching && (
                  <>
                    {' '}
                    <span className='text-xs text-slate-400'> (đang tải đồng hồ…)</span>
                  </>
                )
              )}
            </p>
          </div>
        </div>
        <span className='inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-100 px-5 py-2 text-xs font-bold uppercase tracking-wide text-emerald-800'>
          <span className='material-symbols-outlined text-sm'>trending_up</span>
          Tiêu thụ kỳ: {consumptionOk ? `${fmtNum(reading.consumption)}` : '---'}
        </span>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        <div className='rounded-2xl border border-slate-100 bg-white p-8 shadow-sm lg:col-span-8'>
          <div className='mb-6 flex items-center gap-3'>
            <span className='material-symbols-outlined text-blue-600'>info</span>
            <h3 className='text-xs font-bold uppercase tracking-widest text-slate-400'>Giá trị đo</h3>
          </div>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <div>
              <div className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Chỉ số đầu kỳ</div>
              <p className='mt-1 text-2xl font-bold tabular-nums text-slate-900'>{fmtNum(reading.previousReading)}</p>
            </div>
            <div>
              <div className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Chỉ số cuối kỳ</div>
              <p className='mt-1 text-2xl font-bold tabular-nums text-slate-900'>{fmtNum(reading.currentReading)}</p>
            </div>
            <div>
              <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                <span className='material-symbols-outlined text-sm text-emerald-600'>difference</span>
                Tiêu thụ trong kỳ
              </div>
              <p className='mt-1 text-xl font-extrabold tabular-nums text-emerald-700'>{fmtNum(reading.consumption)}</p>
            </div>
            {reading.createdAt && (
              <div>
                <div className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Ghi nhận</div>
                <p className='mt-1 text-sm font-semibold text-slate-700'>{fmtDate(reading.createdAt)}</p>
              </div>
            )}
          </div>
        </div>

        <div className='rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 p-8 text-white shadow-sm lg:col-span-4'>
          <div className='mb-4 flex items-center gap-3'>
            <span className='material-symbols-outlined'>electric_meter</span>
            <h3 className='text-xs font-bold uppercase tracking-widest text-white/80'>Đồng hồ liên quan</h3>
          </div>
          {meter ? (
            <dl className='space-y-3 text-sm'>
              <div>
                <dt className='text-[10px] uppercase tracking-wide text-white/60'>Mã đồng hồ</dt>
                <dd className='font-bold'>{meter.meterCode}</dd>
              </div>
              <div>
                <dt className='text-[10px] uppercase tracking-wide text-white/60'>Loại</dt>
                <dd className='font-semibold'>{meterTypeLabel(meter.meterType)}</dd>
              </div>
              <div>
                <dt className='text-[10px] uppercase tracking-wide text-white/60'>Căn hộ</dt>
                <dd className='font-semibold'>{meter.apartmentId != null ? `ID ${meter.apartmentId}` : '—'}</dd>
              </div>
              <div>
                <dt className='text-[10px] uppercase tracking-wide text-white/60'>Trạng thái</dt>
                <dd className='rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase'>
                  {meter.status || 'ACTIVE'}
                </dd>
              </div>
            </dl>
          ) : meterQuery.isError ? (
            <p className='text-sm text-white/85'>Không tải được thông tin đồng hồ (#{meterId}). Bạn chỉ có thể xem số chỉ số của mình.</p>
          ) : (
            <p className='text-sm text-white/75'>Đang đồng bộ đồng hồ...</p>
          )}
        </div>
      </div>

      <div className='relative mt-8 h-40 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-800 to-blue-950 shadow-inner'>
        <div className='relative z-10 flex h-full items-center px-6 sm:px-10'>
          <div className='max-w-md rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md'>
            <div className='mb-2 flex items-center gap-2'>
              <span className='material-symbols-outlined text-sm text-blue-300'>auto_awesome</span>
              <span className='text-[10px] font-bold uppercase tracking-widest text-blue-100'>Homelink AI Insight</span>
            </div>
            <p className='text-sm leading-relaxed text-white/95'>
              {consumptionOk
                ? reading.consumption > 0
                  ? `Khối tiêu thụ kỳ này là ${fmtNum(reading.consumption)}. So sánh định kỳ giữa các tháng trên danh sách để chủ động kiểm soát chỉ tiêu sử dụng.`
                  : 'Không có sự thay đổi chỉ số trong kỳ ghi nhận. Nếu bất thường, không quên báo Ban quản lý.'
                : 'Đang không đủ dữ liệu để gợi ý chi tiết. Vui lòng kiểm tra lại chỉ số đầu kỳ và cuối kỳ.'}
            </p>
          </div>
        </div>
      </div>

      <div className='mt-8 flex gap-4'>
        <Link
          to='/my-meter-readings'
          className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50'
        >
          <span className='material-symbols-outlined text-lg'>arrow_back</span>
          Về danh sách chỉ số
        </Link>
      </div>
    </div>
  )
}
