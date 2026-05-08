import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { utilityPricingApi } from 'src/apis/utility_api/utility-pricing.api'

export default function UserUtilityPricingPage() {
  const [meterType, setMeterType] = useState<'ALL' | 'ELECTRIC' | 'WATER' | 'GAS'>('ALL')

  const { data, error, isError, isLoading } = useQuery({
    queryKey: ['user-utility-pricing-active'],
    queryFn: () => utilityPricingApi.getActive()
  })

  const list = (data?.data?.data || []) as any[]
  const filteredList = useMemo(() => {
    if (meterType === 'ALL') return list
    return list.filter((x) => x.meterType === meterType)
  }, [list, meterType])

  const summary = useMemo(() => {
    return {
      total: list.length,
      electric: list.filter((x) => x.meterType === 'ELECTRIC').length,
      water: list.filter((x) => x.meterType === 'WATER').length,
      gas: list.filter((x) => x.meterType === 'GAS').length
    }
  }, [list])

  const fmtMoney = (n: number) => new Intl.NumberFormat('vi-VN').format(Number(n) || 0)

  return (
    <div className='pb-10'>
      <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
        <Link to='/' className='hover:text-blue-500'>
          Trang chủ
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <span className='font-semibold text-blue-600'>Bảng giá tiện ích</span>
      </nav>

      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-extrabold text-slate-900'>Bảng giá tiện ích</h1>
        <div className='h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-700' />
        <p className='mt-2 text-sm text-slate-500'>Giá đang áp dụng trên địa bàn • chọn một dòng để xem chi tiết.</p>
      </div>

      <div className='mb-6 grid grid-cols-2 gap-3 md:grid-cols-4'>
        <div className='rounded-2xl border border-slate-100 bg-white p-4 shadow-sm'>
          <p className='text-xs text-slate-500'>Tổng mục</p>
          <p className='mt-1 text-2xl font-bold text-slate-900'>{summary.total}</p>
        </div>
        <div className='rounded-2xl border border-slate-100 bg-white p-4 shadow-sm'>
          <p className='text-xs text-slate-500'>Điện</p>
          <p className='mt-1 text-2xl font-bold text-amber-600'>{summary.electric}</p>
        </div>
        <div className='rounded-2xl border border-slate-100 bg-white p-4 shadow-sm'>
          <p className='text-xs text-slate-500'>Nước</p>
          <p className='mt-1 text-2xl font-bold text-sky-600'>{summary.water}</p>
        </div>
        <div className='rounded-2xl border border-slate-100 bg-white p-4 shadow-sm'>
          <p className='text-xs text-slate-500'>Gas</p>
          <p className='mt-1 text-2xl font-bold text-emerald-600'>{summary.gas}</p>
        </div>
      </div>

      {isError && (
        <div className='mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {(error as any)?.response?.data?.message || 'Tải bảng giá thất bại'}
        </div>
      )}

      <div className='mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm'>
        <select
          value={meterType}
          onChange={(e) => setMeterType(e.target.value as typeof meterType)}
          className='w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 md:max-w-xs'
        >
          <option value='ALL'>Tất cả loại</option>
          <option value='ELECTRIC'>Điện</option>
          <option value='WATER'>Nước</option>
          <option value='GAS'>Gas</option>
        </select>
      </div>

      <div className='rounded-2xl border border-slate-100 bg-white shadow-sm'>
        <div className='hidden lg:block'>
          <div className='grid grid-cols-12 gap-3 px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-500'>
            <div className='col-span-3'>Loại</div>
            <div className='col-span-3'>Đơn giá</div>
            <div className='col-span-2'>Đơn vị</div>
            <div className='col-span-2'>Hiệu lực</div>
            <div className='col-span-2 text-right' />
          </div>
          <div className='divide-y divide-slate-100'>
            {isLoading && (
              <div className='flex justify-center px-6 py-10 text-slate-400'>
                <span className='material-symbols-outlined animate-spin'>sync</span>
                <span className='ml-2 text-sm'>Đang tải...</span>
              </div>
            )}
            {!isLoading &&
              filteredList.map((item: any) => (
                <Link
                  key={item.id}
                  to={`/utility-pricing/${String(item.id)}`}
                  className='grid grid-cols-12 items-center gap-3 px-6 py-4 transition-colors hover:bg-slate-50'
                >
                  <div className='col-span-3 font-semibold text-slate-900'>{item.meterType}</div>
                  <div className='col-span-3 tabular-nums text-slate-800'>{fmtMoney(Number(item.pricePerUnit))}</div>
                  <div className='col-span-2 text-slate-600'>{item.unit}</div>
                  <div className='col-span-2 text-sm tabular-nums text-slate-600'>
                    {String(item.effectiveFrom || '').slice(0, 10) || '—'}
                  </div>
                  <div className='col-span-2 flex justify-end text-slate-300'>
                    <span className='material-symbols-outlined'>chevron_right</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
        <div className='divide-y divide-slate-100 lg:hidden'>
          {isLoading ? (
            <div className='flex justify-center py-12 text-slate-400'>
              <span className='material-symbols-outlined animate-spin'>sync</span>
            </div>
          ) : (
            filteredList.map((item: any) => (
              <Link
                key={item.id}
                to={`/utility-pricing/${String(item.id)}`}
                className='block px-4 py-4 active:bg-slate-50'
              >
                <p className='font-bold text-slate-900'>{item.meterType}</p>
                <p className='mt-1 text-sm text-slate-600'>
                  {fmtMoney(Number(item.pricePerUnit))} / {item.unit}
                </p>
                <p className='mt-1 text-xs text-slate-400'>
                  Hiệu lực: {String(item.effectiveFrom || '').slice(0, 10) || '—'}
                </p>
              </Link>
            ))
          )}
        </div>
        {!isLoading && filteredList.length === 0 && (
          <p className='px-6 py-12 text-center text-sm text-slate-500'>Chưa có bảng giá đang áp dụng.</p>
        )}
      </div>
    </div>
  )
}
