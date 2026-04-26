import { useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { meterReadingsApi } from 'src/apis/utility_api/meter-readings.api'
import { AppContext } from 'src/contexts/app.context'

const logApiError = (action: string, err: any) => {
  console.error(`[UserMeterReadings][${action}] error`, {
    status: err?.response?.status,
    endpoint: err?.config?.url || err?.response?.config?.url,
    method: err?.config?.method || err?.response?.config?.method,
    data: err?.response?.data,
    message: err?.message
  })
}

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

  if (isError) logApiError('GetByUserId', error)

  const list = data?.data?.data || []
  const totalPages = Number(data?.data?.totalPages || 0)
  const currentPage = Number(data?.data?.page || 0)

  return (
    <div className='min-h-screen bg-slate-50 px-6 py-6'>
      <div className='mx-auto max-w-6xl'>
        <h2 className='mb-4 text-3xl font-extrabold tracking-tight text-slate-900'>Chỉ số hàng tháng của tôi</h2>
        <div className='overflow-hidden rounded-xl bg-white shadow-sm'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='bg-slate-50'>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>ID</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Ngày ghi</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Chỉ số cũ</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Chỉ số mới</th>
                <th className='px-4 py-3 text-xs font-bold uppercase text-slate-500'>Tiêu thụ</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {isLoading && (
                <tr>
                  <td className='px-4 py-4 text-sm text-slate-500' colSpan={5}>
                    Đang tải...
                  </td>
                </tr>
              )}
              {!isLoading &&
                list.map((item) => (
                  <tr key={item.id}>
                    <td className='px-4 py-3'>{item.id}</td>
                    <td className='px-4 py-3'>{item.readingDate}</td>
                    <td className='px-4 py-3'>{item.previousReading}</td>
                    <td className='px-4 py-3'>{item.currentReading}</td>
                    <td className='px-4 py-3'>{item.consumption}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className='mt-4 flex items-center justify-end gap-2 text-sm'>
          <button
            type='button'
            className='rounded bg-slate-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
            disabled={currentPage <= 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            Trang trước
          </button>
          <span>
            Trang {totalPages === 0 ? 0 : currentPage + 1}/{totalPages}
          </span>
          <button
            type='button'
            className='rounded bg-slate-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
            disabled={totalPages === 0 || currentPage + 1 >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  )
}
