import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useContext, useState } from 'react'
import { utilityMetersApi } from 'src/apis/utility_api/utility-meters.api'
import { AppContext } from 'src/contexts/app.context'
import type { UtilityMeter } from 'src/types/utility-meter.type'

function meterTypeLabel(t: string) {
  if (t === 'ELECTRIC') return 'Điện'
  if (t === 'WATER') return 'Nước'
  if (t === 'GAS') return 'Gas'
  return t
}

function iconForMeterType(t?: UtilityMeter['meterType']) {
  if (t === 'WATER') return 'water_drop'
  if (t === 'GAS') return 'local_fire_department'
  return 'bolt'
}

/** Chỉ hiển thị đồng hồ do API trả về — BE đã loại INACTIVE cho cư dân. Double-check FE. */
function activeMeters(list: UtilityMeter[]): UtilityMeter[] {
  return list.filter((m) => String((m as any)?.status ?? '').toUpperCase() !== 'INACTIVE')
}

export default function UserUtilityMetersPage() {
  const { user } = useContext(AppContext)
  const userId = String((user as any)?.id || (user as any)?._id || '')
  const [page, setPage] = useState(0)
  const pageSize = 10

  const { data, error, isError, isLoading } = useQuery({
    queryKey: ['user-utility-meters', userId, page],
    queryFn: () => utilityMetersApi.getByUserId(userId, { page, size: pageSize }),
    enabled: Boolean(userId)
  })

  const rawList = ((data?.data?.data ?? []) as UtilityMeter[]) || []
  const list = activeMeters(rawList)
  const totalPages = Math.max(1, Number(data?.data?.totalPages ?? 1))
  const totalElements = Number(data?.data?.totalElements ?? list.length ?? 0)
  const currentPage = Number(data?.data?.page ?? 0)

  const fmtDate = (s?: string) => (!s ? '—' : new Date(s).toLocaleDateString('vi-VN'))

  function statusChip(status?: string) {
    const s = (status || '').toUpperCase()
    if (s === 'ACTIVE') return 'bg-emerald-100 text-emerald-800'
    if (s === 'BROKEN') return 'bg-amber-100 text-amber-900'
    return 'bg-slate-100 text-slate-700'
  }

  if (!userId) {
    return (
      <div className='pb-8'>
        <p className='text-center text-slate-500'>Vui lòng đăng nhập để xem đồng hồ của bạn.</p>
      </div>
    )
  }

  return (
    <div className='pb-10'>
      <nav className='mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400'>
        <Link to='/' className='transition-colors hover:text-blue-500'>
          Trang chủ
        </Link>
        <span className='material-symbols-outlined text-xs'>chevron_right</span>
        <span className='font-semibold text-blue-600'>Đồng hồ tiện ích</span>
      </nav>

      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-extrabold text-slate-900'>Đồng hồ của tôi</h1>
        <div className='h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-700' />
        <p className='mt-2 max-w-xl text-sm text-slate-500'>
          Đồng hồ đã <strong className='text-slate-600'>ngưng hoạt động</strong> (INACTIVE) không hiển thị ở đây.
          Chọn một dòng để xem chi tiết và lịch sử chỉ số.
        </p>
      </div>

      {isError && (
        <div className='mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
          Không tải được danh sách đồng hồ (mã {(error as any)?.response?.status ?? '?'})
        </div>
      )}

      <div className='hidden xl:block'>
        <div className='mb-3 rounded-2xl border border-slate-100 bg-white shadow-sm'>
          <div className='grid grid-cols-12 gap-3 px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-500'>
            <div className='col-span-4'>Đồng hồ</div>
            <div className='col-span-2'>Loại</div>
            <div className='col-span-2'>Căn hộ</div>
            <div className='col-span-2'>Ngày lắp</div>
            <div className='col-span-2 text-right'></div>
          </div>
          <div className='divide-y divide-slate-100'>
            {isLoading && (
              <div className='flex justify-center px-6 py-12 text-slate-400'>
                <span className='material-symbols-outlined animate-spin'>sync</span>
                <span className='ml-2 text-sm'>Đang tải...</span>
              </div>
            )}
            {!isLoading &&
              list.map((item) => (
                  <Link
                    key={String(item.id)}
                    to={`/invoices/${String(item.id)}`}
                    className='grid grid-cols-12 items-center gap-3 px-6 py-4 transition-colors hover:bg-slate-50'
                  >
                    <div className='col-span-4 flex min-w-0 items-center gap-3'>
                      <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50'>
                        <span className='material-symbols-outlined text-blue-600' style={{ fontVariationSettings: "'FILL' 1" }}>
                          {iconForMeterType(item.meterType)}
                        </span>
                      </div>
                      <div className='min-w-0'>
                        <p className='truncate font-bold text-slate-900'>{item.meterCode}</p>
                        <p className='truncate text-xs text-slate-500'>ID #{item.id}</p>
                      </div>
                    </div>
                    <div className='col-span-2 text-sm text-slate-700'>{meterTypeLabel(String(item.meterType))}</div>
                    <div className='col-span-2 text-sm'>
                      <span className='font-semibold text-slate-800'>
                        {item.apartmentCode ? `Căn ${item.apartmentCode}` : `#${item.apartmentId ?? '—'}`}
                      </span>
                      {item.buildingName ? <p className='truncate text-xs text-slate-500'>{item.buildingName}</p> : null}
                    </div>
                    <div className='col-span-2 text-sm tabular-nums text-slate-600'>{fmtDate(item.installedDate)}</div>
                    <div className='col-span-2 flex items-center justify-end gap-3'>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusChip(item.status)}`}>
                        {item.status === 'ACTIVE' ? 'Hoạt động' : item.status === 'BROKEN' ? 'Sự cố' : item.status || '---'}
                      </span>
                      <span className='material-symbols-outlined text-slate-300'>chevron_right</span>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </div>

      <div className='space-y-3 xl:hidden'>
        {isLoading && (
          <div className='flex justify-center rounded-2xl border border-slate-100 bg-white py-12 text-slate-400'>
            <span className='material-symbols-outlined animate-spin'>sync</span>
            <span className='ml-2 text-sm'>Đang tải...</span>
          </div>
        )}
        {!isLoading &&
          list.map((item) => (
              <Link
                key={String(item.id)}
                to={`/invoices/${String(item.id)}`}
                className='block rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-colors active:bg-slate-50'
              >
                <div className='flex gap-4'>
                  <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50'>
                    <span className='material-symbols-outlined text-xl text-blue-600'>{iconForMeterType(item.meterType)}</span>
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='font-bold text-slate-900'>{item.meterCode}</p>
                    <p className='text-xs text-slate-500'>{meterTypeLabel(String(item.meterType))}</p>
                    <p className='mt-2 text-xs text-slate-600'>
                      {item.apartmentCode ? `Căn ${item.apartmentCode}` : `Căn #${item.apartmentId ?? '—'}`}
                      {item.buildingName ? ` · ${item.buildingName}` : ''}
                    </p>
                    <div className='mt-2 flex flex-wrap items-center gap-2'>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusChip(item.status)}`}>
                        {item.status || '—'}
                      </span>
                      <span className='text-xs text-slate-400'>Lắp: {fmtDate(item.installedDate)}</span>
                    </div>
                  </div>
                  <span className='material-symbols-outlined self-center text-slate-300'>chevron_right</span>
                </div>
              </Link>
            ))}
      </div>

      {!isLoading && list.length === 0 && (
        <div className='rounded-2xl border border-slate-100 bg-white py-14 text-center text-slate-500'>
          <span className='material-symbols-outlined mx-auto mb-3 block text-5xl text-slate-200'>electric_meter</span>
          <p className='font-semibold'>Chưa có đồng hồ đang hiển thị</p>
          <p className='mx-auto mt-1 max-w-sm text-sm text-slate-400'>
            Nếu bạn vừa được gán vào căn hộ hoặc BQL đã vô hiệu hóa đồng hồ, danh sách có thể trống. Liên hệ BQL để được hỗ trợ.
          </p>
        </div>
      )}

      {list.length > 0 && (
        <div className='mt-8 flex flex-wrap items-center justify-between gap-4'>
          <p className='text-sm text-slate-400'>
            Hiển thị <span className='font-semibold text-slate-600'>{list.length}</span> /{' '}
            <span className='font-semibold text-slate-600'>{totalElements}</span> đồng hồ
          </p>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30'
              disabled={currentPage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              aria-label='Trang trước'
            >
              <span className='material-symbols-outlined text-lg'>chevron_left</span>
            </button>
            <span className='px-3 text-sm font-semibold tabular-nums text-slate-600'>
              {totalPages <= 1 ? '1 / 1' : `${currentPage + 1} / ${totalPages}`}
            </span>
            <button
              type='button'
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30'
              disabled={totalPages <= 1 || currentPage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              aria-label='Trang sau'
            >
              <span className='material-symbols-outlined text-lg'>chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
