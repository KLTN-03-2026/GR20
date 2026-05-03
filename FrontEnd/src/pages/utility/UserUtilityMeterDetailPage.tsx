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

function statusLabel(status: string) {
  const s = (status || '').toUpperCase()
  if (s === 'ACTIVE') return 'Đang hoạt động'
  if (s === 'BROKEN') return 'Sự cố / bảo trì'
  return status || '---'
}

function iconForMeterType(t?: string) {
  if (t === 'WATER') return 'water_drop'
  if (t === 'GAS') return 'local_fire_department'
  return 'bolt'
}

export default function UserUtilityMeterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useContext(AppContext)
  const userId = String((user as any)?.id || (user as any)?._id || '')

  const meterQuery = useQuery({
    queryKey: ['user-utility-meter-detail', userId, id],
    queryFn: () => utilityMetersApi.getByUserIdAndMeterId(userId, String(id)),
    enabled: Boolean(userId && id)
  })

  const meter = meterQuery.data?.data?.data ?? null

  const readingsQuery = useQuery({
    queryKey: ['user-meter-readings-by-meter-detail', userId, id],
    queryFn: () => meterReadingsApi.getByUserIdAndMeterId(userId, String(id), { page: 0, size: 24 }),
    enabled: Boolean(userId && id && meter)
  })

  const readings = (readingsQuery.data?.data?.data ?? []) as Array<{
    id: string
    readingDate?: string
    previousReading?: number
    currentReading?: number
    consumption?: number
  }>

  const fmtDate = (s?: string) => (!s ? '---' : new Date(s).toLocaleDateString('vi-VN'))
  const fmtNum = (n?: number | null) =>
    n === undefined || n === null ? '—' : new Intl.NumberFormat('vi-VN').format(Number(n))

  if (!userId) {
    return (
      <div className='pb-8'>
        <p className='text-center text-slate-500'>Vui lòng đăng nhập.</p>
      </div>
    )
  }

  if (meterQuery.isLoading) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center text-slate-400'>
        <span className='material-symbols-outlined animate-spin'>sync</span>
        <span className='ml-2 text-sm'>Đang tải dữ liệu...</span>
      </div>
    )
  }

  if (!meter) {
    return (
      <div className='pb-8'>
        <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
          <Link to='/' className='hover:text-blue-500'>
            Trang chủ
          </Link>
          <span className='material-symbols-outlined text-xs'>chevron_right</span>
          <Link to='/my-utility-meters' className='hover:text-blue-500'>
            Đồng hồ của tôi
          </Link>
          <span className='material-symbols-outlined text-xs'>chevron_right</span>
          <span className='font-semibold text-blue-600'>Chi tiết</span>
        </nav>
        <div className='rounded-2xl border border-slate-100 bg-white py-16 text-center'>
          <span className='material-symbols-outlined mx-auto mb-4 block text-5xl text-slate-200'>electric_meter</span>
          <p className='font-semibold text-slate-600'>Không tìm thấy đồng hồ</p>
          <p className='mx-auto mt-2 max-w-md text-sm text-slate-400'>
            Đồng hồ có thể đã ngừng gắn với căn của bạn (trạng thái INACTIVE) hoặc bạn không có quyền xem.
          </p>
          <button type='button' className='mt-4 text-sm font-bold text-blue-600 hover:underline' onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  const st = (meter.status || '').toUpperCase()
  const statusClass =
    st === 'ACTIVE'
      ? 'bg-emerald-100 text-emerald-800'
      : st === 'BROKEN'
        ? 'bg-amber-100 text-amber-900'
        : 'bg-slate-100 text-slate-700'

  return (
    <div className='pb-10'>
      <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
        <Link to='/' className='hover:text-blue-500'>
          Trang chủ
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <Link to='/my-utility-meters' className='hover:text-blue-500'>
          Đồng hồ của tôi
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <span className='font-semibold text-blue-600'>Chi tiết đồng hồ</span>
      </nav>

      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-extrabold text-slate-900'>Chi tiết đồng hồ</h1>
        <div className='h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-700' />
        <p className='mt-2 text-sm text-slate-500'>
          {meter.meterCode ? `Mã ${meter.meterCode}` : `ID #${meter.id}`}
          {meter.apartmentCode ? ` — Căn ${meter.apartmentCode}` : meter.apartmentId != null ? ` — Căn (ID ${meter.apartmentId})` : ''}
          {meter.buildingName ? ` — ${meter.buildingName}` : ''}
        </p>
      </div>

      <div className='relative mb-8 flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8'>
        <div className='flex items-center gap-6'>
          <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50'>
            <span className='material-symbols-outlined text-3xl text-blue-600' style={{ fontVariationSettings: "'FILL' 1" }}>
              {iconForMeterType(meter.meterType)}
            </span>
          </div>
          <div className='min-w-0'>
            <h2 className='truncate text-xl font-bold text-slate-900 md:text-2xl'>{meter.meterCode || `Đồng hồ #${meter.id}`}</h2>
            <p className='text-slate-500'>
              Loại <span className='font-semibold text-slate-700'>{meterTypeLabel(String(meter.meterType || ''))}</span>
              {meter.installedDate ? (
                <>
                  {' '}
                  · Lắp đặt {fmtDate(String(meter.installedDate))}
                </>
              ) : null}
            </p>
          </div>
        </div>
        <span className={`inline-flex shrink-0 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wide ${statusClass}`}>
          {statusLabel(String(meter.status || ''))}
        </span>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        <div className='rounded-2xl border border-slate-100 bg-white p-8 shadow-sm lg:col-span-5'>
          <div className='mb-4 flex items-center gap-3'>
            <span className='material-symbols-outlined text-blue-600'>apartment</span>
            <h3 className='text-xs font-bold uppercase tracking-widest text-slate-400'>Vị trí &amp; mã</h3>
          </div>
          <dl className='space-y-4 text-sm'>
            <div>
              <dt className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Mã đồng hồ</dt>
              <dd className='mt-0.5 font-semibold text-slate-900'>{meter.meterCode || '—'}</dd>
            </div>
            <div>
              <dt className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Căn hộ</dt>
              <dd className='mt-0.5 font-semibold text-slate-900'>
                {meter.apartmentCode ? `Căn ${meter.apartmentCode}` : meter.apartmentId != null ? `ID ${meter.apartmentId}` : '—'}
              </dd>
            </div>
            <div>
              <dt className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Tòa nhà</dt>
              <dd className='mt-0.5 text-slate-700'>{meter.buildingName || '—'}</dd>
            </div>
            <div>
              <dt className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Ngày lắp đặt</dt>
              <dd className='mt-0.5 text-slate-700'>{meter.installedDate ? fmtDate(String(meter.installedDate)) : '—'}</dd>
            </div>
          </dl>
        </div>

        <div className='rounded-2xl border border-slate-100 bg-white p-2 shadow-sm lg:col-span-7'>
          <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
            <div className='flex items-center gap-2'>
              <span className='material-symbols-outlined text-lg text-blue-600'>history</span>
              <h3 className='text-sm font-bold text-slate-800'>Lịch sử chỉ số gần đây</h3>
            </div>
            <Link
              to='/my-meter-readings'
              className='text-xs font-bold text-blue-600 hover:underline'
            >
              Xem tất cả chỉ số
            </Link>
          </div>
          {readingsQuery.isLoading ? (
            <div className='flex justify-center py-12 text-slate-400'>
              <span className='material-symbols-outlined animate-spin'>sync</span>
            </div>
          ) : readings.length === 0 ? (
            <p className='px-6 py-10 text-center text-sm text-slate-500'>Chưa có bản ghi chỉ số cho đồng hồ này.</p>
          ) : (
            <div className='divide-y divide-slate-100'>
              {readings.map((r) => (
                <Link
                  key={String(r.id)}
                  to={`/my-meter-readings/${String(r.id)}`}
                  className='flex items-center justify-between gap-4 px-6 py-3 transition-colors hover:bg-slate-50'
                >
                  <div>
                    <p className='text-sm font-semibold text-slate-800'>{fmtDate(r.readingDate)}</p>
                    <p className='text-xs text-slate-500'>
                      Cũ {fmtNum(r.previousReading)} → Mới {fmtNum(r.currentReading)}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold tabular-nums text-emerald-700'>
                      +{fmtNum(r.consumption)}
                    </span>
                    <span className='material-symbols-outlined text-slate-300'>chevron_right</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className='relative mt-8 h-36 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-800 to-blue-950'>
        <div className='relative z-10 flex h-full items-center px-6 sm:px-10'>
          <div className='max-w-lg rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md'>
            <div className='mb-1 flex items-center gap-2'>
              <span className='material-symbols-outlined text-sm text-blue-300'>auto_awesome</span>
              <span className='text-[10px] font-bold uppercase tracking-widest text-blue-100'>Homelink AI Insight</span>
            </div>
            <p className='text-sm leading-relaxed text-white/95'>
              {st === 'BROKEN'
                ? 'Đồng hồ đang ở trạng thái cần xử lý. Vui lòng báo Ban quản lý để được kiểm tra — chỉ số có thể tạm dừng cập nhật.'
                : 'Theo dõi tiêu thụ theo từng kỳ trong bảng trên và so sánh với tháng trước để chủ động quản lý điện nước cho căn hộ của bạn.'}
            </p>
          </div>
        </div>
      </div>

      <Link
        to='/my-utility-meters'
        className='mt-8 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50'
      >
        <span className='material-symbols-outlined text-lg'>arrow_back</span>
        Về danh sách đồng hồ
      </Link>
    </div>
  )
}
