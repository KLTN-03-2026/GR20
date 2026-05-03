import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useContext, useState } from 'react'
import { meterReadingsApi } from 'src/apis/utility_api/meter-readings.api'
import { AppContext } from 'src/contexts/app.context'

export default function UserMeterReadingsPage() {
  const { user } = useContext(AppContext)
  const userId = String((user as any)?.id || (user as any)?._id || '')
  const [page, setPage] = useState(0)
  const pageSize = 10

  const { data, error, isError, isLoading } = useQuery({
    queryKey: ['user-meter-readings', userId, page],
    queryFn: () => meterReadingsApi.getByUserId(userId, { page, size: pageSize }),
    enabled: Boolean(userId)
  })

  const list = (data?.data?.data ?? []) as Array<{
    id: string
    meterId?: number
    readingDate?: string
    previousReading?: number
    currentReading?: number
    consumption?: number
  }>

  const totalPages = Math.max(1, Number(data?.data?.totalPages ?? 1))
  const totalElements = Number(data?.data?.totalElements ?? list.length ?? 0)
  const currentPage = Number(data?.data?.page ?? 0)

  const fmtDate = (s?: string) => {
    if (!s) return '—'
    return new Date(s).toLocaleDateString('vi-VN')
  }

  const fmtNum = (n?: number | null) =>
    n === undefined || n === null ? '—' : new Intl.NumberFormat('vi-VN').format(Number(n))

  if (!userId) {
    return (
      <div className='pb-8'>
        <p className='text-center text-slate-500'>Vui lòng đăng nhập để xem chỉ số của bạn.</p>
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
        <span className='font-semibold text-blue-600'>Chỉ số đồng hồ</span>
      </nav>

      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-extrabold text-slate-900'>Chỉ số đồng hồ của tôi</h1>
        <div className='h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-700' />
        <p className='mt-2 text-sm text-slate-500'>
          Theo dõi lịch sử ghi chỉ số các đồng hồ gắn với căn hộ của bạn — nhấn vào một dòng để xem chi tiết.
        </p>
      </div>

      {isError && (
        <div className='mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
          Không tải được danh sách (mã {(error as any)?.response?.status ?? '?'})
        </div>
      )}

      {/* Header bảng (desktop) */}
      <div className='hidden lg:block'>
        <div className='mb-3 rounded-2xl border border-slate-100 bg-white shadow-sm'>
          <div className='grid grid-cols-12 gap-3 px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-500'>
            <div className='col-span-4'>Đồng hồ &amp; kỳ</div>
            <div className='col-span-2 text-center'>Chỉ số cũ</div>
            <div className='col-span-2 text-center'>Chỉ số mới</div>
            <div className='col-span-2 text-center'>Tiêu thụ</div>
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
                  to={`/my-meter-readings/${String(item.id)}`}
                  className='grid grid-cols-12 items-center gap-3 px-6 py-4 transition-colors hover:bg-slate-50'
                >
                  <div className='col-span-4 min-w-0'>
                    <p className='font-semibold text-slate-800'>Đồng hồ #{item.meterId ?? '—'}</p>
                    <p className='text-xs text-slate-500'>Ngày ghi chỉ số · {fmtDate(item.readingDate)}</p>
                  </div>
                  <div className='col-span-2 text-center font-mono text-sm tabular-nums text-slate-700'>
                    {fmtNum(item.previousReading)}
                  </div>
                  <div className='col-span-2 text-center font-mono text-sm tabular-nums text-slate-700'>
                    {fmtNum(item.currentReading)}
                  </div>
                  <div className='col-span-2 text-center'>
                    <span className='rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold tabular-nums text-emerald-700'>
                      {fmtNum(item.consumption)}
                    </span>
                  </div>
                  <div className='col-span-2 flex justify-end text-slate-300'>
                    <span className='material-symbols-outlined'>chevron_right</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Cards (mobile / tablet) */}
      <div className='space-y-3 lg:hidden'>
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
              to={`/my-meter-readings/${String(item.id)}`}
              className='block rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-colors active:bg-slate-50'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span
                      className='material-symbols-outlined text-xl text-blue-600'
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      bolt
                    </span>
                    <span className='font-bold text-slate-900'>Đồng hồ #{item.meterId ?? '—'}</span>
                  </div>
                  <p className='mt-1 text-xs text-slate-500'>Ghi chỉ số ngày {fmtDate(item.readingDate)}</p>
                  <div className='mt-3 flex gap-6 text-xs text-slate-600'>
                    <span>
                      Cũ: <span className='font-semibold tabular-nums text-slate-900'>{fmtNum(item.previousReading)}</span>
                    </span>
                    <span>
                      Mới: <span className='font-semibold tabular-nums text-slate-900'>{fmtNum(item.currentReading)}</span>
                    </span>
                  </div>
                </div>
                <div className='shrink-0 text-right'>
                  <div className='rounded-xl bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700'>
                    Tiêu thụ
                  </div>
                  <p className='mt-1 text-lg font-extrabold tabular-nums text-emerald-700'>{fmtNum(item.consumption)}</p>
                </div>
              </div>
            </Link>
          ))}
      </div>

      {!isLoading && list.length === 0 && (
        <div className='rounded-2xl border border-slate-100 bg-white py-14 text-center text-slate-500'>
          <span className='material-symbols-outlined mx-auto mb-3 block text-5xl text-slate-200'>electric_meter</span>
          <p className='font-semibold'>Chưa có bản ghi chỉ số</p>
          <p className='mx-auto mt-1 max-w-sm text-sm text-slate-400'>
            Khi BQL nhập chỉ số cho đồng hộ tại căn của bạn, dữ liệu sẽ hiển thị tại đây.
          </p>
        </div>
      )}

      {list.length > 0 && (
        <div className='mt-8 flex flex-wrap items-center justify-between gap-4'>
          <p className='text-sm text-slate-400'>
            Hiển thị <span className='font-semibold text-slate-600'>{list.length}</span> / {totalElements} bản ghi
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
