import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { UtilityPricing } from 'src/types/utility-pricing.type'
import { utilityPricingApi } from 'src/apis/utility_api/utility-pricing.api'

function meterTypeLabel(t: string) {
  if (t === 'ELECTRIC') return 'Điện'
  if (t === 'WATER') return 'Nước'
  if (t === 'GAS') return 'Gas'
  return t
}

function iconForType(t?: string) {
  if (t === 'WATER') return 'water_drop'
  if (t === 'GAS') return 'local_fire_department'
  return 'bolt'
}

export default function UserUtilityPricingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['utility-pricing-detail', id],
    queryFn: () => utilityPricingApi.getById(String(id)),
    enabled: Boolean(id)
  })

  const row = data?.data?.data as UtilityPricing | undefined

  const fmtMoney = (n: number) => new Intl.NumberFormat('vi-VN').format(Number(n) || 0)
  const fmtDate = (s?: string) => (!s ? '—' : new Date(s).toLocaleDateString('vi-VN'))

  if (isLoading) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center text-slate-400'>
        <span className='material-symbols-outlined animate-spin'>sync</span>
        <span className='ml-2 text-sm'>Đang tải...</span>
      </div>
    )
  }

  if (isError || !row) {
    return (
      <div className='pb-10'>
        <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
          <Link to='/' className='hover:text-blue-500'>
            Trang chủ
          </Link>
          <span className='material-symbols-outlined text-xs'>chevron_right</span>
          <Link to='/utility-pricing' className='hover:text-blue-500'>
            Bảng giá tiện ích
          </Link>
          <span className='material-symbols-outlined text-xs'>chevron_right</span>
          <span className='font-semibold text-blue-600'>Chi tiết</span>
        </nav>
        <div className='rounded-2xl border border-slate-100 bg-white py-16 text-center'>
          <span className='material-symbols-outlined mx-auto mb-4 block text-5xl text-slate-200'>request_quote</span>
          <p className='font-semibold text-slate-700'>Không tìm thấy biểu giá</p>
          <button type='button' className='mt-4 text-sm font-bold text-blue-600 hover:underline' onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  const active = row.isActive !== false && row.isActive !== undefined ? row.isActive : true

  return (
    <div className='pb-10'>
      <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
        <Link to='/' className='hover:text-blue-500'>
          Trang chủ
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <Link to='/utility-pricing' className='hover:text-blue-500'>
          Bảng giá tiện ích
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <span className='font-semibold text-blue-600'>Chi tiết giá đơn vị</span>
      </nav>

      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-extrabold text-slate-900'>Chi tiết bảng giá</h1>
        <div className='h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-700' />
        <p className='mt-2 text-sm text-slate-500'>
          {meterTypeLabel(String(row.meterType || ''))} · Mã bản ghi #{row.id}
        </p>
      </div>

      <div className='relative mb-8 flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8'>
        <div className='flex items-center gap-6'>
          <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-50'>
            <span className='material-symbols-outlined text-3xl text-amber-600'>{iconForType(row.meterType)}</span>
          </div>
          <div>
            <h2 className='text-xl font-bold text-slate-900 md:text-2xl'>{meterTypeLabel(String(row.meterType))}</h2>
            <p className='text-slate-500'>Đơn vị tính: {row.unit || '—'}</p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wide ${
            active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
          }`}
        >
          {active ? 'Đang áp dụng' : 'Không áp dụng'}
        </span>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        <div className='rounded-2xl border border-slate-100 bg-white p-8 shadow-sm lg:col-span-7'>
          <div className='mb-4 flex items-center gap-3'>
            <span className='material-symbols-outlined text-blue-600'>payments</span>
            <h3 className='text-xs font-bold uppercase tracking-widest text-slate-400'>Đơn giá</h3>
          </div>
          <p className='text-3xl font-extrabold tabular-nums text-slate-900'>
            {fmtMoney(row.pricePerUnit)} <span className='text-lg font-semibold text-slate-500'>₫/{row.unit}</span>
          </p>
          <p className='mt-2 text-sm text-slate-500'>Giá không bao gồm các khoản thuế (nếu BQL có quy định riêng).</p>
        </div>

        <div className='rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 p-8 text-white shadow-sm lg:col-span-5'>
          <div className='mb-4 flex items-center gap-3'>
            <span className='material-symbols-outlined'>event</span>
            <h3 className='text-xs font-bold uppercase tracking-widest text-white/80'>Hiệu lực</h3>
          </div>
          <p className='text-xl font-bold'>{fmtDate(row.effectiveFrom)}</p>
          {row.createdAt && <p className='mt-2 text-sm text-white/75'>Cập nhật hệ thống: {fmtDate(row.createdAt)}</p>}
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
              Bạn có thể đối chiếu chỉ số đồng hồ (kWh, m³, …) trong trang chỉ số của tôi với đơn giá này để ước tính chi phí
              trước khi có hóa đơn chính thức từ Ban quản lý.
            </p>
          </div>
        </div>
      </div>

      <Link
        to='/utility-pricing'
        className='mt-8 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50'
      >
        <span className='material-symbols-outlined text-lg'>arrow_back</span>
        Về danh sách giá
      </Link>
    </div>
  )
}
